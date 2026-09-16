from rest_framework.routers import DefaultRouter

from .views import CalendarViewSet, EventViewSet, UserViewSet

router = DefaultRouter()
router.register("users", UserViewSet)
router.register("calendars", CalendarViewSet, basename="calendar")
router.register("events", EventViewSet, basename="event")

urlpatterns = router.urls
