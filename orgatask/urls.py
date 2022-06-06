"OrgaTask URLs"

from django.urls import path, include

from . import views

##############

app_name = 'orgatask'

urlpatterns = [
    # generic views
    path('',
         views.home,
         name="home"),
    path('app/',
         views.app,
         name="app"),
    path('manifest.json',
         views.manifest,
         name="manifest"),

    path('api/',
         include('orgatask.api.urls')),

    # public URLs

    path('calendar/<uuid:uuid>.ics',
         views.calendar_ics,
         name="calendar_ics"),

    # 404 error page
    path('*', views.notfound),

]
