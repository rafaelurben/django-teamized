"""Calendar API endpoints"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.translation import gettext as _

from orgatask import enums, exceptions
from orgatask.api.constants import ENDPOINT_NOT_FOUND, NOT_IMPLEMENTED, DATA_INVALID, NO_PERMISSION, OBJ_NOT_FOUND
from orgatask.api.decorators import require_objects, api_view
from orgatask.decorators import orgatask_prep
from orgatask.models import Calendar, CalendarEvent, Team, User


@api_view(["get", "post"])
@orgatask_prep()
@csrf_exempt
@require_objects([("team", Team, "team")])
def endpoint_calendars(request, team: Team):
    """
    Endpoint for listing all calendars of the specified team and creating a new one.
    """

    user: User = request.orgatask_user

    if request.method == "GET":
        if not team.user_is_member(user):
            return NO_PERMISSION

        # Get all calendars of the team
        calendars = team.calendars.all()
        return JsonResponse({
            "calendars": [calendar.as_dict(request) for calendar in calendars],
        })
    if request.method == "POST":
        if not team.user_is_admin(user):
            return NO_PERMISSION

        calendar = Calendar.from_post_data(request.POST, team)
        return JsonResponse({
            "success": True,
            "calendar": calendar.as_dict(request),
            "alert": {
                "title": _("Kalender erstellt"),
                "text": _("Der Kalender wurde erfolgreich erstellt."),
            }
        })


@api_view(["get", "post", "delete"])
@csrf_exempt
@orgatask_prep()
@require_objects([("team", Team, "team"), ("calendar", Calendar, "calendar")])
def endpoint_calendar(request, team: Team, calendar: Calendar):
    """
    Endpoint for managing or deleting a calendar.
    """

    # Check if calendar is in team
    if calendar.team != team:
        return OBJ_NOT_FOUND

    user: User = request.orgatask_user

    if request.method == "GET":
        if not team.user_is_member(user):
            return NO_PERMISSION

        return JsonResponse({
            "id": team.uid,
            "calendar": calendar.as_dict(request),
        })
    if request.method == "POST":
        if not team.user_is_admin(user):
            return NO_PERMISSION

        calendar.update_from_post_data(request.POST)
        return JsonResponse({
            "success": True,
            "id": team.uid,
            "calendar": calendar.as_dict(request),
            "alert": {
                "title": _("Kalender geändert"),
                "text": _("Der Kalender wurde erfolgreich geändert."),
            }
        })
    if request.method == "DELETE":
        if not team.user_is_admin(user):
            return NO_PERMISSION

        calendar.delete()
        return JsonResponse({
            "success": True,
            "id": calendar.uid,
            "alert": {
                "title": _("Kalender gelöscht"),
                "text": _("Der Kalender wurde erfolgreich gelöscht."),
            }
        })
