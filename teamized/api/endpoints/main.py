"""Main API endpoints"""

from django.db import models
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.translation import gettext as _

from teamized import enums, exceptions
from teamized.api.utils.constants import (
    ENDPOINT_NOT_FOUND,
    NOT_IMPLEMENTED,
    DATA_INVALID,
    NO_PERMISSION,
    OBJ_NOT_FOUND,
)
from teamized.api.utils.decorators import require_objects, api_view
from teamized.decorators import teamized_prep
from teamized.models import User, Member, Team, Invite


@api_view(["get"])
@teamized_prep()
def endpoint_profile(request):
    """
    Endpoint for getting the user's profile.
    """
    user: User = request.teamized_user
    return JsonResponse(
        {
            "user": user.as_dict(),
        }
    )


@api_view(["get", "post"])
@csrf_exempt
@teamized_prep()
def endpoint_settings(request):
    """
    Endpoint for getting or modifying the user's settings.
    """
    user: User = request.teamized_user

    if request.method == "GET":
        return JsonResponse({"settings": user.settings_as_dict()})
    if request.method == "POST":
        user.update_settings_from_post_data(request.POST)
        return JsonResponse({"success": True, "settings": user.settings_as_dict()})


@api_view(["get", "post"])
@csrf_exempt
@teamized_prep()
def endpoint_teams(request):
    """
    Endpoint for listing and creating teams.
    """
    user: User = request.teamized_user

    if request.method == "GET":
        memberinstances = (
            user.member_instances.all()
            .select_related("team", "user")
            .order_by("team__name")
            .annotate(membercount=models.Count("team__members"))
        )
        return JsonResponse(
            {
                "teams": [
                    mi.team.as_dict(member=mi, membercount=mi.membercount)
                    for mi in memberinstances
                ],
                "defaultTeamId": memberinstances[0].team.uid,
            }
        )
    if request.method == "POST":
        if not user.can_create_team():
            return JsonResponse(
                {
                    "error": "team_limit_reached",
                    "alert": {
                        "title": _("Teamlimit erreicht"),
                        "text": _(
                            "Du hast das maximale Limit an Teams erreicht, welche du besitzen kannst. Kontaktiere "
                            "den Administrator, wenn du mehr Teams benötigst."
                        ),
                    },
                },
                status=400,
            )

        name = request.POST.get("name", "")[:49]
        description = request.POST.get("description", "")

        if not name or not description:
            return JsonResponse(
                {
                    "error": "data_invalid",
                    "alert": {
                        "title": _("Daten ungültig"),
                        "text": _("Bitte fülle alle Felder aus."),
                    },
                },
                status=400,
            )

        team = user.create_team(name, description)

        return JsonResponse(
            {
                "success": True,
                "team": team.as_dict(member=team.get_member(user)),
                "alert": {
                    "title": _("Team erstellt"),
                    "text": _("Das Team wurde erfolgreich erstellt."),
                },
            }
        )


@api_view(["get", "post", "delete"])
@csrf_exempt
@teamized_prep()
@require_objects([("team", Team, "team")])
def endpoint_team(request, team: Team):
    """
    Endpoint for managing or deleting a team.
    """

    user: User = request.teamized_user

    if request.method == "GET":
        if not team.user_is_member(user):
            return NO_PERMISSION

        return JsonResponse(
            {
                "id": team.uid,
                "team": team.as_dict(member=team.get_member(user)),
            }
        )
    if request.method == "POST":
        if not team.user_is_owner(user):
            return NO_PERMISSION

        name = request.POST.get("name", "")[:49]
        description = request.POST.get("description", "")

        team.name = name
        team.description = description
        team.save()
        return JsonResponse(
            {
                "success": True,
                "id": team.uid,
                "team": team.as_dict(member=team.get_member(user)),
                "alert": {
                    "title": _("Team geändert"),
                    "text": _("Das Team wurde erfolgreich geändert."),
                },
            }
        )
    if request.method == "DELETE":
        if not team.user_is_owner(user):
            return NO_PERMISSION

        if team.linked_club is not None:
            raise exceptions.AlertException(
                text=_(
                    "Solange der Vereinsmodus aktiv ist, kann das Team nicht gelöscht werden."
                ),
                title=_("Vereinsmodus aktiv"),
                errorname="club-mode-active",
            )

        if team.members.count() > 1:
            raise exceptions.AlertException(
                text=_(
                    "Das Team kann nicht gelöscht werden, da es noch Mitglieder enthält."
                ),
                title=_("Team ist nicht leer"),
                errorname="team-has-members",
            )

        team.delete()
        return JsonResponse(
            {
                "success": True,
                "alert": {
                    "title": _("Team gelöscht"),
                    "text": _("Das Team wurde erfolgreich gelöscht."),
                },
            }
        )


@api_view(["get"])
@csrf_exempt
@teamized_prep()
@require_objects([("team", Team, "team")])
def endpoint_members(request, team: Team):
    """
    Endpoint for listing members
    """

    user: User = request.teamized_user

    if request.method == "GET":
        if not team.user_is_member(user):
            return NO_PERMISSION

        members = team.members.select_related("user", "user__auth_user").order_by(
            "user__auth_user__last_name", "user__auth_user__first_name"
        )

        return JsonResponse({"members": [m.as_dict() for m in members]})


