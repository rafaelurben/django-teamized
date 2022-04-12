"""OrgaTask Models"""

from django.db import models
from django.conf import settings
from django.utils.translation import gettext as _

from orgatask.api.models import ApiKey
from orgatask import enums, options

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

    def ensure_team(self):
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

    def can_create_team(self):
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

    def user_is_member(self, user: User):
        """
        Check if a user is a member of the team.
        """

        return self.members.filter(user=user).exists()

    def user_is_admin(self, user: User):
        """
        Check if a user is an admin (or owner) of the team.
        """

        return self.members.filter(user=user, role__in=[enums.Roles.ADMIN, enums.Roles.OWNER]).exists()
    
    def user_is_owner(self, user: User):
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
