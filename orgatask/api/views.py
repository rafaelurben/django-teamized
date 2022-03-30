"""OrgaTask API views"""

from django.db import models
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.translation import gettext as _

from orgatask.api.constants import ENDPOINT_NOT_FOUND, NOT_IMPLEMENTED, DATA_INVALID
from orgatask.api.decorators import require_object, api_view
from orgatask.decorators import orgatask_prep
from orgatask.models import User, Team


@api_view(["get"])
@orgatask_prep()
def profile(request):
    """
    Get the user's profile.
    """
    user = request.orgatask_user
    return JsonResponse({
        "user": {
            "username": user.auth_user.username,
            "first_name": user.auth_user.first_name,
            "last_name": user.auth_user.last_name,
            "email": user.auth_user.email,
        }
    })


@api_view(["get", "post"])
@csrf_exempt
@orgatask_prep()
def teams(request):
    """
    Endpoint for managing teams.
    """
    user = request.orgatask_user

    if request.method == "GET":
        memberinstances = user.member_instances.all().order_by("team__title")
        return JsonResponse({
            "teams": [
                {
                    "id": mi.team.uid,
                    "title": mi.team.title,
                    "description": mi.team.description,
                    "member": {
                        "id": mi.uid,
                        "role": mi.role,
                        "role_text": mi.get_role_display(),
                    },
                }
                for mi in memberinstances
            ],
            "defaultTeamId": memberinstances[0].team.uid,
        })
    elif request.method == "POST":
        if not user.can_create_team():
            return JsonResponse({
                "error": "team_limit_reached",
                "alert": {
                    "title": _("Teamlimit erreicht."),
                    "text": _("Du hast das maximale Limit an Teams erreicht, welche du besitzen kannst."),
                }
            }, status=400)
        
        title = request.POST.get("title", "")[:49]
        description = request.POST.get("description", "")
        
        if not title or not description:
            return DATA_INVALID
        
        team = user.create_team(title, description)
        
        return JsonResponse({
            "success": True,
            "id": team.uid,
            "alert": {
                "title": _("Team erstellt."),
                "text": _("Das Team wurde erfolgreich erstellt."),
            }
        })


def not_found(request):
    """
    Return a json 404 error message
    """

    return ENDPOINT_NOT_FOUND
