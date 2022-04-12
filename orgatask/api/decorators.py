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


def require_objects(config):
    """Decorator to only call the view if objects with given ids exist
    and automatically pass them instead of the ids.

    Format: [("fieldname_in", Model, "fieldname_out")...]"""

    def decorator(function):
        @wraps(function)
        def wrap(request, *args, **kwargs):
            for field_in, model, field_out in config:
                objpk = kwargs.pop(field_in)

                if model.objects.filter(pk=objpk).exists():
                    kwargs[field_out] = model.objects.get(pk=objpk)
                    continue

                return OBJ_NOT_FOUND

            return function(request, *args, **kwargs)
        return wrap
    return decorator
