"""WorkTime API endpoints"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.translation import gettext as _

from orgatask import enums, exceptions
from orgatask.api.constants import ENDPOINT_NOT_FOUND, NOT_IMPLEMENTED, DATA_INVALID, NO_PERMISSION, OBJ_NOT_FOUND
from orgatask.api.decorators import require_objects, api_view
from orgatask.decorators import orgatask_prep
from orgatask.models import User, Member, Team, WorkSession

@api_view(["get", "post"])
@orgatask_prep()
@require_objects([("team", Team, "team")])
def endpoint_worksessions(request, team: Team):
    """
    Endpoint for listing all sessions of the current user in a team and manually creating a new one.
    """

    # Check if the user is a member of the team
    user: User = request.orgatask_user
    if not team.user_is_member(user):
        return NO_PERMISSION

    member = team.get_member(user)

    if request.method == "GET":
        # Get all sessions of the user in the team
        sessions = member.work_sessions.filter(is_ended=True).order_by('-time_start').all()
        return JsonResponse({
            "sessions": [session.as_dict() for session in sessions],
        })
    if request.method == "POST":
        session = WorkSession.from_post_data(request.POST, team, member, user)
        return JsonResponse({
            "success": True,
            "id": session.uid,
            "session": session.as_dict(),
            "alert": {
                "title": _("Session erstellt"),
                "text": _("Die Session wurde erfolgreich erstellt."),
            }
        })


@api_view(["get", "post", "delete"])
@csrf_exempt
@orgatask_prep()
@require_objects([("session", WorkSession, "session")])
def endpoint_worksession(request, session: WorkSession):
    """
    Endpoint for managing or deleting a WorkSession.
    """

    user: User = request.orgatask_user

    # Check if it's the user's session
    if session.user != user:
        return OBJ_NOT_FOUND


    if request.method == "GET":
        return JsonResponse({
            "id": session.uid,
            "session": session.as_dict(),
        })
    if request.method == "POST":
        session.update_from_post_data(request.POST)
        return JsonResponse({
            "success": True,
            "id": session.uid,
            "event": session.as_dict(),
            "alert": {
                "title": _("Session geändert"),
                "text": _("Die Session wurde erfolgreich geändert."),
            }
        })
    if request.method == "DELETE":
        session.delete()
        return JsonResponse({
            "success": True,
            "id": session.uid,
            "alert": {
                "title": _("Session gelöscht"),
                "text": _("Die Session wurde erfolgreich gelöscht."),
            }
        })


@api_view(["post"])
@csrf_exempt
@orgatask_prep()
@require_objects([("team", Team, "team")])
def endpoint_tracking_start(request, team: Team):
    """
    Endpoint for starting session tracking.
    """

    # Check if the user is a member of the team
    user: User = request.orgatask_user
    if not team.user_is_member(user):
        return NO_PERMISSION

    # Check if the user is already tracking a session
    active_session = user.get_active_work_session()
    if active_session is not None:
        raise exceptions.AlertException(
            _("Es ist bereits eine Sitzung im Gange."),
            errorname="active_tracking_session_exists"
        )

    # Create a new tracking session
    new_session = WorkSession.objects.create(
        user=user,
        member=team.get_member(user),
        team=team,
        is_created_via_tracking=True,
    )
    return JsonResponse({
        "success": True,
        "session": new_session.as_dict(),
    })

@api_view(["get"])
@csrf_exempt
@orgatask_prep()
def endpoint_tracking_live(request):
    """
    Endpoint for getting information about the current tracking session.
    """

    user: User = request.orgatask_user

    # Check if the user is already tracking a session
    active_session = user.get_active_work_session()
    if active_session is None:
        raise exceptions.AlertException(
            _("Es ist keine Sitzung im Gange."),
            errorname="no_active_tracking_session_exists",
            status=200
        )

    # Return the session data
    return JsonResponse({
        "id": active_session.uid,
        "session": active_session.as_dict(),
    })

@api_view(["post"])
@csrf_exempt
@orgatask_prep()
def endpoint_tracking_stop(request):
    """
    Endpoint for stopping (ending) a tracking session.
    """

    user: User = request.orgatask_user

    # Check if the user is already tracking a session
    active_session = user.get_active_work_session()
    if active_session is None:
        raise exceptions.AlertException(
            _("Es ist keine Sitzung im Gange."),
            errorname="no_active_tracking_session_exists"
        )

    active_session.end()
    return JsonResponse({
        "success": True,
        "session": active_session.as_dict(),
    })
