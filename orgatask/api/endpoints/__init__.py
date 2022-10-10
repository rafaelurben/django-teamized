"""Endpoints for the OrgaTask API"""

from django.views.decorators.csrf import csrf_exempt

# This is a reimport so the endpoints can be imported easier
from orgatask.api.endpoints import main, workingtime, calendar, todo
from orgatask.api.utils.constants import ENDPOINT_NOT_FOUND

# Basic API views

@csrf_exempt
def endpoint_not_found(request):
    """
    Not found. Always returns a 404 error message with a error message in JSON format.
    """

    return ENDPOINT_NOT_FOUND
