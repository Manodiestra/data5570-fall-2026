from rest_framework import serializers

from .models import Calendar, Event, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "display_name", "timezone", "created_at", "updated_at"]
        # Supabase owns the email address and password.
        read_only_fields = ["id", "email", "created_at", "updated_at"]


class CalendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calendar
        fields = [
            "id", "owner", "name", "description", "color", "prod_id",
            "ical_version", "calscale", "timezone", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "owner", "prod_id", "ical_version", "calscale", "created_at", "updated_at",
        ]


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            "id", "calendar", "uid", "organizer", "summary", "description", "location",
            "dtstart", "dtend", "duration", "is_all_day", "timezone", "rrule", "rdate",
            "exdate", "recurrence_id", "sequence", "status", "transp", "classification",
            "priority", "categories", "url", "created_at", "updated_at", "dtstamp",
        ]
        # organizer is set to the creating user in EventViewSet.perform_create.
        read_only_fields = ["id", "uid", "organizer", "created_at", "updated_at", "dtstamp"]

    def validate_calendar(self, calendar):
        # Without this, a user could add events to someone else's calendar by id.
        if calendar.owner_id != self.context["request"].user.pk:
            raise serializers.ValidationError("Calendar not found.")
        return calendar

    def validate(self, attrs):
        dtend = attrs.get("dtend", getattr(self.instance, "dtend", None))
        duration = attrs.get("duration", getattr(self.instance, "duration", None))
        if dtend and duration:
            raise serializers.ValidationError(
                "An event may specify dtend or duration, not both (RFC 5545)."
            )
        return attrs
