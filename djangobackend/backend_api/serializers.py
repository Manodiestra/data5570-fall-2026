from rest_framework import serializers

from .models import Calendar, Event, User


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ["id", "email", "display_name", "timezone", "password", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class CalendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calendar
        fields = [
            "id", "owner", "name", "description", "color", "prod_id",
            "ical_version", "calscale", "timezone", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "owner", "created_at", "updated_at"]


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            "id", "calendar", "uid", "organizer", "summary", "description", "location",
            "dtstart", "dtend", "duration", "is_all_day", "timezone", "rrule", "rdate",
            "exdate", "recurrence_id", "sequence", "status", "transp", "classification",
            "priority", "categories", "url", "created_at", "updated_at", "dtstamp",
        ]
        read_only_fields = ["id", "uid", "created_at", "updated_at", "dtstamp"]

    def validate(self, attrs):
        dtend = attrs.get("dtend", getattr(self.instance, "dtend", None))
        duration = attrs.get("duration", getattr(self.instance, "duration", None))
        if dtend and duration:
            raise serializers.ValidationError(
                "An event may specify dtend or duration, not both (RFC 5545)."
            )
        return attrs
