"""Club main API endpoints"""

from django.db.models import QuerySet
from django.http import JsonResponse
from django.utils.translation import gettext as _

from teamized.api.utils.constants import (
    ENDPOINT_NOT_FOUND,
    DATA_INVALID,
    NO_PERMISSION,
    OBJ_NOT_FOUND,
)
from teamized.api.utils.decorators import require_objects, api_view
from teamized.club.models import Club, ClubMember, ClubMemberGroup
from teamized.decorators import teamized_prep
from teamized.models import User, Team


@api_view(["post"])
@teamized_prep()
@require_objects([("team", Team, "team")])
def endpoint_create_club(request, team: Team):
    """Endpoint for creating a club"""

    user: User = request.teamized_user
    if not team.user_is_owner(user):
        return NO_PERMISSION

    if team.linked_club is not None:
        return ENDPOINT_NOT_FOUND

    if request.method == "POST":
        club = Club.from_post_data(request.POST)
        team.linked_club = club
        team.save()

        return JsonResponse(
            {
                "success": True,
                "id": club.uid,
                "club": club.as_dict(),
                "alert": {
                    "title": _("Verein erstellt"),
                    "text": _("Der Verein wurde erfolgreich erstellt."),
                },
            }
        )
    return None


@api_view(["get", "post", "delete"])
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
        return JsonResponse(
            {
                "id": club.uid,
                "club": club.as_dict(),
            }
        )
    if request.method == "POST":
        if not team.user_is_owner(user):
            return NO_PERMISSION

        club.update_from_post_data(request.POST)
        return JsonResponse(
            {
                "success": True,
                "id": club.uid,
                "club": club.as_dict(),
                "alert": {
                    "title": _("Verein geändert"),
                    "text": _("Der Verein wurde erfolgreich geändert."),
                },
            }
        )
    if request.method == "DELETE":
        if not team.user_is_owner(user):
            return NO_PERMISSION

        club.delete()
        return JsonResponse(
            {
                "success": True,
                "alert": {
                    "title": _("Verein gelöscht"),
                    "text": _("Der Verein wurde erfolgreich gelöscht."),
                },
            }
        )
    return None


@api_view(["get", "post"])
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

        return JsonResponse({"members": [member.as_dict() for member in members]})
    if request.method == "POST":
        if not team.user_is_admin(user):
            return NO_PERMISSION

        member = ClubMember.from_post_data(request.POST, club=club)

        return JsonResponse(
            {
                "success": True,
                "member": member.as_dict(),
                "alert": {
                    "title": _("Vereinsmitglied erstellt"),
                    "text": _("Das Vereinsmitglied wurde erfolgreich hinzugefügt."),
                },
            }
        )
    return None


@api_view(["post", "delete"])
@teamized_prep()
@require_objects([("team", Team, "team"), ("member", ClubMember, "member")])
def endpoint_member(request, team: Team, member: ClubMember):
    """
    Endpoint for editing and deleting a club member
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
        return JsonResponse(
            {
                "success": True,
                "id": member.uid,
                "member": member.as_dict(),
                "alert": {
                    "title": _("Vereinsmitglied aktualisiert"),
                    "text": _("Das Vereinsmitglied wurde erfolgreich aktualisiert."),
                },
            }
        )

    if request.method == "DELETE":
        member.delete()
        return JsonResponse(
            {
                "success": True,
                "alert": {
                    "title": _("Vereinsmitglied entfernt"),
                    "text": _("Das Vereinsmitglied wurde erfolgreich entfernt."),
                },
            }
        )
    return None


@api_view(["get", "post"])
@teamized_prep()
@require_objects([("team", Team, "team"), ("member", ClubMember, "member")])
def endpoint_member_portfolio(request, team: Team, member: ClubMember):
    """
    Endpoint for editing a club member's portfolio
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
    if request.method == "GET":
        return JsonResponse(
            {
                "id": member.uid,
                "portfolio": member.portfolio_as_dict(),
            }
        )

    if request.method == "POST":
        member.update_portfolio_from_post_data(request.POST)
        return JsonResponse(
            {
                "success": True,
                "id": member.uid,
                "portfolio": member.portfolio_as_dict(),
                "alert": {
                    "title": _("Portfolio aktualisiert"),
                    "text": _("Das Vereinsmitglied wurde erfolgreich aktualisiert."),
                },
            }
        )
    return None


