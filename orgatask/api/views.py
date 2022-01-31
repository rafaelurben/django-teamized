"""OrgaTask API views"""

from django.db import models
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from orgatask.api.constants import ENDPOINT_NOT_FOUND, SUCCESSFULLY_CHANGED
from orgatask.api.decorators import require_object, api_read, api_write, api_readwrite

#####


def not_found(request):
    """Return a json error message"""

    return ENDPOINT_NOT_FOUND

#####

