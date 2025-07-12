"""Club decorators"""

from functools import wraps

from django.contrib import messages
from django.utils.translation import gettext as _
from django.shortcuts import render

import teamized.club.models as models


def clubview():
    """Club member view decorator"""

    def decorator(function):
        @wraps(function)
        def wrap(request, *args, **kwargs):
            clubslug = kwargs.pop("clubslug")

            if not models.Club.objects.filter(slug=clubslug).exists():
                messages.error(
                    request,
                    _("Ungültiger Link: Der gesuchte Verein wurde nicht gefunden!"),
                )
                return render(request, "teamized/club/error.html", status=404)

            club = models.Club.objects.get(slug=clubslug)
            kwargs["club"] = club

            if "memberuid" in kwargs:
                memberuid = kwargs.pop("memberuid")

                if not models.ClubMember.objects.filter(uid=memberuid, club=club).exists():
                    messages.error(
                        request,
                        _("Ungültiger Link: Im Verein {clubname} wurde kein Mitglied mit dieser ID gefunden!").format(
                            clubname=club.name),
                    )
                    return render(request, "teamized/club/error.html", status=404)

                member = models.ClubMember.objects.get(uid=memberuid)
                kwargs["member"] = member

            return function(request, *args, **kwargs)

        return wrap

    return decorator
