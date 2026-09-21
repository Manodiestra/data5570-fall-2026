from rest_framework import permissions, viewsets

from .models import Calendar, Event, User
from .serializers import CalendarSerializer, EventSerializer, UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


class CalendarViewSet(viewsets.ModelViewSet):
    queryset = Calendar.objects.all()
    serializer_class = CalendarSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        # Stage 1: single-user app, no auth yet. Attribute everything to the
        # one existing user rather than a real authenticated owner.
        serializer.save(owner=User.objects.first())


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.AllowAny]
