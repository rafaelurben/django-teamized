"""OrgaTask Models"""

from django.db import models
from django.conf import settings
from django.utils.translation import gettext as _

from orgatask.api.models import ApiKey
from orgatask import enums

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

    def ensure_organization(self):
        """
        Ensure that the OrgaTask.User owns at least one OrgaTask.Organization.
        If not, create one.
        """

        if not self.member_instances.filter(role=enums.Roles.OWNER).exists():
            organization = Organization.objects.create(
                title=_("Persönlicher Arbeitsbereich"),
                description=_(
                    "Persönlicher Arbeitsbereich von %s") % self.auth_user.username,
            )
            organization.join(self, role=enums.Roles.OWNER)


def get_default_organization_settings():
    return {"key": "value"}


class Organization(models.Model):
    "An organization"

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
        default=get_default_organization_settings,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.title)

    objects = models.Manager()

    class Meta:
        verbose_name = _("Organisation")
        verbose_name_plural = _("Organisationen")

    def is_member(self, user: User):
        """
        Check if a user is a member of the organization.
        """

        return self.members.filter(user=user).exists()

    def join(self, user: User, role: str = enums.Roles.MEMBER):
        "Add a user to the organization if they are not already a member"

        if not self.is_member(user):
            Member.objects.create(
                organization=self,
                user=user,
                role=role,
            )


class Member(models.Model):
    "Connection between User and Organization"

    uid = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    organization = models.ForeignKey(
        to="Organization",
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
        return f"{self.user} <-> {self.organization}"

    objects = models.Manager()

    class Meta:
        verbose_name = _("Mitglied")
        verbose_name_plural = _("Mitglieder")


# class OrgLog(models.Model):
#     "Used for logging changes in an organization"

#     uid = models.UUIDField(
#         primary_key=True,
#         default=uuid.uuid4,
#         editable=False,
#     )

#     organization = models.ForeignKey(
#         to='Organization',
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
#         default=enums.Scopes.ORGANIZATION,
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
