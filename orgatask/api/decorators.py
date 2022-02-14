"""OrgaTask API decorators"""

import uuid

from functools import wraps

from orgatask.api.constants import (
    NO_PERMISSION_APIKEY, APIKEY_INVALID, NO_PERMISSION_SESSION, NOT_AUTHENTICATED, METHOD_NOT_ALLOWED, OBJ_NOT_FOUND
)
from orgatask.api.models import ApiKey


def _is_valid_uuid(val):
    try:
        uuid.UUID(str(val))
        return True
    except ValueError:
        return False


def api_view(allowed_methods=["get"], perms_required=()):
    """Decorator: Protect an api view from unauthorized access."""
    def decorator(function):
        @wraps(function)
        def wrap(request, *args, **kwargs):
            if request.method.lower() not in map(lambda x: x.lower(), allowed_methods):
                return METHOD_NOT_ALLOWED
            
            apikey = request.GET.get("apikey", None)

            if apikey:
                if _is_valid_uuid(apikey) and ApiKey.objects.filter(key=apikey).exists():
                    keyobject = ApiKey.objects.get(key=apikey)
                    
                    if request.method.upper() == "GET":
                        if not keyobject.read:
                            return NO_PERMISSION_APIKEY
                    elif not keyobject.write:
                        return NO_PERMISSION_APIKEY
                    elif not keyobject.has_perms(perms_required):
                        return NO_PERMISSION_APIKEY
                    
                    request.user = keyobject.user
                    request.api_key = keyobject
                    return function(request, *args, **kwargs)

                return APIKEY_INVALID

            if request.user.is_authenticated:
                if request.user.has_perms(perms_required):
                    return function(request, *args, **kwargs)

                return NO_PERMISSION_SESSION

            return NOT_AUTHENTICATED
        return wrap
    return decorator


def require_object(model):
    """Decorator: Requires an object with gived ID and passes it to the view"""

    def decorator(function):
        @wraps(function)
        def wrap(request, object_id, *args, **kwargs):
            if model.objects.filter(pk=object_id).exists():
                obj = model.objects.get(pk=object_id)
                return function(request, obj, *args, **kwargs)

            return OBJ_NOT_FOUND
        return wrap
    return decorator
