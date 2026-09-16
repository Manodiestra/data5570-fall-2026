from django.contrib import admin

from .models import Calendar, Event, User

admin.site.register(User)
admin.site.register(Calendar)
admin.site.register(Event)
