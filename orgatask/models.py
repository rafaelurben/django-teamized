from django.db import models
from django.conf import settings
from django.utils.translation import gettext as _

from orgatask.api.models import ApiKey
from orgatask import enums, utils

# Create your models here.


class Organization(models.Model):
    "An organization"

    @classmethod
    def get_default_settings(cls):
        return {"key": "value"}

    title = models.CharField(
        max_length=50,
    )
    description = models.TextField(
        blank=True,
        default="",
    )
    settings = models.JSONField(
        blank=True,
        default=get_default_settings,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.title)


class Member(models.Model):
    "Connection between User and Organization"

    @classmethod
    def get_default_settings(cls):
        return {"key": "value"}

    organization = models.ForeignKey(
        to="Organization",
        related_name="members",
        on_delete=models.CASCADE,
    )
    user = models.ForeignKey(
        to=settings.AUTH_USER_MODEL,
        related_name="orgatask_member_instances",
        on_delete=models.CASCADE,
    )

    role = models.CharField(
        max_length=16,
        default="member",
        choices=enums.ROLES,
    )
    note = models.TextField(
        blank=True,
        default="",
    )
    settings = models.JSONField(
        blank=True,
        default=get_default_settings,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} <-> {self.organization}"

    def get_json(self, include_org=False, include_user=False):
        "Return a JSON representation of this object."
        data = {
            "id": self.id,
            "role": self.role,
            "note": self.note,
            "settings": self.settings,
            "created_at": self.created_at.timestamp(),
            "updated_at": self.updated_at.timestamp(),
        }
        if include_org:
            data["organization"] = self.organization.get_json()
        if include_user:
            data["user"] = utils.user_as_json(self.user)
        return data

class OrgLog(models.Model):
    "Used for logging changes in an organization"

    organization = models.ForeignKey(
        to="Organization",
        related_name="logs",
        on_delete=models.CASCADE,
    )
    user = models.ForeignKey(
        to=settings.AUTH_USER_MODEL,
        related_name="orgatask_logs",
        null=True,
        on_delete=models.SET_NULL,
    )

    scope = models.CharField(
        max_length=16,
        default="organization",
        choices=enums.SCOPES,
    )
    action = models.CharField(
        max_length=16,
        default="create",
        choices=enums.ACTIONS,
    )
    data = models.JSONField(
    )

    created_at = models.DateTimeField(auto_now_add=True)
