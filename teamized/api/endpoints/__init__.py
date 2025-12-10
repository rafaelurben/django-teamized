"""Endpoints for the API"""

# This is a reimport so the endpoints can be imported easier
from teamized.api.endpoints import main, workingtime, calendar, todo, club, club_attendance
from teamized.api.utils.constants import ENDPOINT_NOT_FOUND

# Basic API views


def endpoint_not_found(request):
    """
    Not found. Always returns a 404 error message with a error message in JSON format.
    """

    return ENDPOINT_NOT_FOUND
