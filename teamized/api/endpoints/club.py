"""Main API endpoints"""

from django.db import models
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.translation import gettext as _

from teamized import enums, exceptions
from teamized.api.utils.constants import ENDPOINT_NOT_FOUND, NOT_IMPLEMENTED, DATA_INVALID, NO_PERMISSION, OBJ_NOT_FOUND
from teamized.api.utils.decorators import require_objects, api_view
from teamized.decorators import teamized_prep
from teamized.club.models import Club
from teamized.models import User, Member, Team, Invite

# @api_view(["get", "post", "delete"])
# @csrf_exempt
# @teamized_prep()
# @require_objects([("team", Team, "team")])
# def endpoint_club(request, team: Team):
#     """
#     Endpoint for managing or deleting a team.
#     """

#     user: User = request.teamized_user
#     if not team.user_is_member(user):
#         return NO_PERMISSION

#     if team.linked_club is None:
#         return OBJ_NOT_FOUND
#     club: Club = team.linked_club

#     if request.method == "GET":
#         return JsonResponse({
#             "id": team.uid,
#             "club": club.as_dict(),
#         })
#     if request.method == "POST":
#         if not team.user_is_owner(user):
#             return NO_PERMISSION

#         name = request.POST.get("name", "")[:49]
#         description = request.POST.get("description", "")

#         team.name = name
#         team.description = description
#         team.save()
#         return JsonResponse({
#             "success": True,
#             "id": team.uid,
#             "team": team.as_dict(member=team.get_member(user)),
#             "alert": {
#                 "title": _("Team geändert"),
#                 "text": _("Das Team wurde erfolgreich geändert."),
#             }
#         })
#     if request.method == "DELETE":
#         if not team.user_is_owner(user):
#             return NO_PERMISSION

#         team.delete()
#         return JsonResponse({
#             "success": True,
#             "alert": {
#                 "title": _("Team gelöscht"),
#                 "text": _("Das Team wurde erfolgreich gelöscht."),
#             }
#         })


# @api_view(["get"])
# @csrf_exempt
# @teamized_prep()
# @require_objects([("team", Team, "team")])
# def endpoint_members(request, team: Team):
#     """
#     Endpoint for listing club members
#     """

#     user: User = request.teamized_user

#     if not team.user_is_member(user):
#         return NO_PERMISSION

#     if request.method == "GET":

#         members = team.members.select_related('user', 'user__auth_user').order_by("user__auth_user__last_name", "user__auth_user__first_name")

#         return JsonResponse({
#             "members": [
#                 {
#                     "id": m.uid,
#                     "role": m.role,
#                     "role_text": m.get_role_display(),
#                     "user": m.user.as_dict(),
#                 }
#                 for m in members
#             ]
#         })


# @api_view(["post", "delete"])
# @csrf_exempt
# @teamized_prep()
# @require_objects([("team", Team, "team"), ("member", Member, "member")])
# def endpoint_member(request, team: Team, member: Member):
#     """
#     Endpoint for editing and deleting members
#     """

#     # Check if member is in team
#     if member.team != team:
#         return OBJ_NOT_FOUND

#     # Check permissions
#     user: User = request.teamized_user
#     if not team.user_is_admin(user):
#         return NO_PERMISSION

#     # Methods
#     if request.method == "POST":
#         role = request.POST.get("role", member.role)

#         if role != member.role and not team.user_is_owner(user):
#             # Only owners can change the role of a member
#             return NO_PERMISSION
#         if member.role == enums.Roles.OWNER:
#             # Roles of owners cannot be changed
#             return NO_PERMISSION
#         if role not in [enums.Roles.MEMBER, enums.Roles.ADMIN]:
#             # Check if role is valid
#             return DATA_INVALID

#         member.role = role
#         member.save()
#         return JsonResponse({
#             "success": True,
#             "id": member.uid,
#             "member": member.as_dict(),
#             "alert": {
#                 "title": _("Mitglied aktualisiert"),
#                 "text": _("Das Mitglied wurde erfolgreich aktualisiert."),
#             }
#         })


#     if request.method == "DELETE":
#         if member.is_admin() and not team.user_is_owner(user):
#             # Only owners can remove admins
#             return NO_PERMISSION

#         member.delete()
#         return JsonResponse({
#             "success": True,
#             "alert": {
#                 "title": _("Mitglied entfernt"),
#                 "text": _("Das Mitglied wurde erfolgreich entfernt."),
#             }
#         })
