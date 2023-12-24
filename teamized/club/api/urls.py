from django.urls import path, re_path

from teamized.club.api import views


urlpatterns = [
    path(
        "public/group-portfolios/<uuid:uuid>",
        views.shared_group_portfolios,
        name="club-api-public-group-portfolios",
    ),
    # Catch-all error view for 404 JSON responses
    re_path(".*", views.endpoint_not_found, name="club-api-not-found"),
]
