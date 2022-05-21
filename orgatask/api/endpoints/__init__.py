from orgatask.api.endpoints import main
from orgatask.api.constants import ENDPOINT_NOT_FOUND

def endpoint_not_found(request):
    """
    Return a json 404 error message
    """

    return ENDPOINT_NOT_FOUND
