import jwt
from django.conf import settings
from django.db import IntegrityError, transaction
from rest_framework import authentication, exceptions

from .models import User

# Supabase signs access tokens with the project's asymmetric JWT signing keys
# and publishes the public halves here. PyJWKClient caches the key set and
# refetches it when it sees a key id it doesn't know (e.g. after rotation).
_jwks_client = jwt.PyJWKClient(
    f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json",
    cache_jwk_set=True,
    lifespan=600,
)


class SupabaseJWTAuthentication(authentication.BaseAuthentication):
    """Authenticates `Authorization: Bearer <Supabase access token>`.

    Verifies the token's signature against the project's JWKS, then maps the
    Supabase user (the `sub` claim) to a local User, creating one on first
    sight.
    """

    keyword = "Bearer"

    def authenticate(self, request):
        header = authentication.get_authorization_header(request).split()
        if not header or header[0].lower() != self.keyword.lower().encode():
            # No token: let other authenticators (or the permission check) decide.
            return None
        if len(header) != 2:
            raise exceptions.AuthenticationFailed("Invalid Authorization header.")

        claims = self._decode(header[1].decode())
        return self._get_or_create_user(claims), claims

    def authenticate_header(self, request):
        # Makes DRF answer unauthenticated requests with 401 instead of 403.
        return self.keyword

    def _decode(self, token):
        try:
            signing_key = _jwks_client.get_signing_key_from_jwt(token)
            return jwt.decode(
                token,
                signing_key.key,
                algorithms=["ES256", "RS256"],
                audience="authenticated",
                issuer=f"{settings.SUPABASE_URL}/auth/v1",
                options={"require": ["exp", "sub"]},
                leeway=30,
            )
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed("Token has expired.")
        except (jwt.PyJWKClientError, jwt.InvalidTokenError) as error:
            raise exceptions.AuthenticationFailed(f"Invalid token: {error}")

    def _get_or_create_user(self, claims):
        supabase_id = claims["sub"]
        user = User.objects.filter(supabase_id=supabase_id).first()
        if user is None:
            email = claims.get("email")
            if not email:
                raise exceptions.AuthenticationFailed("Token has no email claim.")
            # Never attach a Supabase login to an existing local account by
            # email: with email confirmation off, anyone could sign up with
            # someone else's address (e.g. the admin's) and take it over.
            try:
                # Savepoint, so the lookup below still works if this fails
                # inside an outer transaction.
                with transaction.atomic():
                    user = User.objects.create_user(
                        email=email,
                        supabase_id=supabase_id,
                        display_name=email.split("@")[0],
                    )
            except IntegrityError:
                # Either a concurrent first request already created this user,
                # or a local account (not linked to Supabase) has this email.
                user = User.objects.filter(supabase_id=supabase_id).first()
                if user is None:
                    raise exceptions.AuthenticationFailed(
                        "A local account already uses this email address."
                    )
        if not user.is_active:
            raise exceptions.AuthenticationFailed("User is inactive.")
        return user
