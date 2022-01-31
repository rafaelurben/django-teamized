"OrgaTask views - the logic behind endpoints"

from django.shortcuts import render, redirect
from django.urls import reverse, reverse_lazy
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils.translation import gettext as _

# General views

def home(request):
    "Show the home page"
    return render(request, 'orgatask/home.html')

# App views

@login_required(login_url=reverse_lazy('orgatask:account-login'))
def app(request):
    "Show the app page"
    return render(request, 'orgatask/app.html')

def manifest(request):
    "Render the manifest.json file"
    response = render(request, "orgatask/manifest.json", {})
    response['Content-Type'] = 'text/json'
    response["Service-Worker-Allowed"] = reverse('orgatask:home')
    return response

# API views

# TODO: write API decorators
@login_required(login_url=reverse_lazy('account:login')+'?next=')
def api(request):
    "Process API calls"
    # TODO: implement the API


# Error views

def notfound(request):
    "Show a 404 page"
    return render(request, 'orgatask/404.html')
