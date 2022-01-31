"OrgaTask URLs"

from django.urls import path

from django.contrib.auth import views as auth_views
from django.urls import reverse_lazy

from . import views

##############

app_name = 'orgatask'

# App URLs
_app_urls = [
    path('app/',
         views.app,
         name="app"),

    path('app/api',
         views.api,
         name="api"),

    path('manifest.json',
         views.manifest,
         name="manifest"),
]

# All URLs
urlpatterns = [
    # generic views
    path('', views.home, name="home"),

    # app views
    *_app_urls,

    # 404 error page
    path('*', views.notfound),

]
