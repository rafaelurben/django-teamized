"""Generic URL patterns"""

from django.urls import path, re_path, include

import teamized.club.views as views

##############

urlpatterns = [
    path("api/", include("teamized.club.api.urls")),
    path("<slug:clubslug>/<uuid:memberuid>", views.member_app, name="club_member_app"),
    path(
        "<slug:clubslug>/<uuid:memberuid>/login",
        views.member_login,
        name="club_member_login",
    ),
    path(
        "<slug:clubslug>/<uuid:memberuid>/logout",
        views.member_logout,
        name="club_member_logout",
    ),
    path("<slug:clubslug>/", views.club_login, name="club_login"),
    re_path(".*", views.error),
]
