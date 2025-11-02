"""Views - the logic behind endpoints"""

import uuid
from datetime import datetime

from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.http import require_GET

from teamized import validation
from teamized.decorators import teamized_prep, validation_func
from teamized.models import Calendar, Member


# General views


def home(request):
    """Show the home page"""
    return render(request, "teamized/home.html")


# App views


@login_required()
@teamized_prep()
def app(request):
    """Show the app page"""
    return render(request, "teamized/app.html")


@login_required()
def app_debug(request):
    """Show the debug page"""
    return render(request, "teamized/debug.html")


def manifest(request):
    """Render the manifest.json file"""
    response = render(
        request,
        "teamized/manifest.json",
        {
            "add_debug": request.GET.get("debug", "false") == "true",
        },
    )
    response["Content-Type"] = "text/json"
    response["Service-Worker-Allowed"] = reverse("teamized:home")
    return response


# Report URLs


@login_required()
@require_GET
@teamized_prep()
def workingtime_report(request, team_uuid: uuid.UUID):
    """Get the working time report for the current member in a team"""

    try:
        member: Member = Member.objects.get(
            user=request.teamized_user,
            team_id=team_uuid,
        )
    except Member.DoesNotExist:
        return render(request, "teamized/error.html", {
            "title": "Mitglied nicht gefunden",
            "description": "Du bist kein Mitglied dieses Teams oder das Team existiert nicht.",
        }, status=404)

    @validation_func()
    def get_date_range():
        """Get the date range from the GET parameters"""
        return (
            validation.datetime(
                request.GET, "datetime_from", False, default=datetime(year=2020, month=1, day=1)
            ),
            validation.datetime(request.GET, "datetime_to", False, default=datetime.now()),
        )

    try:
        datetime_from, datetime_to = get_date_range()
    except validation.ValidationError as e:
        return e.get_html_response(request)

    return render(
        request,
        "teamized/reports/workingtime.html",
        {
            "title": "Arbeitszeitbericht",
            "data": member.get_workingtime_report_data(datetime_from, datetime_to),
        },
    )


# Public URLs


def calendar_ics(request, uuid):
    """Get the .ics file for a public calendar"""

    try:
        calendar: Calendar = Calendar.objects.get(ics_uid=uuid, is_public=True)
    except Calendar.DoesNotExist:
        return render(request, "teamized/404.html", status=404)

    return calendar.as_ics_response(request)


# Error views


def notfound(request):
    """Show a 404 page"""
    return render(request, "teamized/404.html", status=404)
