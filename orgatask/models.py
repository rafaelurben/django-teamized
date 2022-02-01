from django.db import models
from django.conf import settings

import orgatask.api.models as apimodels

# Create your models here.


class Organization(models.Model):
    "An organization"

    @classmethod
    def get_default_settings(cls):
        return {"key": "value"}

    owner = models.ForeignKey(
        to=settings.AUTH_USER_MODEL,
        related_name="+",
        on_delete=models.PROTECT
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
        related_name="orgatask_members",
        on_delete=models.CASCADE,
    )

    is_manager = models.BooleanField(
        default=False,
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
