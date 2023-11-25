"""Views - the logic behind endpoints"""

from django.shortcuts import render
from django.urls import reverse, reverse_lazy
from django.contrib.auth.decorators import login_required

from teamized.decorators import teamized_prep
from teamized.models import Calendar

# General views


def home(request):
    "Show the home page"
    return render(request, "teamized/home.html")


# App views


@login_required(login_url=reverse_lazy("account:login"))
@teamized_prep()
def app(request):
    "Show the app page"
    return render(request, "teamized/app.html")


@login_required(login_url=reverse_lazy("account:login"))
def app_debug(request):
    "Show the debug page"
    return render(request, "teamized/debug.html")


def manifest(request):
    "Render the manifest.json file"
    response = render(request, "teamized/manifest.json", {})
    response["Content-Type"] = "text/json"
    response["Service-Worker-Allowed"] = reverse("teamized:home")
    return response


# Public URLs


def calendar_ics(request, uuid):
    "Get the .ics file for a public calendar"

    try:
        calendar: Calendar = Calendar.objects.get(ics_uid=uuid, is_public=True)
    except Calendar.DoesNotExist:
        return render(request, "teamized/404.html", status=404)

    return calendar.as_ics_response(request)


# Error views


def notfound(request):
    "Show a 404 page"
    return render(request, "teamized/404.html", status=404)
