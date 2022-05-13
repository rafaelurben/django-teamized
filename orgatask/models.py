"""OrgaTask Models"""

import uuid

from django.db import models
from django.conf import settings
from django.contrib import admin
from django.utils.translation import gettext as _
from django.utils import timezone

from orgatask import enums, options, exceptions

# Create your models here.


def get_default_user_settings():
    return {"key": "value"}


class User(models.Model):
    """
    An intermediary model for user settings and database relations.
    """

    uid = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    auth_user = models.OneToOneField(
        to=settings.AUTH_USER_MODEL,
        related_name="orgatask_user",
        on_delete=models.CASCADE,
    )

    settings = models.JSONField(
        blank=True,
        default=get_default_user_settings,
    )

    def __str__(self):
        return str(self.auth_user)

    objects = models.Manager()

    class Meta:
        verbose_name = _("Benutzer")
        verbose_name_plural = _("Benutzer")

    def as_dict(self) -> dict:
        return {
            "id": self.uid,
            "username": self.auth_user.username,
            "email": self.auth_user.email,
            "first_name": self.auth_user.first_name,
            "last_name": self.auth_user.last_name,
        }

    def create_team(self, name, description):
        """
        Create a new team and add this user as an owner.
        """

        team = Team.objects.create(
            name=name,
            description=description,
        )
        team.join(self, role=enums.Roles.OWNER)
        return team

    def ensure_team(self) -> None:
        """
        Ensure that the user owns at least one team.
        If not, create one.
        """

        if not self.member_instances.filter(role=enums.Roles.OWNER).exists():
            self.create_team(
                name=_("Persönlicher Arbeitsbereich"),
                description=_(
                    "Persönlicher Arbeitsbereich von %s") % self.auth_user.username,
            )

    def can_create_team(self) -> bool:
        """
        Check if the user can create a team.
        """

        return self.member_instances.filter(role=enums.Roles.OWNER).count() < options.MAX_OWNED_TEAMS


def get_default_team_settings():
    return {"key": "value"}


class Team(models.Model):
    "A team"

    uid = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    name = models.CharField(
        max_length=50,
    )
    description = models.TextField(
        blank=True,
        default="",
    )
    settings = models.JSONField(
        blank=True,
        default=get_default_team_settings,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.name)

    objects = models.Manager()

    class Meta:
        verbose_name = _("Team")
        verbose_name_plural = _("Teams")

    def as_dict(self, member=None) -> dict:
        data = {
            "id": self.uid,
            "name": self.name,
            "description": self.description,
        }
        if member:
            data["member"] = member.as_dict()
        return data

    def user_is_member(self, user: User) -> bool:
        """
        Check if a user is a member of the team.
        """

        return self.members.filter(user=user).exists()

    def user_is_admin(self, user: User) -> bool:
        """
        Check if a user is an admin (or owner) of the team.
        """

        return self.members.filter(user=user, role__in=[enums.Roles.ADMIN, enums.Roles.OWNER]).exists()

    def user_is_owner(self, user: User) -> bool:
        """
        Check if a user is the owner of the team.
        """

        return self.members.filter(user=user, role=enums.Roles.OWNER).exists()

    def join(self, user: User, role: str = enums.Roles.MEMBER):
        """
        Add a user to the team if they are not already a member
        """

        if not self.user_is_member(user):
            return Member.objects.create(
                team=self,
                user=user,
                role=role,
            )
        return self.get_member(user)

    def get_member(self, user: User):
        """
        Get the member instance of a user. 
        """

        return self.members.get(user=user)

    def create_invite(self, uses_left: int = 1, note: str = "", days_valid: float = 0.0):
        """
        Create a new invite. See Invite.update() for more information about the parameters.
        """

        invite = self.invites.create()
        invite.update(uses_left=uses_left, note=note, days_valid=days_valid)
        return invite

class Member(models.Model):
    "Connection between User and Team"

    uid = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    team = models.ForeignKey(
        to="Team",
        related_name="members",
        on_delete=models.CASCADE,
    )
    user = models.ForeignKey(
        to='User',
        related_name="member_instances",
        on_delete=models.CASCADE,
    )

    role = models.CharField(
        max_length=16,
        default=enums.Roles.MEMBER,
        choices=enums.Roles.ROLES,
    )
    note = models.TextField(
        blank=True,
        default="",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} <-> {self.team}"

    objects = models.Manager()

    class Meta:
        verbose_name = _("Mitglied")
        verbose_name_plural = _("Mitglieder")

    def as_dict(self) -> dict:
        return {
            "id": self.uid,
            "role": self.role,
            "role_text": self.get_role_display(),
            "user": self.user.as_dict(),
        }

    def is_admin(self):
        """
        Checks if the member is an admin
        """
        return self.role in [enums.Roles.ADMIN, enums.Roles.OWNER]

    def is_owner(self):
        """
        Checks if the member is the owner
        """
        return self.role == enums.Roles.OWNER

