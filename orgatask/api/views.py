"""OrgaTask API views"""

from django.db import models
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.translation import gettext as _

from orgatask.api.constants import ENDPOINT_NOT_FOUND, NOT_IMPLEMENTED
from orgatask.api.decorators import require_object, api_view
from orgatask.decorators import orgatask_prep
from orgatask.models import User, Organization


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
@orgatask_prep()
def organizations(request):
    """
    Endpoint for managing organizations.
    """
    user = request.orgatask_user

    if request.method == "GET":
        return JsonResponse({
            "organizations": [
                {
                    "id": mi.organization.uid,
                    "title": mi.organization.title,
                    "description": mi.organization.description,
                    "member": {
                        "id": mi.uid,
                        "role": mi.role,
                    },
                }
                for mi in user.member_instances.all()
            ],
        })
    elif request.method == "POST":
        if not user.can_create_organization():
            return JsonResponse({
                "error": "organization_limit_reached",
                "alert": {
                    "title": _("Organisationslimit erreicht."),
                    "description": _("Du hast das maximale Limit an Organisationen erreicht, welche du besitzen kannst."),
                }
            }, status=400)

        # TODO: Create organization /Q: What format is the request body?
        return NOT_IMPLEMENTED


def not_found(request):
    """
    Return a json 404 error message
    """

    return ENDPOINT_NOT_FOUND
