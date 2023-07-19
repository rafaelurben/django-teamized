"""Main API endpoints"""

from django.db import models
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.translation import gettext as _

from teamized import enums, exceptions
from teamized.api.utils.constants import ENDPOINT_NOT_FOUND, NOT_IMPLEMENTED, DATA_INVALID, NO_PERMISSION, OBJ_NOT_FOUND
from teamized.api.utils.decorators import require_objects, api_view
from teamized.decorators import teamized_prep
from teamized.club.models import Club, ClubMember, ClubMemberMagicLink
from teamized.models import User, Team

@api_view(["get", "post", "delete"])
@csrf_exempt
@teamized_prep()
@require_objects([("team", Team, "team")])
def endpoint_club(request, team: Team):
    """
    Endpoint for managing or deleting the club connected to the team.
    """

    user: User = request.teamized_user
    if not team.user_is_member(user):
        return NO_PERMISSION

    if team.linked_club is None:
        return ENDPOINT_NOT_FOUND
    club: Club = team.linked_club

    if request.method == "GET":
        return JsonResponse({
            "id": team.uid,
            "club": club.as_dict(),
        })
    if request.method == "POST":
        if not team.user_is_owner(user):
            return NO_PERMISSION

        name = request.POST.get("name", "")[:49]
        description = request.POST.get("description", "")

        club.name = name
        club.description = description
        club.save()
        return JsonResponse({
            "success": True,
            "id": club.uid,
            "club": club.as_dict(),
            "alert": {
                "title": _("Verein geändert"),
                "text": _("Der Verein wurde erfolgreich geändert."),
            }
        })
    if request.method == "DELETE":
        if not team.user_is_owner(user):
            return NO_PERMISSION

        club.delete()
        return JsonResponse({
            "success": True,
            "alert": {
                "title": _("Verein gelöscht"),
                "text": _("Der Verein wurde erfolgreich gelöscht."),
            }
        })


@api_view(["get", "post"])
@csrf_exempt
@teamized_prep()
@require_objects([("team", Team, "team")])
def endpoint_members(request, team: Team):
    """
    Endpoint for listing and creating club members
    """

    user: User = request.teamized_user
    if not team.user_is_member(user):
        return NO_PERMISSION

    if team.linked_club is None:
        return ENDPOINT_NOT_FOUND
    club: Club = team.linked_club

    if request.method == "GET":
        members = club.members.order_by("first_name", "last_name")

        return JsonResponse({
            "members": [
                member.as_dict() for member in members
            ]
        })
    if request.method == "POST":
        if not team.user_is_admin(user):
            return NO_PERMISSION

        member = ClubMember.from_post_data(request.POST, club=club)

        return JsonResponse({
            "success": True,
            "member": member.as_dict(),
            "alert": {
                "title": _("Vereinsmitglied erstellt"),
                "text": _("Das Vereinsmitglied wurde erfolgreich hinzugefügt."),
            }
        })


@api_view(["post", "delete"])
@csrf_exempt
@teamized_prep()
@require_objects([("team", Team, "team"), ("member", ClubMember, "member")])
def endpoint_member(request, team: Team, member: ClubMember):
    """
    Endpoint for editing and deleting a member
    """

    user: User = request.teamized_user
    if not team.user_is_admin(user):
        return NO_PERMISSION

    if team.linked_club is None:
        return ENDPOINT_NOT_FOUND
    club: Club = team.linked_club

    # Check if member corresponds to club
    if member.club != club:
        return OBJ_NOT_FOUND

    # Methods
    if request.method == "POST":
        member.update_from_post_data(request.POST)
        member.save()
        return JsonResponse({
            "success": True,
            "id": member.uid,
            "member": member.as_dict(),
            "alert": {
                "title": _("Mitglied aktualisiert"),
                "text": _("Das Mitglied wurde erfolgreich aktualisiert."),
            }
        })


    if request.method == "DELETE":
        member.delete()
        return JsonResponse({
            "success": True,
            "alert": {
                "title": _("Mitglied entfernt"),
                "text": _("Das Mitglied wurde erfolgreich entfernt."),
            }
        })
