import uuid

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Application account. `password` (inherited) stores the password hash."""

    username = None
    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=255)
    timezone = models.CharField(max_length=64, default="UTC")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["display_name"]

    objects = UserManager()

    def __str__(self):
        return self.email


class Calendar(models.Model):
    """A named collection of events owned by a user. Exports as one VCALENDAR."""

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="calendars")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    color = models.CharField(max_length=7, blank=True, null=True)
    prod_id = models.CharField(max_length=255, default="-//data5570//calendar//EN")
    ical_version = models.CharField(max_length=8, default="2.0")
    calscale = models.CharField(max_length=16, default="GREGORIAN")
    timezone = models.CharField(max_length=64, default="UTC")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Event(models.Model):
    """A single event, corresponding to one VEVENT component."""

    class Status(models.TextChoices):
        TENTATIVE = "TENTATIVE"
        CONFIRMED = "CONFIRMED"
        CANCELLED = "CANCELLED"

    class Transparency(models.TextChoices):
        OPAQUE = "OPAQUE"
        TRANSPARENT = "TRANSPARENT"

    class Classification(models.TextChoices):
        PUBLIC = "PUBLIC"
        PRIVATE = "PRIVATE"
        CONFIDENTIAL = "CONFIDENTIAL"

    calendar = models.ForeignKey(Calendar, on_delete=models.CASCADE, related_name="events")
    uid = models.CharField(max_length=255, unique=True, default=uuid.uuid4)
    organizer = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="organized_events"
    )
    summary = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    dtstart = models.DateTimeField()
    dtend = models.DateTimeField(null=True, blank=True)
    duration = models.DurationField(null=True, blank=True)
    is_all_day = models.BooleanField(default=False)
    timezone = models.CharField(max_length=64, blank=True, null=True)
    rrule = models.CharField(max_length=500, blank=True, null=True)
    rdate = models.JSONField(default=list, blank=True)
    exdate = models.JSONField(default=list, blank=True)
    recurrence_id = models.DateTimeField(null=True, blank=True)
    sequence = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.CONFIRMED)
    transp = models.CharField(max_length=16, choices=Transparency.choices, default=Transparency.OPAQUE)
    classification = models.CharField(
        max_length=16, choices=Classification.choices, default=Classification.PUBLIC
    )
    priority = models.SmallIntegerField(null=True, blank=True)
    categories = models.JSONField(default=list, blank=True)
    url = models.URLField(max_length=2048, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    dtstamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["dtstart"]

    def __str__(self):
        return self.summary