@api_view(["post", "delete"])
@teamized_prep()
@require_objects(
    [
        ("team", Team, "team"),
        ("member", ClubMember, "member"),
        ("group", ClubMemberGroup, "group"),
    ]
)
def endpoint_member_groupmembership(
    request, team: Team, member: ClubMember, group: ClubMemberGroup
):
    """
    Endpoint for editing group membership of a club member
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
    # Check if group corresponds to club
    if group.club != club:
        return OBJ_NOT_FOUND

    # Methods
    if request.method == "POST":
        if member.groups.filter(uid=group.uid).exists():
            return DATA_INVALID
        member.groups.add(group, through_defaults={})
        return JsonResponse(
            {
                "success": True,
                "id": member.uid,
                "member": member.as_dict(),
                "alert": {
                    "title": _("Gruppe hinzugefügt"),
                    "text": _("Das Vereinsmitglied wurde erfolgreich der Gruppe hinzugefügt."),
                },
            }
        )

    if request.method == "DELETE":
        if not member.groups.filter(uid=group.uid).exists():
            return DATA_INVALID
        member.groups.remove(group)
        return JsonResponse(
            {
                "success": True,
                "alert": {
                    "title": _("Gruppe entfernt"),
                    "text": _("Das Vereinsmitglied wurde erfolgreich aus der Gruppe entfernt."),
                },
            }
        )
    return None


@api_view(["post"])
@teamized_prep()
@require_objects([("team", Team, "team"), ("member", ClubMember, "member")])
def endpoint_member_create_magic_link(request, team: Team, member: ClubMember):
    """
    Endpoint for creating a magic link for a club member. (owner only)
    """

    user: User = request.teamized_user
    if not team.user_is_owner(user):
        return NO_PERMISSION

    if team.linked_club is None:
        return ENDPOINT_NOT_FOUND
    club: Club = team.linked_club

    # Check if member corresponds to club
    if member.club != club:
        return OBJ_NOT_FOUND

    # Methods
    if request.method == "POST":
        link = member.create_magic_link()
        url = link.get_absolute_url(request)

        return JsonResponse(
            {
                "success": True,
                "url": url,
                "alert": {
                    "title": _("Magischer Link erstellt"),
                    "html": f"URL: <a href='{url}'>%s</a>" % _("Bitte kopier mich!"),
                    "timer": 0,
                    "showConfirmButton": True,
                    "toast": False,
                    "position": "center",
                    "allowOutsideClick": False,
                    "allowEscapeKey": False,
                },
            }
        )
    return None


@api_view(["get", "post"])
@teamized_prep()
@require_objects([("team", Team, "team")])
def endpoint_groups(request, team: Team):
    """
    Endpoint for listing and creating club member groups
    """

    user: User = request.teamized_user
    if not team.user_is_member(user):
        return NO_PERMISSION

    if team.linked_club is None:
        return ENDPOINT_NOT_FOUND
    club: Club = team.linked_club

    is_admin: bool = team.user_is_admin(user)

    if request.method == "GET":
        groups: QuerySet[ClubMemberGroup] = club.groups.order_by("name")

        return JsonResponse(
            {"groups": [group.as_dict(request, include_shared_url=is_admin) for group in groups]}
        )
    if request.method == "POST":
        if not is_admin:
            return NO_PERMISSION

        group = ClubMemberGroup.from_post_data(request.POST, club=club)

        return JsonResponse(
            {
                "success": True,
                "group": group.as_dict(request, include_shared_url=True),
                "alert": {
                    "title": _("Gruppe erstellt"),
                    "text": _("Die Gruppe wurde erfolgreich hinzugefügt."),
                },
            }
        )
    return None


@api_view(["post", "delete"])
@teamized_prep()
@require_objects([("team", Team, "team"), ("group", ClubMemberGroup, "group")])
def endpoint_group(request, team: Team, group: ClubMemberGroup):
    """
    Endpoint for editing and deleting a club member group
    """

    user: User = request.teamized_user
    if not team.user_is_admin(user):
        return NO_PERMISSION

    if team.linked_club is None:
        return ENDPOINT_NOT_FOUND
    club: Club = team.linked_club

    # Check if member group corresponds to club
    if group.club != club:
        return OBJ_NOT_FOUND

    # Methods
    if request.method == "POST":
        group.update_from_post_data(request.POST)
        group.save()
        return JsonResponse(
            {
                "success": True,
                "id": group.uid,
                "group": group.as_dict(request, include_shared_url=True),
                "alert": {
                    "title": _("Gruppe aktualisiert"),
                    "text": _("Die Gruppe wurde erfolgreich aktualisiert."),
                },
            }
        )

    if request.method == "DELETE":
        group.delete()
        return JsonResponse(
            {
                "success": True,
                "alert": {
                    "title": _("Gruppe entfernt"),
                    "text": _("Die Gruppe wurde erfolgreich entfernt."),
                },
            }
        )
    return None
