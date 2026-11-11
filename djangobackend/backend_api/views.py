from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Calendar, Event, User
from .serializers import CalendarSerializer, EventSerializer, UserSerializer

# Every view requires an authenticated user (DEFAULT_PERMISSION_CLASSES in
# settings.py) and only exposes that user's own data. Other users' objects
# 404 rather than 403, so their existence isn't revealed.


class UserViewSet(viewsets.ModelViewSet):
    """The signed-in user's own profile. Accounts are created and deleted
    through Supabase Auth, so there's no create or delete here."""

    serializer_class = UserSerializer
    http_method_names = ["get", "patch", "head", "options"]

    def get_queryset(self):
        return User.objects.filter(pk=self.request.user.pk)

    @action(detail=False, methods=["get", "patch"])
    def me(self, request):
        if request.method == "GET":
            return Response(self.get_serializer(request.user).data)
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class CalendarViewSet(viewsets.ModelViewSet):
    serializer_class = CalendarSerializer

    def get_queryset(self):
        return Calendar.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer

    def get_queryset(self):
        return Event.objects.filter(calendar__owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)
