"""Generic URL patterns"""

from django.urls import path, include

from . import views

##############

app_name = 'orgatask'

urlpatterns = [
    # Home page (public)
    path('',
         views.home,
         name="home"),

    # App pages (login required)
    path('app/',
         views.app,
         name="app"),
    path('app/debug',
         views.app_debug,
         name="app-debug"),

    # PWA manifest (public)
    path('manifest.json',
         views.manifest,
         name="manifest"),

    path('api/',
         include('orgatask.api.urls')),

    # Calendar .ics file (public, but must know uuid token)

    path('calendar/<uuid:uuid>.ics',
         views.calendar_ics,
         name="calendar_ics"),

    # 404 error page
    path('*', views.notfound),

]
