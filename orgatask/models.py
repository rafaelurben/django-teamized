"""OrgaTask Models"""

import uuid
import hashlib
import typing

from django.db import models
from django.conf import settings
from django.contrib import admin
from django.http import HttpResponse
from django.utils.translation import gettext as _
from django.utils import timezone

from orgatask import enums, options, exceptions, utils

# Create your models here.


class User(models.Model):
    """
    An intermediary model to extend the auth user model.
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
            "avatar_url": self.avatar_url,
        }

    @property
    def avatar_url(self) -> str:
        mailhash = hashlib.md5(str(self.auth_user.email).encode("utf-8")).hexdigest()
        return "https://www.gravatar.com/avatar/"+mailhash

    def create_team(self, name, description) -> "Team":
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
                name=_("Team von %s") % self.auth_user.username,
                description=_(
                    "Persönlicher Arbeitsbereich von %s") % self.auth_user.username,
            )

    def can_create_team(self) -> bool:
        """
        Check if the user can create a team.
        """

        return self.member_instances.filter(role=enums.Roles.OWNER).count() < options.MAX_OWNED_TEAMS

    def get_active_work_session(self) -> typing.Union["WorkSession", None]:
        """
        Get the active work session for this user.
        """

        if self.work_sessions.filter(is_ended=False, is_created_via_tracking=True).exists():
            return self.work_sessions.get(is_ended=False, is_created_via_tracking=True)
        return None


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

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.name)

    objects = models.Manager()

    class Meta:
        verbose_name = _("Team")
        verbose_name_plural = _("Teams")

    def as_dict(self, member=None, full: bool=False) -> dict:
        data = {
            "id": self.uid,
            "name": self.name,
            "description": self.description,
        }
        if member:
            data["member"] = member.as_dict()
        if full:
            data["members"] = [m.as_dict() for m in self.members.select_related('user', 'user__auth_user').order_by('user__auth_user__first_name', 'user__auth_user__last_name').all()]
            data["invites"] = [i.as_dict() for i in self.invites.order_by('valid_until').all()]
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

    def join(self, user: User, role: str = enums.Roles.MEMBER) -> "Member":
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

    def get_member(self, user: User) -> "Member":
        """
        Get the member instance of a user.
        """

        return self.members.get(user=user)

    def create_invite(self, uses_left: int = 1, note: str = "", days_valid: float = 0.0) -> "Invite":
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

    def is_admin(self) -> bool:
        """
        Checks if the member is an admin
        """
        return self.role in [enums.Roles.ADMIN, enums.Roles.OWNER]

    def is_owner(self) -> bool:
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

    def check_validity_for_user(self, user: User) -> bool:
        "Check if an user can use an invite - raise AlertEcxeption if not."

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
        return True

    def accept(self, user: User) -> "Member":
        "Use the invitation (IMPORTANT: Check validity first via check_validity_for_user()!)"

        self.uses_left -= 1
        self.uses_used += 1
        self.save()

        return self.team.join(user)

    def update(self, uses_left: int = None, note: str = None, days_valid: float = None) -> None:
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

class WorkSession(models.Model):
    "Model for logging work sessions"

    uid = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    """ [Author's note]
    Adding user, team and member to the model leads to data redundancy, but it makes
    it possible to keep the object even after the user or team is deleted or
    after the user leaves the team the session was created in.
    """
    user = models.ForeignKey(
        to="User",
        related_name="work_sessions",
        on_delete=models.SET_NULL,
        null=True,
    )
    member = models.ForeignKey(
        to="Member",
        related_name="work_sessions",
        on_delete=models.SET_NULL,
        null=True,
    )
    team = models.ForeignKey(
        to="Team",
        related_name="work_sessions",
        on_delete=models.SET_NULL,
        null=True,
    )

    time_start = models.DateTimeField(default=timezone.now)
    time_end = models.DateTimeField(null=True, blank=True, default=None)

    is_created_via_tracking = models.BooleanField(default=False)
    is_ended = models.BooleanField(default=False)

    note = models.TextField(blank=True, default="")

    @property
    def duration(self) -> float:
        "Get the (current) session duration in seconds"

        if self.time_end is None:
            return (timezone.now() - self.time_start).total_seconds()
        return (self.time_end - self.time_start).total_seconds()

    objects = models.Manager()

    class Meta:
        verbose_name = _("Sitzung")
        verbose_name_plural = _("Sitzungen")

    def as_dict(self) -> dict:
        return {
            "id": self.uid,
            "time_start": self.time_start.timestamp(),
            "time_end": None if self.time_end is None else self.time_end.timestamp(),
            "is_created_via_tracking": self.is_created_via_tracking,
            "is_ended": self.is_ended,
            "duration": self.duration,
            "note": self.note,
        }

    def end(self) -> None:
        "End the work session"

        self.time_end = timezone.now()
        self.is_ended = True
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

class Calendar(models.Model):
    """
    Calendar model
    """

    uid = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    team = models.ForeignKey(
        to="Team",
        related_name="calendars",
        on_delete=models.CASCADE,
    )

    # START calendar properties

    name = models.CharField(
        max_length=50,
    )

    description = models.TextField(
        default="",
        blank=True,
    )

    # END calendar properties
    # START calendar publishing

    ics_uid = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
    )
    is_public = models.BooleanField(
        default=True,
    )

    # END calendar publishing

    objects = models.Manager()

    class Meta:
        verbose_name = _("Kalender")
        verbose_name_plural = _("Kalender")

    def __str__(self) -> str:
        return f"{self.name} ({self.uid})"

    def as_dict(self) -> dict:
        ...

    def as_ics_text(self) -> str:
        eventlines = []
        for event in self.events.all():
            eventlines += event.as_ics_lines()

        calendarlines = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Rafael Urben//OrgaTask Calendar//EN",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            "X-WR-CALNAME:" + utils.ical_text(self.name),
            "X-WR-CALDESC:" + utils.ical_text(self.description),
            "X-WR-TIMEZONE:Europe/Zurich",
            *eventlines,
            "END:VCALENDAR",
        ]
        return '\r\n'.join(calendarlines)

    def as_ics_response(self) -> HttpResponse:
        """Get the calendar as an ics file response"""
        response = HttpResponse(self.as_ics_text(), content_type="text/calendar")
        response["Content-Disposition"] = "attachment; filename=calendar.ics"
        return response


class CalendarEvent(models.Model):
    uid = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    calendar = models.ForeignKey(
        to="Calendar",
        related_name="events",
        on_delete=models.CASCADE,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # START event properties

    name = models.CharField(
        max_length=50,
    )

    description = models.TextField(
        default="",
        blank=True,
    )

    dtstart = models.DateTimeField(null=True, blank=True, default=None)
    dtend = models.DateTimeField(null=True, blank=True, default=None)
    dstart = models.DateField(null=True, blank=True, default=None)
    dend = models.DateField(null=True, blank=True, default=None)
    fullday = models.BooleanField(default=False)

    # END event properties

    objects = models.Manager()

    class Meta:
        verbose_name = _("Ereignis")
        verbose_name_plural = _("Ereignisse")

    def __str__(self) -> str:
        return f"{self.name} ({self.uid})"

    def as_dict(self) -> dict:
        ...

    def as_ics_lines(self) -> list:
        if self.fullday:
            start = "DTSTART;VALUE=DATE:" + utils.ical_date(self.dstart)
            end = "DTEND;VALUE=DATE:" + utils.ical_date(self.dend+utils.timedelta(days=1))
        else:
            start = "DTSTART:" + utils.ical_datetime(self.dtstart)
            end = "DTEND:" + utils.ical_datetime(self.dtend)

        return [
            "BEGIN:VEVENT",
            "UID:" + str(self.uid),
            "DTSTAMP:" + utils.ical_datetime(utils.datetime.now()),
            "SUMMARY:" + utils.ical_text(self.name),
            "DESCRIPTION:" + utils.ical_text(self.description),
            start,
            end,
            "UPDATED:" + utils.ical_datetime(self.updated_at),
            "END:VEVENT",
        ]