class Invite(models.Model):
    "Invites for teams"

    NOT_FOUND_TITLE = _("Einladung ungültig")
    NOT_FOUND_TEXT = _("Eine Einladung mit dem angegebenen Token konnte nicht gefunden werden.")

    uid = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    token = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
    )

    team = models.ForeignKey(
        to="Team",
        related_name="invites",
        on_delete=models.CASCADE,
    )

    uses_left = models.PositiveIntegerField(default=1)
    uses_used = models.PositiveIntegerField(default=0)

    note = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    valid_until = models.DateTimeField(null=True, blank=True, default=None)

    def __str__(self) -> str:
        return f"{self.team} <-> {str(self.token)[:5]}..."

    objects = models.Manager()

    class Meta:
        verbose_name = _("Einladung")
        verbose_name_plural = _("Einladungen")

    def as_dict(self) -> dict:
        return {
            "id": self.uid,
            "token": self.token,
            "note": self.note,
            "is_valid": self.is_valid(),
            "uses_left": self.uses_left,
            "uses_used": self.uses_used,
            "valid_until": None if self.valid_until is None else self.valid_until.timestamp(),
        }

    def get_time_left_days(self) -> float:
        "Get the time left in days until the invite expires."

        if self.valid_until is None:
            return float("inf")
        return (self.valid_until - timezone.now()).total_days()

    @admin.display(boolean=True)
    def is_valid(self) -> bool:
        "Check if the invitation is still valid"

        if self.uses_left <= 0:
            return False
        if self.valid_until is not None and (self.valid_until - timezone.now()).total_seconds() <= 0:
            return False
        return True

    def accept(self, user: User) -> None:
        "Use the invitation"

        if self.team.user_is_member(user):
            raise exceptions.AlertException(
                text=_("Du bist bereits in diesem Team."),
                title=_("Bereits beigetreten"),
                errorname="invite-already-member")
        if not self.is_valid():
            raise exceptions.AlertException(
                text=_("Diese Einladung ist nicht mehr gültig."),
                title=_("Einladung ungültig"),
                errorname="invite-invalid")

        self.uses_left -= 1
        self.uses_used += 1
        self.save()

        return self.team.join(user)

    def update(self, uses_left: int = None, note: str = None, days_valid: float = None):
        """
        Update the invite

        Set days_valid to -1 to make it a permanent invite.
        Set days_valid to 0 to use the default.
        """

        if uses_left is not None:
            if uses_left < 0:
                self.uses_left = options.DEFAULT_INVITE_USES
            else:
                self.uses_left = uses_left

        if days_valid is not None:
            if days_valid < 0:
                self.valid_until = None
            elif days_valid == 0.0:
                self.valid_until = timezone.now() + \
                    timezone.timedelta(days=options.DEFAULT_INVITE_EXPIRATION_DAYS)
            else:
                self.valid_until = timezone.now() + timezone.timedelta(days=days_valid)

        self.note = note
        self.save()

# class TeamLog(models.Model):
#     "Used for logging changes in a team"

#     uid = models.UUIDField(
#         primary_key=True,
#         default=uuid.uuid4,
#         editable=False,
#     )

#     team = models.ForeignKey(
#         to='Team',
#         related_name="logs",
#         on_delete=models.CASCADE,
#     )
#     user = models.ForeignKey(
#         to='User',
#         related_name="orgatask_logs",
#         null=True,
#         on_delete=models.SET_NULL,
#     )

#     scope = models.CharField(
#         max_length=16,
#         default=enums.Scopes.TEAM,
#         choices=enums.Scopes.SCOPES,
#     )
#     action = models.CharField(
#         max_length=16,
#         default=enums.Actions.CREATE,
#         choices=enums.Actions.ACTIONS,
#     )
#     data = models.JSONField(
#     )

#     created_at = models.DateTimeField(auto_now_add=True)

#     objects = models.Manager()

#     class Meta:
#         verbose_name = _("Log")
#         verbose_name_plural = _("Logs")
