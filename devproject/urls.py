"""
URL configuration for devproject.

Minimal URL configuration for developing django-teamized.
"""

from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

# Account URL patterns (redirects to admin equivalents)
account_patterns = [
    path("login/", RedirectView.as_view(pattern_name="admin:login"), name="login"),
    path("logout/", RedirectView.as_view(pattern_name="admin:logout"), name="logout"),
    path("home/", RedirectView.as_view(pattern_name="admin:index"), name="home"),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("account/", include((account_patterns, "account"))),
    path("teamized/", include("teamized.urls")),
]
