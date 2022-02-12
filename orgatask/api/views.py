"""OrgaTask API views"""

from django.db import models
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from orgatask.api.constants import ENDPOINT_NOT_FOUND, SUCCESSFULLY_CHANGED
from orgatask.api.decorators import require_object, api_read, api_write, api_readwrite
from orgatask.decorators import orgatask_prep


@api_read()
@orgatask_prep()
def user_userinfo_get(request):
    """
    Get information about the logged in user.
    """
    user = request.orgatask_user
    return JsonResponse({
        "username": user.auth_user.username,
        "first_name": user.auth_user.first_name,
        "last_name": user.auth_user.last_name,
        "email": user.auth_user.email,
        "memberinstances": [
            {
                "id": mi.uid,
                "role": mi.role,
                "organization": {
                    "id": mi.organization.uid,
                    "title": mi.organization.title,
                    "description": mi.organization.description,
                }
            }
            for mi in user.member_instances.all()
        ],
    })



# Error views

def not_found(request):
    """Return a json error message"""

    return ENDPOINT_NOT_FOUND
