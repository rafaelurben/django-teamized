"""OrgaTask Models"""

from django.db import models
from django.conf import settings
from django.contrib import admin
from django.utils.translation import gettext as _
from django.utils import timezone

from orgatask.api.models import ApiKey
from orgatask import enums, options, exceptions

import uuid

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
            "id": self.user.uid,
            "username": self.user.auth_user.username,
            "email": self.user.auth_user.email,
            "first_name": self.user.auth_user.first_name,
            "last_name": self.user.auth_user.last_name,
        }

    def create_team(self, title, description):
        """
        Create a new team and add this user as an owner.
        """

        team = Team.objects.create(
            title=title,
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
                title=_("Persönlicher Arbeitsbereich"),
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

    title = models.CharField(
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
        return str(self.title)

    objects = models.Manager()

    class Meta:
        verbose_name = _("Team")
        verbose_name_plural = _("Teams")

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
            Member.objects.create(
                team=self,
                user=user,
                role=role,
            )

    def get_member(self, user: User):
        """
        Get the member instance of a user. 
        """

        return self.members.get(user=user)

    def create_invite(self, max_uses: int = 1, note: str = "", days_valid: float = 0.0):
        """
        Create a new invite. 
        
        Set days_valid to -1 to make it a permanent invite.
        Set days_valid to 0 to use the default.
        """

        if days_valid < 0:
            valid_until = None
        elif days_valid == 0.0:
            valid_until = timezone.now() + timezone.timedelta(days=options.DEFAULT_INVITE_EXPIRATION_DAYS)
        else:
            valid_until = timezone.now() + timezone.timedelta(days=days_valid)
        return self.invites.create(max_uses=max_uses, uses_left=max_uses, valid_until=valid_until, note=note)

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

    max_uses = models.PositiveIntegerField(default=1)
    uses_left = models.PositiveIntegerField(default=1)

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
            "expires": self.valid_until.timestamp(),
        }

    def get_time_left_days(self) -> float:
        "Get the time left in days until the invite expires."
        
        if self.valid_until is None:
            return float("inf")
        else:
            return (self.valid_until - timezone.now()).total_days()

    @admin.display(boolean=True)
    def is_valid(self) -> bool:
        "Check if the invitation is still valid"

        if self.uses_left <= 0:
            return False
        if self.valid_until and (self.valid_until - timezone.now()).total_seconds() <= 0:
            return False
        return True

    def accept(self, user: User) -> None:
        "Use the invitation"

        if not self.is_valid():
            raise exceptions.AlertException(
                _("Diese Einladung ist nicht mehr gültig."))
        if self.team.is_member(user):
            raise exceptions.AlertException(
                _("Du bist bereits in diesem Team."))

        self.team.join(user)

        self.uses_left -= 1
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
