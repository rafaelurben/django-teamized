"""OrgaTask API models"""

import uuid

from django.db import models
from django.contrib import admin
from django.conf import settings


class ApiKey(models.Model):
    """Model representing an api key
    An API key is an optional way to authenticate the user to the API."""

    key = models.UUIDField(
        verbose_name="Key",
        default=uuid.uuid4,
        unique=True,
    )
    name = models.CharField(
        verbose_name="Name",
        max_length=100,
        default="",
        blank=True,
    )
    user = models.ForeignKey(
        to=settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orgatask_apikeys",
    )

    read = models.BooleanField(
        verbose_name="Read permission?",
        default=True,
    )
    write = models.BooleanField(
        verbose_name="Write permission?",
        default=False,
    )

    objects = models.Manager()

    @admin.display(description="Api key")
    def __str__(self):
        perms = "read" if self.read and not self.write else "write" if self.write and not self.read else "read/write" if self.read and self.write else "UNUSABLE"
        return f"{self.name} ({perms}; {self.user.username})"

    @admin.display(description="Key preview")
    def key_preview(self) -> str:
        """Get the first and last letters of the key"""
        return str(self.key)[:3]+"..."+str(self.key)[-3:]

    def has_perm(self, *args, **kwargs) -> bool:
        """Shortcut for self.user.has_perm"""
        return self.user.has_perm(*args, **kwargs)

    def has_perms(self, *args, **kwargs) -> bool:
        """Shortcut for self.user.has_perms"""
        return self.user.has_perms(*args, **kwargs)

    class Meta:
        verbose_name = "API key"
        verbose_name_plural = "API keys"
