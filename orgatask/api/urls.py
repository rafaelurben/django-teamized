"""OrgaTask API urls"""

from django.urls import path, re_path

from orgatask.api import views

#######################

urlpatterns = [
    # API views

    path('profile', views.profile, name='api-profile'),
    path('teams', views.teams, name='api-teams'),
    path('teams/<team>', views.team, name='api-team'),
    path('teams/<team>/members', views.members, name='api-members'),
    path('teams/<team>/members/<member>', views.member, name='api-member'),


    # Catch-all error view for 404 JSON responses
    re_path('.*', views.not_found, name="api-not-found")
]
