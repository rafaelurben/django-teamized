from django.shortcuts import render, redirect
from django.urls import reverse
from django.contrib import messages

import teamized.club.models as models

# Create your views here.


def home(request):
    """Generic home view - shows information about the project"""
    return render(request, "teamized/club/home.html")

### Club member views


def member_app(request, memberuid):
    """Member app view - shows the member app for a specific member"""

    if not models.ClubMember.objects.filter(uid=memberuid).exists():
        messages.error(request, "Dieser Link ist ungültig.")
        return render(request, "teamized/club/error.html", status=404)

    member = models.ClubMember.objects.get(uid=memberuid)

    if not member.session_is_logged_in(request):
        return redirect(
            reverse("teamized:club_member_login", kwargs={"memberuid": memberuid})
        )

    return render(
        request, "teamized/club/member_app.html", {"member": member, "club": member.club}
    )


def member_login(request, memberuid):
    """Member login view - shows the login page for a specific member

    If a magicuid is provided in the url parameters, the member is automatically logged in.
    Otherwise, the member can request a magic link to be sent to their email address.
    """

    if not models.ClubMember.objects.filter(uid=memberuid).exists():
        messages.error(request, "Dieser Link ist ungültig.")
        return render(request, "teamized/club/error.html", status=404)

    member = models.ClubMember.objects.get(uid=memberuid)

    if member.session_is_logged_in(request):
        messages.success(request, "Du bist bereits eingeloggt.")
        return redirect(
            reverse("teamized:club_member_app", kwargs={"memberuid": memberuid})
        )

    magicuid = request.GET.get("magicuid", None)
    can_login = magicuid is not None and member.can_login_with_magicuid(magicuid)

    if magicuid is not None and not can_login:
        messages.error(
            request,
            "Dieser magische Link ist leider ungültig, wurde bereits verwendet oder ist abgelaufen.",
        )
        # Redirect to remove magicuid from url
        return redirect(
            reverse("teamized:club_member_login", kwargs={"memberuid": memberuid})
        )

    if request.method == "POST":
        if can_login:
            member.session_login(request, magicuid)
            return redirect(
                reverse("teamized:club_member_app", kwargs={"memberuid": memberuid})
            )

        member.send_magic_link(request)
        messages.success(
            request, "Ein magischer Link wurde an deine E-Mail-Adresse gesendet."
        )
        # Redirect to prevent resubmission of form
        return redirect(
            reverse("teamized:club_member_login", kwargs={"memberuid": memberuid})
        )

    return render(
        request,
        "teamized/club/member_login.html",
        {
            "member": member,
            "club": member.club,
            "can_login": can_login,
        },
    )


def member_logout(request, memberuid):
    if not models.ClubMember.objects.filter(uid=memberuid).exists():
        messages.error(request, "Dieser Link ist ungültig.")
        return render(request, "teamized/club/error.html", status=404)

    member = models.ClubMember.objects.get(uid=memberuid)

    if member.session_is_logged_in(request):
        member.session_logout(request)
        messages.success(request, "Du wurdest erfolgreich ausgeloggt.")
    else:
        messages.warning(request, "Du warst gar nicht eingeloggt.")

    return redirect(
        reverse("teamized:club_login", kwargs={"clubuid": member.club_id})
    )


def club_login(request, clubuid):
    if not models.Club.objects.filter(uid=clubuid).exists():
        messages.error(request, "Dieser Link ist ungültig.")
        return render(request, "teamized/club/error.html", status=404)

    club = models.Club.objects.get(uid=clubuid)

    if request.method == "POST":
        email = request.POST.get("email", None)

        if models.ClubMember.objects.filter(club=club, email=email).exists():
            member = models.ClubMember.objects.get(club=club, email=email)
            member.send_magic_link(request)
            messages.success(
                request,
                "Ein magischer Link wurde an deine E-Mail-Adresse gesendet. Bitte prüfe deinen Posteingang!",
            )
        else:
            messages.error(
                request,
                "Es wurde kein Mitglied mit dieser E-Mail-Adresse gefunden! Hast du dich vertippt?",
            )

    logged_in_members = club.session_get_logged_in_members(request)
    return render(
        request,
        "teamized/club/club_login.html",
        {"club": club, "logged_in_members": logged_in_members},
    )


### Error


def error(request):
    messages.error(request, "Diese Seite wurde nicht gefunden.")
    return render(request, "teamized/club/error.html", status=404)
