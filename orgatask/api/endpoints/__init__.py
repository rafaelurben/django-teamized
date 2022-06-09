"""Endpoints for the OrgaTask API"""

from orgatask.api.endpoints import main, workingtime, calendar
from orgatask.api.constants import ENDPOINT_NOT_FOUND

# Basic API views

def endpoint_not_found(request):
    """
    Return a json 404 error message
    """

    return ENDPOINT_NOT_FOUND
