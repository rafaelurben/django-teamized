"""API decorators"""

import uuid

from functools import wraps

from django.db.models import fields
from django.http import JsonResponse
from django.utils.translation import gettext as _

from teamized.api.utils.constants import (
    NO_PERMISSION_APIKEY,
    APIKEY_INVALID,
    NO_PERMISSION_SESSION,
    NOT_AUTHENTICATED,
    METHOD_NOT_ALLOWED,
    OBJ_NOT_FOUND,
    NOT_AN_UUID,
)
from teamized.api.utils.models import ApiKey
from teamized import exceptions


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
            try:
                if request.method.lower() not in map(lambda x: x.lower(), allowed_methods):
                    return METHOD_NOT_ALLOWED

                apikey = request.GET.get("apikey", None)

                # If the user provided an apikey, try to authenticate with it
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

                # If there's no apikey, try to authenticate via Django session
                if request.user.is_authenticated:
                    if request.user.has_perms(perms_required):
                        return function(request, *args, **kwargs)

                    return NO_PERMISSION_SESSION

                return NOT_AUTHENTICATED
            except exceptions.AlertException as exc:
                return exc.get_response()

        return wrap

    return decorator


def require_objects(config, allow_none=False):
    """Decorator to only call the view if objects with given ids exist
    and automatically pass them instead of the ids.

    Format: [["fieldname_in", Model, "fieldname_out", "pk"]...]"""

    def decorator(function):
        @wraps(function)
        def wrap(request, *args, **kwargs):
            for elem in config:
                elem = list(elem)

                # Fill the optional arguments if they are not given
                if len(elem) == 2:
                    elem.append(elem[0])
                if len(elem) == 3:
                    elem.append("pk")

                # Extract the four arguments from the list
                field_in, model, field_out, dbfieldname = elem
                value = kwargs.pop(field_in)

                # Find the primary key of the model if the placeholder "pk" is given
                if dbfieldname == "pk":
                    dbfieldname = model._meta.pk.name

                # Find the field in the model and check its type
                dbfield = model._meta.get_field(dbfieldname)
                if isinstance(dbfield, fields.UUIDField) and not _is_valid_uuid(value):
                    return NOT_AN_UUID

                # Find the object with the given id
                search = {dbfieldname: value}
                if model.objects.filter(**search).exists():
                    kwargs[field_out] = model.objects.get(**search)
                    continue  # Go to the next object (if present

                if allow_none:
                    kwargs[field_out] = None
                    continue  # Go to the next object (if present)

                if hasattr(model, "NOT_FOUND_TEXT"):
                    return JsonResponse(
                        {
                            "error": "object-not-found",
                            "message": _("Dieses Objekt konnte nicht gefunden werden."),
                            "alert": {
                                "title": getattr(
                                    model, "NOT_FOUND_TITLE", _("Objekt nicht gefunden")
                                ),
                                "text": getattr(model, "NOT_FOUND_TEXT"),
                            },
                        },
                        status=400,
                    )

                return OBJ_NOT_FOUND

            return function(request, *args, **kwargs)

        return wrap

    return decorator
