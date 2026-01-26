from django.http import JsonResponse

from teamized.api.utils.constants import ENDPOINT_NOT_FOUND, OBJ_NOT_FOUND
from teamized.club.models import ClubMemberGroup

# Public URLs


def shared_group_portfolios(request, uuid):
    """Get the group portfolios for a specific group as JSON"""

    try:
        group: ClubMemberGroup = ClubMemberGroup.objects.get(shared_uid=uuid)
    except ClubMemberGroup.DoesNotExist:
        return OBJ_NOT_FOUND

    return JsonResponse(group.get_member_portfolios(), headers={"Access-Control-Allow-Origin": "*"})


# Catch-all error


def endpoint_not_found(request):
    """
    Not found. Always returns a 404 error message with a error message in JSON format.
    """

    return ENDPOINT_NOT_FOUND
