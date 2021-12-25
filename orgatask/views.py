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


# Account views

@login_required(login_url=reverse_lazy('orgatask:account-login'))
def account_logout(request):
    "Logout the user and redirect to the login page."
    messages.success(request, _("Logout erfolgreich!"))
    return redirect(reverse('orgatask:account-login'))

def account_register(request):
    "Show the registration form"
    # TODO: implement the registration form
    return render(request, 'orgatask/account/register.html')

# Error views

def notfound(request):
    "Show a 404 page"
    return render(request, 'orgatask/404.html')
