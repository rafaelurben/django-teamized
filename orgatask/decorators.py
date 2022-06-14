"""OrgaTask Decorators"""

from functools import wraps

from django.shortcuts import render
from django.utils.translation import gettext as _

from orgatask import models, exceptions

def orgatask_prep():
    """Decorator: Prepare a request for orgatask views."""
    def decorator(function):
        @wraps(function)
        def wrap(request, *args, **kwargs):
            # Ensure that the user is authenticated.

            if (not request.user.is_authenticated):
                return render(request, 'orgatask/404.html', status=404)

            # Create a new OrgaTask.User if the current Auth.User doesn't have one.

            if getattr(request.user, 'orgatask_user', None) is None:
                models.User.objects.create(auth_user=request.user)
            request.orgatask_user = request.user.orgatask_user
            request.orgatask_user.ensure_team()

            return function(request, *args, **kwargs)
        return wrap
    return decorator


def validation_func():
    """Decorator for functions. Captures common errors and throws a validation error instead"""

    def decorator(function):
        @wraps(function)
        def wrap(request, *args, **kwargs):
            try:
                return function(request, *args, **kwargs)
            except exceptions.AlertException as exc:
                raise exc
            except (ValueError) as exc:
                raise exceptions.ValidationError(
                    _("Beim Validieren der Daten ist ein Fehler aufgetreten. Sind die Daten korrekt?"),
                ) from exc
        return wrap
    return decorator
