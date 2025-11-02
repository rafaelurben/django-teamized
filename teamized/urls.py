"""Generic URL patterns"""

from django.urls import path, include, re_path

from . import views

##############

app_name = "teamized"

urlpatterns = [
    # Home page (public)
    path("", views.home, name="home"),
    # App pages (login required)
    path("app/", views.app, name="app"),
    path("app/debug", views.app_debug, name="app-debug"),
    # Reports (login required)
    path("reports/workingtime/<uuid:team_uuid>", views.workingtime_report),
    # Club pages (public)
    path("clubs/", include("teamized.club.urls")),
    # PWA manifest (public)
    path("manifest.json", views.manifest, name="manifest"),
    path("api/", include("teamized.api.urls")),
    # Calendar .ics file (public, but must know uuid token)
    path("calendar/<uuid:uuid>.ics", views.calendar_ics, name="calendar_ics"),
    # 404 error page
    re_path(".*", views.notfound),
]
