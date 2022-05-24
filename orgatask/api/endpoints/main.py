"""Main API endpoints"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.translation import gettext as _

from orgatask import enums
from orgatask.api.constants import ENDPOINT_NOT_FOUND, NOT_IMPLEMENTED, DATA_INVALID, NO_PERMISSION, OBJ_NOT_FOUND
from orgatask.api.decorators import require_objects, api_view
from orgatask.decorators import orgatask_prep
from orgatask.models import Member, Team, Invite

@api_view(["get"])
@orgatask_prep()
def endpoint_profile(request):
    """
    Get the user's profile.
    """
    user = request.orgatask_user
    return JsonResponse({
        "user": user.as_dict(),
    })


@api_view(["get", "post"])
@csrf_exempt
@orgatask_prep()
def endpoint_teams(request):
    """
    Endpoint for listing and creating teams.
    """
    user = request.orgatask_user

    if request.method == "GET":
        full = bool(request.GET.get("full", False))
        if full:
            memberinstances = user.member_instances.all().select_related('team').prefetch_related('team__members').prefetch_related('team__invites').order_by("team__name")
        else:
            memberinstances = user.member_instances.all().select_related('team').order_by("team__name")
        return JsonResponse({
            "teams": [
                mi.team.as_dict(member=mi, full=full)
                for mi in memberinstances
            ],
            "defaultTeamId": memberinstances[0].team.uid,
        })
    if request.method == "POST":
        if not user.can_create_team():
            return JsonResponse({
                "error": "team_limit_reached",
                "alert": {
                    "title": _("Teamlimit erreicht"),
                    "text": _("Du hast das maximale Limit an Teams erreicht, welche du besitzen kannst."),
                }
            }, status=400)

        name = request.POST.get("name", "")[:49]
        description = request.POST.get("description", "")

        if not name or not description:
            return JsonResponse({
                "error": "data_invalid",
                "alert": {
                    "title": _("Daten ungültig"),
                    "text": _("Bitte fülle alle Felder aus."),
                }
            }, status=400)

        team = user.create_team(name, description)

        return JsonResponse({
            "success": True,
            "team": team.as_dict(member=team.get_member(user), full=True),
            "alert": {
                "title": _("Team erstellt"),
                "text": _("Das Team wurde erfolgreich erstellt."),
            }
        })


@api_view(["get", "post", "delete"])
@csrf_exempt
@orgatask_prep()
@require_objects([("team", Team, "team")])
def endpoint_team(request, team: Team):
    """
    Endpoint for managing or deleting a team.
    """

    user = request.orgatask_user

    if request.method == "GET":
        if not team.user_is_member(user):
            return NO_PERMISSION

        return JsonResponse({
            "id": team.uid,
            "team": team.as_dict(member=team.get_member(user)),
        })
    if request.method == "POST":
        if not team.user_is_owner(user):
            return NO_PERMISSION

        name = request.POST.get("name", "")[:49]
        description = request.POST.get("description", "")

        team.name = name
        team.description = description
        team.save()
        return JsonResponse({
            "success": True,
            "id": team.uid,
            "team": team.as_dict(member=team.get_member(user)),
            "alert": {
                "title": _("Team geändert"),
                "text": _("Das Team wurde erfolgreich geändert."),
            }
        })
    if request.method == "DELETE":
        if not team.user_is_owner(user):
            return NO_PERMISSION

        team.delete()
        return JsonResponse({
            "success": True,
            "id": team.uid,
            "alert": {
                "title": _("Team gelöscht"),
                "text": _("Das Team wurde erfolgreich gelöscht."),
            }
        })


@api_view(["get"])
@csrf_exempt
@orgatask_prep()
@require_objects([("team", Team, "team")])
def endpoint_members(request, team: Team):
    """
    Endpoint for listing members
    """

    user = request.orgatask_user

    if request.method == "GET":
        if not team.user_is_member(user):
            return NO_PERMISSION

        members = team.members.select_related('user', 'user__auth_user').order_by("user__auth_user__last_name", "user__auth_user__first_name")

        return JsonResponse({
            "members": [
                {
                    "id": m.uid,
                    "role": m.role,
                    "role_text": m.get_role_display(),
                    "user": m.user.as_dict(),
                }
                for m in members
            ]
        })


@api_view(["post", "delete"])
@csrf_exempt
@orgatask_prep()
@require_objects([("team", Team, "team"), ("member", Member, "member")])
def endpoint_member(request, team: Team, member: Member):
    """
    Endpoint for editing and deleting members
    """

    # Check if member is in team
    if member.team != team:
        return OBJ_NOT_FOUND

    # Check permissions
    user = request.orgatask_user
    if not team.user_is_admin(user):
        return NO_PERMISSION

    # Methods
    if request.method == "POST":
        role = request.POST.get("role", member.role)

        if role != member.role and not team.user_is_owner(user):
            # Only owner can change the role of a member
            return NO_PERMISSION
        if member.role == enums.Roles.OWNER:
            # Owners cannot change their roles
            return NO_PERMISSION
        if role not in [enums.Roles.MEMBER, enums.Roles.ADMIN]:
            # Check if role is valid
            return DATA_INVALID

        member.role = role
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
        if member.is_admin() and not team.user_is_owner(user):
            # Can't delete an admin if not owner
            return NO_PERMISSION

        member.delete()
        return JsonResponse({
            "success": True,
            "id": member.uid,
            "alert": {
                "title": _("Mitglied entfernt"),
                "text": _("Das Mitglied wurde erfolgreich entfernt."),
            }
        })


@api_view(["get", "post"])
@csrf_exempt
@orgatask_prep()
@require_objects([("team", Team, "team")])
def endpoint_invites(request, team: Team):
    """
    Endpoint for listing and creating invites
    """

    # Check permissions
    user = request.orgatask_user
    if not team.user_is_admin(user):
        return NO_PERMISSION

    # Methods
    if request.method == "GET":
        invites = team.invites.all().order_by("valid_until")

        return JsonResponse({
            "invites": [
                i.as_dict()
                for i in invites
            ]
        })
    if request.method == "POST":
        note = request.POST.get("note", "")
        try:
            uses = int(request.POST.get("uses", 1))
        except ValueError:
            uses = None
        try:
            days = float(request.POST.get("days", 0.0))
        except ValueError:
            days = None
        inv = team.create_invite(uses, note, days)
        return JsonResponse({
            "success": True,
            "invite": inv.as_dict(),
            "alert": {
                "title": _("Einladung erstellt"),
                "text": _("Token: %s") % str(inv.token),
                "timer": 0,
                "showConfirmButton": True,
                "toast": False,
                "position": "center",
            }
        })


@api_view(["post", "delete"])
@csrf_exempt
@orgatask_prep()
@require_objects([("team", Team, "team"), ("invite", Invite, "invite")])
def endpoint_invite(request, team: Team, invite: Invite):
    """
    Endpoint for update and deleting invites
    """

    # Check if invite belongs to team
    if invite.team != team:
        return OBJ_NOT_FOUND

    # Check permissions
    user = request.orgatask_user
    if not team.user_is_admin(user):
        return NO_PERMISSION

    # Methods
    if request.method == "POST":
        note = request.POST.get("note", "")
        try:
            uses = int(request.POST.get("uses", 1))
        except ValueError:
            uses = None
        try:
            days = float(request.POST.get("days", 0.0))
        except ValueError:
            days = None

        invite.update(uses, note, days)
        return JsonResponse({
            "success": True,
            "id": invite.uid,
            "invite": invite.as_dict(),
            "alert": {
                "title": _("Einladung geändert"),
                "text": _("Die Einladung wurde erfolgreich geändert."),
            }
        })
    if request.method == "DELETE":
        invite.delete()
        return JsonResponse({
            "success": True,
            "id": invite.uid,
            "alert": {
                "title": _("Einladung gelöscht"),
                "text": _("Die Einladung wurde erfolgreich gelöscht."),
            }
        })


@api_view(["post"])
@csrf_exempt
@orgatask_prep()
@require_objects([("team", Team, "team")])
def endpoint_team_leave(request, team: Team):
    """
    Endpoint for leaving a team.
    """

    user = request.orgatask_user

    if request.method == "POST":
        if not team.user_is_member(user):
            return NO_PERMISSION

        member = team.get_member(user)

        if member.is_owner():
            return JsonResponse({
                "error": "owner-can-not-leave",
                "alert": {
                    "title": _("Du bist Besitzer"),
                    "text": _("Du kannst dein Team nicht verlassen, da du der Eigentümer bist."),
                }
            }, status=400)

        member.delete()

        return JsonResponse({
            "success": True,
            "id": team.uid,
            "alert": {
                "title": _("Team verlassen"),
                "text": _("Du hast das Team %s verlassen.") % team.name,
            }
        })


@api_view(["post"])
@csrf_exempt
@orgatask_prep()
@require_objects([("invite", Invite, "invite", "token")])
def endpoint_invite_accept(request, invite: Invite):
    """
    Endpoint for accepting an invite.
    """

    user = request.orgatask_user

    if request.method == "POST":
        member = invite.accept(user)
        team = invite.team

        return JsonResponse({
            "success": True,
            "team": team.as_dict(member=member),
            "alert": {
                "title": _("Einladung akzeptiert"),
                "text": _("Du bist dem Team %s beigetreten.") % team.name,
            }
        })