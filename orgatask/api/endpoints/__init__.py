"""Endpoints for the OrgaTask API"""

from django.views.decorators.csrf import csrf_exempt

from orgatask.api.endpoints import main, workingtime, calendar, todo
from orgatask.api.constants import ENDPOINT_NOT_FOUND

# Basic API views

@csrf_exempt
def endpoint_not_found(request):
    """
    Return a json 404 error message
    """

    return ENDPOINT_NOT_FOUND
