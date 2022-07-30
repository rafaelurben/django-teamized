"""OrgaTask API urls"""

from django.urls import path, re_path

from orgatask.api import endpoints as ep

#######################

urlpatterns = [
    # Main API views

    path('profile', ep.main.endpoint_profile, name='api-profile'),
    path('teams', ep.main.endpoint_teams, name='api-teams'),
    path('teams/<team>', ep.main.endpoint_team, name='api-team'),
    path('teams/<team>/members', ep.main.endpoint_members, name='api-members'),
    path('teams/<team>/members/<member>', ep.main.endpoint_member, name='api-member'),
    path('teams/<team>/invites', ep.main.endpoint_invites, name='api-invites'),
    path('teams/<team>/invites/<invite>', ep.main.endpoint_invite, name='api-invite'),
    path('teams/<team>/leave', ep.main.endpoint_team_leave, name='api-team-leave'),
    path('invites/<invite>/info', ep.main.endpoint_invite_info, name='api-invite-info'),
    path('invites/<invite>/accept', ep.main.endpoint_invite_accept, name='api-invite-accept'),

    # Workingtime API views

    path('teams/<team>/me/worksessions', ep.workingtime.endpoint_worksessions, name='api-workingtime-worksessions'),
    path('teams/<team>/me/worksessions/<session>', ep.workingtime.endpoint_worksession, name='api-workingtime-worksession'),
    path('me/worksessions/tracking/start/t=<team>', ep.workingtime.endpoint_tracking_start, name='api-workingtime-tracking-start'),
    path('me/worksessions/tracking/live', ep.workingtime.endpoint_tracking_live, name='api-workingtime-tracking-live'),
    path('me/worksessions/tracking/stop', ep.workingtime.endpoint_tracking_stop, name='api-workingtime-tracking-stop'),

    # Calendar API views

    path('teams/<team>/calendars', ep.calendar.endpoint_calendars, name='api-calendars'),
    path('teams/<team>/calendars/<calendar>', ep.calendar.endpoint_calendar, name='api-calendar'),
    path('teams/<team>/calendars/<calendar>/events', ep.calendar.endpoint_events, name='api-events'),
    path('teams/<team>/calendars/<calendar>/events/<event>', ep.calendar.endpoint_event, name='api-event'),

    # Catch-all error view for 404 JSON responses
    re_path('.*', ep.endpoint_not_found, name="api-not-found")
]
