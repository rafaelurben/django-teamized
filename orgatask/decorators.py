"""OrgaTask Decorators"""

from orgatask import models
from django.shortcuts import render
from functools import wraps

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