@api_view(["post", "delete"])
@csrf_exempt
@teamized_prep()
@require_objects([("team", Team, "team"), ("member", Member, "member")])
def endpoint_member(request, team: Team, member: Member):
    """
    Endpoint for editing and deleting members
    """

    # Check if member is in team
    if member.team != team:
        return OBJ_NOT_FOUND

    # Check permissions
    user: User = request.teamized_user
    if not team.user_is_admin(user):
        return NO_PERMISSION

    # Methods
    if request.method == "POST":
        role = request.POST.get("role", member.role)

        if role != member.role and not team.user_is_owner(user):
            # Only owners can change the role of a member
            return NO_PERMISSION
        if member.is_owner():
            # Roles of owners cannot be changed
            return NO_PERMISSION
        if role not in [enums.Roles.MEMBER, enums.Roles.ADMIN]:
            # Check if role is valid
            return DATA_INVALID

        member.role = role
        member.save()
        return JsonResponse(
            {
                "success": True,
                "id": member.uid,
                "member": member.as_dict(),
                "alert": {
                    "title": _("Mitglied aktualisiert"),
                    "text": _("Das Mitglied wurde erfolgreich aktualisiert."),
                },
            }
        )

    if request.method == "DELETE":
        if member.is_admin() and not team.user_is_owner(user):
            # Only owners can remove admins
            return NO_PERMISSION

        member.delete()
        return JsonResponse(
            {
                "success": True,
                "alert": {
                    "title": _("Mitglied entfernt"),
                    "text": _("Das Mitglied wurde erfolgreich entfernt."),
                },
            }
        )


@api_view(["get", "post"])
@csrf_exempt
@teamized_prep()
@require_objects([("team", Team, "team")])
def endpoint_invites(request, team: Team):
    """
    Endpoint for listing and creating invites
    """

    # Check permissions
    user: User = request.teamized_user
    if not team.user_is_admin(user):
        return NO_PERMISSION

    # Methods
    if request.method == "GET":
        invites = team.invites.all().order_by("valid_until")

        return JsonResponse({"invites": [i.as_dict() for i in invites]})
    if request.method == "POST":
        inv = Invite.from_post_data(request.POST, team)
        return JsonResponse(
            {
                "success": True,
                "invite": inv.as_dict(),
                "alert": {
                    "title": _("Einladung erstellt"),
                    "html": f"Token: {inv.token}<br />URL: <a href='{inv.url}'>%s</a>"
                    % _("Bitte kopier mich!"),
                    "timer": 0,
                    "showConfirmButton": True,
                    "toast": False,
                    "position": "center",
                },
            }
        )


@api_view(["post", "delete"])
@csrf_exempt
@teamized_prep()
@require_objects([("team", Team, "team"), ("invite", Invite, "invite")])
def endpoint_invite(request, team: Team, invite: Invite):
    """
    Endpoint for update and deleting invites
    """

    # Check if invite belongs to team
    if invite.team != team:
        return OBJ_NOT_FOUND

    # Check permissions
    user: User = request.teamized_user
    if not team.user_is_admin(user):
        return NO_PERMISSION

    # Methods
    if request.method == "POST":
        invite.update_from_post_data(request.POST)
        return JsonResponse(
            {
                "success": True,
                "id": invite.uid,
                "invite": invite.as_dict(),
                "alert": {
                    "title": _("Einladung geändert"),
                    "text": _("Die Einladung wurde erfolgreich geändert."),
                },
            }
        )
    if request.method == "DELETE":
        invite.delete()
        return JsonResponse(
            {
                "success": True,
                "alert": {
                    "title": _("Einladung gelöscht"),
                    "text": _("Die Einladung wurde erfolgreich gelöscht."),
                },
            }
        )


@api_view(["post"])
@csrf_exempt
@teamized_prep()
@require_objects([("team", Team, "team")])
def endpoint_team_leave(request, team: Team):
    """
    Endpoint for leaving a team.
    """

    user: User = request.teamized_user

    if request.method == "POST":
        if not team.user_is_member(user):
            return NO_PERMISSION

        member = team.get_member(user)

        if member.is_owner():
            return JsonResponse(
                {
                    "error": "owner-can-not-leave",
                    "alert": {
                        "title": _("Du bist Besitzer"),
                        "text": _(
                            "Du kannst dein Team nicht verlassen, da du der Eigentümer bist."
                        ),
                    },
                },
                status=400,
            )

        member.delete()

        return JsonResponse(
            {
                "success": True,
                "id": team.uid,
                "alert": {
                    "title": _("Team verlassen"),
                    "text": _("Du hast das Team %s verlassen.") % team.name,
                },
            }
        )


@api_view(["get"])
@csrf_exempt
@teamized_prep()
@require_objects([("invite", Invite, "invite", "token")], allow_none=True)
def endpoint_invite_info(request, invite: Invite):
    """
    Endpoint for getting information about an invite.
    """

    user: User = request.teamized_user

    if request.method == "GET":
        if invite is None:
            raise exceptions.AlertException(
                text=_("Diese Einladung existiert leider nicht (mehr), sorry."),
                title=_("Einladung nicht gefunden"),
                errorname="invite-not-found",
            )

        invite.check_validity_for_user(user)

        return JsonResponse({"status": "invite-valid", "team": invite.team.as_dict()})


@api_view(["post"])
@csrf_exempt
@teamized_prep()
@require_objects([("invite", Invite, "invite", "token")])
def endpoint_invite_accept(request, invite: Invite):
    """
    Endpoint for accepting an invite.
    """

    user: User = request.teamized_user

    if request.method == "POST":
        invite.check_validity_for_user(user)
        member = invite.accept(user)
        team = invite.team

        return JsonResponse(
            {
                "success": True,
                "team": team.as_dict(member=member),
                "alert": {
                    "title": _("Einladung akzeptiert"),
                    "text": _("Du bist dem Team %s beigetreten.") % team.name,
                },
            }
        )
