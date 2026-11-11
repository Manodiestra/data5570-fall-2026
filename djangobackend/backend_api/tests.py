import time
import uuid
from types import SimpleNamespace
from unittest import mock

import jwt
from cryptography.hazmat.primitives.asymmetric import ec
from django.conf import settings
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Calendar, Event, User

# Stand-in for the Supabase project's signing key. The JWKS client is patched
# to return its public half, so tokens are verified for real but offline.
PRIVATE_KEY = ec.generate_private_key(ec.SECP256R1())
OTHER_KEY = ec.generate_private_key(ec.SECP256R1())


def make_token(sub=None, email="user@example.com", key=PRIVATE_KEY, **overrides):
    now = int(time.time())
    claims = {
        "sub": str(sub or uuid.uuid4()),
        "email": email,
        "aud": "authenticated",
        "iss": f"{settings.SUPABASE_URL}/auth/v1",
        "role": "authenticated",
        "iat": now,
        "exp": now + 3600,
        **overrides,
    }
    return jwt.encode(claims, key, algorithm="ES256", headers={"kid": "test"})


class SupabaseAuthTestCase(TestCase):
    def setUp(self):
        fake_jwks = SimpleNamespace(
            get_signing_key_from_jwt=lambda token: SimpleNamespace(key=PRIVATE_KEY.public_key())
        )
        patcher = mock.patch("backend_api.authentication._jwks_client", fake_jwks)
        patcher.start()
        self.addCleanup(patcher.stop)
        self.client = APIClient()

    def authenticate(self, token):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")


class AuthenticationTests(SupabaseAuthTestCase):
    def test_no_token_is_401(self):
        self.assertEqual(self.client.get("/api/calendars/").status_code, 401)

    def test_valid_token_creates_user_once(self):
        sub = uuid.uuid4()
        self.authenticate(make_token(sub=sub, email="new@example.com"))
        self.assertEqual(self.client.get("/api/calendars/").status_code, 200)
        self.assertEqual(self.client.get("/api/calendars/").status_code, 200)

        user = User.objects.get(supabase_id=sub)
        self.assertEqual(user.email, "new@example.com")
        self.assertFalse(user.has_usable_password())
        self.assertEqual(User.objects.count(), 1)

    def test_rejects_bad_tokens(self):
        bad_tokens = {
            "wrong key": make_token(key=OTHER_KEY),
            "expired": make_token(exp=int(time.time()) - 3600),
            "wrong audience": make_token(aud="anon"),
            "wrong issuer": make_token(iss="https://evil.supabase.co/auth/v1"),
            "garbage": "not-a-jwt",
        }
        for name, token in bad_tokens.items():
            with self.subTest(name):
                self.authenticate(token)
                self.assertEqual(self.client.get("/api/calendars/").status_code, 401)
        self.assertEqual(User.objects.count(), 0)

    def test_does_not_take_over_existing_account_by_email(self):
        User.objects.create_superuser(email="admin@example.com", password="pw", display_name="A")
        self.authenticate(make_token(email="admin@example.com"))
        self.assertEqual(self.client.get("/api/calendars/").status_code, 401)
        self.assertIsNone(User.objects.get(email="admin@example.com").supabase_id)

    def test_me(self):
        self.authenticate(make_token(email="me@example.com"))
        response = self.client.get("/api/users/me/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["email"], "me@example.com")

        response = self.client.patch("/api/users/me/", {"display_name": "Me"}, format="json")
        self.assertEqual(response.json()["display_name"], "Me")


class OwnershipTests(SupabaseAuthTestCase):
    def setUp(self):
        super().setUp()
        self.alice_token = make_token(email="alice@example.com")
        self.bob_token = make_token(email="bob@example.com")

        self.authenticate(self.bob_token)
        bob_calendar = self.client.post("/api/calendars/", {"name": "Bob's"}, format="json")
        self.bob_calendar_id = bob_calendar.json()["id"]
        self.bob_event_id = self.client.post(
            "/api/events/",
            {"calendar": self.bob_calendar_id, "summary": "Secret", "dtstart": "2026-11-12T10:00:00Z"},
            format="json",
        ).json()["id"]

        self.authenticate(self.alice_token)

    def test_create_sets_owner_and_organizer(self):
        calendar_id = self.client.post("/api/calendars/", {"name": "Mine"}, format="json").json()["id"]
        alice = User.objects.get(email="alice@example.com")
        self.assertEqual(Calendar.objects.get(pk=calendar_id).owner, alice)

        event_id = self.client.post(
            "/api/events/",
            {"calendar": calendar_id, "summary": "Lunch", "dtstart": "2026-11-12T12:00:00Z"},
            format="json",
        ).json()["id"]
        self.assertEqual(Event.objects.get(pk=event_id).organizer, alice)

    def test_cannot_see_other_users_data(self):
        self.assertEqual(self.client.get("/api/calendars/").json(), [])
        self.assertEqual(self.client.get("/api/events/").json(), [])
        self.assertEqual(self.client.get(f"/api/calendars/{self.bob_calendar_id}/").status_code, 404)
        self.assertEqual(self.client.get(f"/api/events/{self.bob_event_id}/").status_code, 404)
        self.assertEqual(len(self.client.get("/api/users/").json()), 1)

    def test_cannot_modify_other_users_data(self):
        self.assertEqual(
            self.client.patch(
                f"/api/events/{self.bob_event_id}/", {"summary": "Hacked"}, format="json"
            ).status_code,
            404,
        )
        self.assertEqual(self.client.delete(f"/api/calendars/{self.bob_calendar_id}/").status_code, 404)
        self.assertEqual(Event.objects.get(pk=self.bob_event_id).summary, "Secret")

    def test_cannot_add_event_to_other_users_calendar(self):
        response = self.client.post(
            "/api/events/",
            {"calendar": self.bob_calendar_id, "summary": "Spam", "dtstart": "2026-11-12T10:00:00Z"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

        my_calendar = self.client.post("/api/calendars/", {"name": "Mine"}, format="json").json()["id"]
        my_event = self.client.post(
            "/api/events/",
            {"calendar": my_calendar, "summary": "Mine", "dtstart": "2026-11-12T10:00:00Z"},
            format="json",
        ).json()["id"]
        response = self.client.patch(
            f"/api/events/{my_event}/", {"calendar": self.bob_calendar_id}, format="json"
        )
        self.assertEqual(response.status_code, 400)
