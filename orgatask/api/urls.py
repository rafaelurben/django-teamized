"""OrgaTask API urls"""

from django.urls import path, re_path

from orgatask.api import views

#######################

urlpatterns = [
    # API views

    path('profile', views.profile, name='api-profile'),
    path('organizations', views.organizations, name='api-organizations'),


    # Catch-all error view for 404 JSON responses
    re_path('.*', views.not_found, name="api-not-found")
]
