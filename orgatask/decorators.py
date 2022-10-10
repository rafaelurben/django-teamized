"""Decorators

(decorators can be used to modify/extend the behaviour of a function)
"""

import traceback
from functools import wraps

from django.shortcuts import render
from django.utils.translation import gettext as _

from orgatask import models, exceptions

def orgatask_prep():
    """
    Decorator for endpoints: Prepare a request for orgatask views. Requires authentication.
    Creates a new custom user if the user does not exist yet.
    Sets request.orgatask_user to the custom user object.
    Creates a new team if the user does not have a team yet.
    """
    def decorator(function):
        @wraps(function)
        def wrap(request, *args, **kwargs):
            # Ensure that the user is authenticated.

            if not request.user.is_authenticated:
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
    """
    Decorator for functions. Captures common errors and throws a validation error instead.
    This should technically never happen and is just a safety net.
    """

    def decorator(function):
        @wraps(function)
        def wrap(request, *args, **kwargs):
            try:
                return function(request, *args, **kwargs)
            except exceptions.AlertException as exc:
                # If the function already throws an alert exception, just reraise it
                # Note: ValidationError is a subclass of AlertException and will also be reraised
                raise exc
            except Exception as exc:
                # If there should really be an error, throw a validation error instead
                traceback.print_exc()
                traceback.print_stack()
                raise exceptions.ValidationError(
                    _("Beim Validieren der Daten ist ein Fehler aufgetreten. Sind die Daten korrekt?"),
                    status=500, # Error code 500 indicates that this is an Internal Server Error
                ) from exc
        return wrap
    return decorator
