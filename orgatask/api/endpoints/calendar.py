"""Calendar API endpoints"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.translation import gettext as _

from orgatask.api.utils.constants import NO_PERMISSION, OBJ_NOT_FOUND
from orgatask.api.utils.decorators import require_objects, api_view
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
            "id": calendar.uid,
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
            "id": calendar.uid,
            "calendar": calendar.as_dict(request),
        })
    if request.method == "POST":
        if not team.user_is_admin(user):
            return NO_PERMISSION

        calendar.update_from_post_data(request.POST)
        return JsonResponse({
            "success": True,
            "id": calendar.uid,
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
            "alert": {
                "title": _("Kalender gelöscht"),
                "text": _("Der Kalender wurde erfolgreich gelöscht."),
            }
        })

@api_view(["get", "post"])
@csrf_exempt
@orgatask_prep()
@require_objects([("team", Team, "team"), ("calendar", Calendar, "calendar")])
def endpoint_events(request, team: Team, calendar: Calendar):
    """
    Endpoint for creating a new event in the calendar.
    """

    # Check if calendar is in team
    if calendar.team != team:
        return OBJ_NOT_FOUND

    user: User = request.orgatask_user

    # Check if user is member of team
    if not team.user_is_member(user):
        return NO_PERMISSION

    if request.method == "GET":
        events = calendar.events.all()
        return JsonResponse({
            "events": [event.as_dict() for event in events],
        })
    if request.method == "POST":
        event = CalendarEvent.from_post_data(request.POST, calendar)
        return JsonResponse({
            "success": True,
            "id": event.uid,
            "event": event.as_dict(),
            "alert": {
                "title": _("Ereignis erstellt"),
                "text": _("Das Ereignis wurde erfolgreich erstellt."),
            }
        })


@api_view(["get", "post", "delete"])
@csrf_exempt
@orgatask_prep()
@require_objects([("team", Team, "team"), ("calendar", Calendar, "calendar"), ("event", CalendarEvent, "event")])
def endpoint_event(request, team: Team, calendar: Calendar, event: CalendarEvent):
    """
    Endpoint for managing or deleting an event.
    """

    # Check if calendar is in team
    if calendar.team != team:
        return OBJ_NOT_FOUND
    # Check if event is in calendar
    if event.calendar != calendar:
        return OBJ_NOT_FOUND

    user: User = request.orgatask_user

    if not team.user_is_member(user):
        return NO_PERMISSION

    if request.method == "GET":
        return JsonResponse({
            "id": event.uid,
            "event": event.as_dict(),
        })
    if request.method == "POST":
        event.update_from_post_data(request.POST)
        return JsonResponse({
            "success": True,
            "id": event.uid,
            "event": event.as_dict(),
            "alert": {
                "title": _("Ereignis geändert"),
                "text": _("Das Ereignis wurde erfolgreich geändert."),
            }
        })
    if request.method == "DELETE":
        event.delete()
        return JsonResponse({
            "success": True,
            "alert": {
                "title": _("Ereignis gelöscht"),
                "text": _("Das Ereignis wurde erfolgreich gelöscht."),
            }
        })
