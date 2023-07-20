"""Decorators

(decorators can be used to modify/extend the behaviour of a function)
"""

import traceback
from functools import wraps

from django.db.utils import IntegrityError
from django.shortcuts import render
from django.utils.translation import gettext as _

from teamized import models, exceptions

def teamized_prep():
    """
    Decorator for endpoints: Prepare a request for teamized views. Requires authentication.
    Creates a new custom user if the user does not exist yet.
    Sets request.teamized_user to the custom user object.
    Creates a new team if the user does not have a team yet.
    """
    def decorator(function):
        @wraps(function)
        def wrap(request, *args, **kwargs):
            # Ensure that the user is authenticated.

            if not request.user.is_authenticated:
                return render(request, 'teamized/404.html', status=404)

            # Create a new custom User if the current Auth.User doesn't have one.
            # Note: Auth users are created automatically by Django when a user logs in
            #       Because we need to store additional data, we need to create a custom User
            #       object for each Auth.User (that is linked to the Auth.User via a foreign key)

            if getattr(request.user, 'teamized_user', None) is None:
                models.User.objects.create(auth_user=request.user)
            request.teamized_user = request.user.teamized_user
            request.teamized_user.ensure_team()

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
            except IntegrityError as exc:
                traceback.print_exc()
                traceback.print_stack()
                raise exceptions.ValidationError(
                    _("Integritätsfehler. Möglicherweise existiert ein Objekt mit denselben Daten (z. B. E-Mail-Adresse) bereits."),
                    status=400, # Error code 400 indicates that this is a Bad Request
                ) from exc
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
