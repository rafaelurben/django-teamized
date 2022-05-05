"""OrgaTask API urls"""

from django.urls import path, re_path

from orgatask.api import views

#######################

urlpatterns = [
    # API views

    path('profile', views.endpoint_profile, name='api-profile'),
    path('teams', views.endpoint_teams, name='api-teams'),
    path('teams/<team>', views.endpoint_team, name='api-team'),
    path('teams/<team>/members', views.endpoint_members, name='api-members'),
    path('teams/<team>/members/<member>', views.endpoint_member, name='api-member'),
    path('teams/<team>/invites', views.endpoint_invites, name='api-invites'),
    path('teams/<team>/invites/<invite>', views.endpoint_invite, name='api-invite'),
    path('teams/<team>/leave', views.endpoint_team_leave, name='api-team-leave'),
    path('invites/<invite>/accept', views.endpoint_invite_accept, name='api-invite-accept'),

    # Catch-all error view for 404 JSON responses
    re_path('.*', views.not_found, name="api-not-found")
]
