"""
URL configuration for devproject.

Minimal URL configuration for developing django-teamized.
"""

from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

# Account URL patterns (redirects to admin equivalents)
account_patterns = [
    path(
        "login/", RedirectView.as_view(pattern_name="admin:login", query_string=True), name="login"
    ),
    path(
        "logout/",
        RedirectView.as_view(pattern_name="admin:logout", query_string=True),
        name="logout",
    ),
    path("home/", RedirectView.as_view(pattern_name="admin:index", query_string=True), name="home"),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("account/", include((account_patterns, "account"))),
    path("teamized/", include("teamized.urls")),
    path("", RedirectView.as_view(pattern_name="teamized:app")),
]
