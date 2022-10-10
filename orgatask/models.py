"""Database Models

Django will handle the database itself. Only the models need to be defined here.
"""

import uuid
import hashlib
import typing

from django.db import models
from django.conf import settings
from django.contrib import admin
from django.http import HttpResponse
from django.utils.translation import gettext as _
from django.utils import timezone
from django.urls import reverse

from orgatask import enums, options, exceptions, utils, decorators, validation

# Create your models here.


class User(models.Model):
    """
    An intermediary model to extend the auth user model with custom settings.
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

    settings_darkmode = models.BooleanField(default=None, null=True, blank=True)

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

    def settings_as_dict(self) -> dict:
        """
        Get the user settings as a dict.
        """

        return {
            "darkmode": self.settings_darkmode,
        }

    @decorators.validation_func()
    def update_settings_from_post_data(self, data: dict):
        self.settings_darkmode = validation.boolean(data, "darkmode", required=True, null=True)
        self.save()

    @property
    def avatar_url(self) -> str:
        """
        Generate the avatar url for this user for the gravatar service.
        The email address itself is never passed to the service.
        More info: https://gravatar.com/site/implement/images/
        """
        mailhash = hashlib.md5(str(self.auth_user.email).encode("utf-8")).hexdigest()
        return "https://www.gravatar.com/avatar/"+mailhash+"?s=80&d=retro"

    def create_team(self, name, description) -> "Team":
        """
        Shortcut: Create a new team and add this user as an owner.
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
        Team creation is limited via options.MAX_OWNED_TEAMS.
        """

        return self.member_instances.filter(role=enums.Roles.OWNER).count() < options.MAX_OWNED_TEAMS

    def get_active_work_session(self) -> typing.Union["WorkSession", None]:
        """
        Get the active work session for this user, if there is any.
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
            # get_..._display() returns the human-readable value of the field
            # https://docs.djangoproject.com/en/4.1/ref/models/instances/#django.db.models.Model.get_FOO_display
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
            "valid_until": None if self.valid_until is None else self.valid_until.isoformat(),
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
            # no uses left
            return False
        if self.valid_until is not None and (self.valid_until - timezone.now()).total_seconds() <= 0:
            # expired
            return False
        return True

    def check_validity_for_user(self, user: User) -> bool:
        "Check if an user can use an invite - raise AlertException if not."

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
        """Use the invitation 

        IMPORTANT: This does not check validity! Use check_validity_for_user() first!
        """

        self.uses_left -= 1
        self.uses_used += 1
        self.save()

        return self.team.join(user)

    @classmethod
    @decorators.validation_func()
    def from_post_data(cls, data: dict, team: Team) -> "Invite":
        """Create a new Invite from POST data"""

        return cls.objects.create(
            team=team,
            note=validation.text(data, "note", True),
            uses_left=validation.integer(data, "uses_left", False, default=options.DEFAULT_INVITE_USES),
            valid_until=validation.datetime(data, "valid_until", False, default=None, null=True),
        )

    @decorators.validation_func()
    def update_from_post_data(self, data: dict):
        self.note = validation.text(data, "note", False, default=self.note)
        self.uses_left = validation.integer(data, "uses_left", False, default=self.uses_left)
        self.valid_until = validation.datetime(data, "valid_until", False, default=self.valid_until, null=True)
        self.save()

class WorkSession(models.Model):
    "Model for work sessions"

    uid = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    """ [Author's note]
    Adding user, team and member to the model leads to data redundancy, but it makes
    it possible to keep the object even after the user or team is deleted or
    after the user leaves the team the session was created in. (for future use)
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
            "time_start": self.time_start.isoformat(),
            "time_end": None if self.time_end is None else self.time_end.isoformat(),
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

    def validate(self):
        if self.time_start and self.time_end and self.time_start > self.time_end:
            raise validation.ValidationError(
                text=_("Das Startdatum liegt nach dem Enddatum."),
                title=_("Startdatum nach Enddatum"),
                errorname="start-after-end")
        if self.time_end and self.time_end > timezone.now():
            raise validation.ValidationError(
                text=_("Das Enddatum liegt in der Zukunft."),
                title=_("Enddatum in der Zukunft"),
                errorname="end-in-future")

    @classmethod
    @decorators.validation_func()
    def from_post_data(cls, data: dict, team: Team, member: Member, user: User) -> "WorkSession":
        """Create a new WorkSession from POST data"""

        session = cls(
            team=team,
            member=member,
            user=user,
            note=validation.text(data, "note", False),
            time_start=validation.datetime(data, "time_start", True),
            time_end=validation.datetime(data, "time_end", True),
            is_ended=True,
        )
        session.validate()
        session.save()
        return session

    @decorators.validation_func()
    def update_from_post_data(self, data: dict):
        self.note = validation.text(data, "note", False, default=self.note)
        if not self.is_created_via_tracking:
            self.time_start = validation.datetime(data, "time_start", False, default=self.time_start)
            self.time_end = validation.datetime(data, "time_end", False, default=self.time_end)
            self.validate()
        self.save()

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

    # calendar properties

    name = models.CharField(
        max_length=50,
    )

    description = models.TextField(
        default="",
        blank=True,
    )

    color = models.CharField(max_length=20, blank=True, default="#000000")

    # calendar publishing

    ics_uid = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
    )
    is_public = models.BooleanField(
        default=True,
    )

    objects = models.Manager()

    class Meta:
        verbose_name = _("Kalender")
        verbose_name_plural = _("Kalender")

    def __str__(self) -> str:
        return f"{self.name} ({self.uid})"

    def as_dict(self, request=None) -> dict:
        return {
            "id": str(self.uid),
            "name": self.name,
            "description": self.description,
            "color": self.color,
            "is_public": bool(self.is_public),
            "ics_url": self.get_ics_url(request),
            "events": utils.iddict(map(lambda e: e.as_dict(), self.events.all())),
        }

    def as_ics_text(self, request=None) -> str:
        """Get the calendar in ics format

        Read more: https://icalendar.org/
        """

        morelines = []
        if request is not None:
            morelines.append("URL:"+self.get_online_url(request))
            morelines.append("SOURCE;VALUE=URI:"+self.get_ics_url(request))

        eventlines = []
        for event in self.events.all():
            eventlines += event.as_ics_lines()

        # Some attributes are duplicated because they are required for some clients
        calendarlines = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Rafael Urben//OrgaTask Calendar//EN",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            "UID:" + str(self.ics_uid),
            "NAME:" + utils.ical_text(self.name),
            "X-WR-CALNAME:" + utils.ical_text(self.name),
            "DESCRIPTION:" + utils.ical_text(self.description),
            "X-WR-CALDESC:" + utils.ical_text(self.description),
            "COLOR:" + utils.ical_text(self.color),
            "X-APPLE-CALENDAR-COLOR:" + utils.ical_text(self.color),
            "X-WR-TIMEZONE:Europe/Zurich",
            *morelines,
            *eventlines,
            "END:VCALENDAR",
        ]
        return '\r\n'.join(calendarlines)

    def as_ics_response(self, request=None) -> HttpResponse:
        """Get the calendar as an ics file response"""

        response = HttpResponse(self.as_ics_text(request), content_type="text/calendar")
        response["Content-Disposition"] = "attachment; filename=calendar.ics"
        return response

    def get_online_url(self, request):
        "Get the url to the calendar page in the app"

        path = reverse("orgatask:app")
        return request.build_absolute_uri(path)+f"?p=calendars&t={self.team_id}"

    def get_ics_url(self, request=None):
        "Get the url to the ics file"

        path = reverse("orgatask:calendar_ics", args=[self.ics_uid])
        if request is None:
            return path
        return request.build_absolute_uri(path)

    @classmethod
    @decorators.validation_func()
    def from_post_data(cls, data: dict, team: Team) -> "Calendar":
        """Create a new Calendar from POST data"""

        return cls.objects.create(
            team=team,
            name=validation.text(data, "name", True, max_length=50),
            description=validation.text(data, "description", True),
            color=validation.text(data, "color", True, default="#FF0000", max_length=20),
        )

    @decorators.validation_func()
    def update_from_post_data(self, data: dict):
        self.name = validation.text(data, "name", False, self.name, max_length=50)
        self.description = validation.text(data, "description", False, self.description)
        self.color = validation.text(data, "color", False, self.color, max_length=20)
        self.save()

class CalendarEvent(models.Model):
    """
    Calendar event model
    """

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

    # event properties

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

    location = models.CharField(max_length=250, blank=True, default="")

    objects = models.Manager()

    class Meta:
        verbose_name = _("Ereignis")
        verbose_name_plural = _("Ereignisse")

    def __str__(self) -> str:
        return f"{self.name} ({self.uid})"

    def as_dict(self) -> dict:
        return {
            "id": str(self.uid),
            "name": self.name,
            "description": self.description,
            "dtstart": None if self.dtstart is None else self.dtstart.isoformat(),
            "dtend": None if self.dtend is None else self.dtend.isoformat(),
            "dstart": None if self.dstart is None else self.dstart.isoformat(),
            "dend": None if self.dend is None else self.dend.isoformat(),
            "fullday": bool(self.fullday),
            "location": self.location,
        }

    def as_ics_lines(self) -> list:
        """Get the event in ics format

        Read more: https://icalendar.org/
        """

        if self.fullday:
            start = "DTSTART;VALUE=DATE:" + utils.ical_date(self.dstart)
            # According to the iCalendar standard, the end date is exclusive for all-day events
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
            "LOCATION:" + utils.ical_text(self.location),
            start,
            end,
            "UPDATED:" + utils.ical_datetime(self.updated_at),
            "END:VEVENT",
        ]

    def clean(self) -> None:
        "Verify that the event is valid"

        if self.fullday:
            if self.dstart is None or self.dend is None:
                raise exceptions.ValidationError(_("Ganztägige Ereignisse brauchen ein Start- und Enddatum."))
            if self.dstart > self.dend:
                raise exceptions.ValidationError(_("Das Enddatum darf nicht vor dem Startdatum liegen."))
            self.dtstart = None
            self.dtend = None
        else:
            if self.dtstart is None or self.dtend is None:
                raise exceptions.ValidationError(_("Ereignisse brauchen einen Start- und Endzeitpunkt"))
            if self.dtstart > self.dtend:
                raise exceptions.ValidationError(_("Der Endzeitpunkt darf nicht vor dem Startzeitpunkt liegen."))
            self.dstart = None
            self.dend = None

    @classmethod
    @decorators.validation_func()
    def from_post_data(cls, data: dict, calendar: Calendar) -> "CalendarEvent":
        """Create a new CalendarEvent from POST data"""

        fullday = validation.boolean(data, "fullday", False, default=True)
        name = validation.text(data, "name", True, max_length=50)
        description = validation.text(data, "description", False)
        location = validation.text(data, "location", False)

        if fullday:
            event = cls(
                calendar=calendar,
                name=name,
                description=description,
                location=location,
                fullday=True,
                dstart=validation.date(data, "dstart", True),
                dend=validation.date(data, "dend", True),
            )
        else:
            event = cls(
                calendar=calendar,
                name=name,
                description=description,
                location=location,
                fullday=False,
                dtstart=validation.datetime(data, "dtstart", True),
                dtend=validation.datetime(data, "dtend", True),
            )

        event.clean()
        event.save()
        return event

    @decorators.validation_func()
    def update_from_post_data(self, data: dict):
        self.fullday = validation.boolean(data, "fullday", False, default=self.fullday)
        self.name = validation.text(data, "name", False, default=self.name, max_length=50)
        self.description = validation.text(data, "description", False, default=self.description)
        self.location = validation.text(data, "location", False, default=self.location)

        if self.fullday:
            self.dstart = validation.date(data, "dstart", False, default=self.dstart)
            self.dend = validation.date(data, "dend", True, default=self.dend)
        else:
            self.dtstart = validation.datetime(data, "dtstart", True, default=self.dtstart)
            self.dtend = validation.datetime(data, "dtend", True, default=self.dtend)

        self.clean()
        self.save()


class ToDoList(models.Model):
    """
    To do list model
    """

    uid = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    team = models.ForeignKey(
        to="Team",
        related_name="todolists",
        on_delete=models.CASCADE,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    name = models.CharField(max_length=50)
    description = models.TextField(blank=True, default="")

    color = models.CharField(max_length=20, blank=True, default="#FFFFFF")

    objects = models.Manager()

    class Meta:
        verbose_name = _("To-do-Liste")
        verbose_name_plural = _("To-do-Listen")

    def __str__(self) -> str:
        return f"{self.name} ({self.uid})"

    def as_dict(self) -> dict:
        return {
            "id": str(self.uid),
            "name": self.name,
            "description": self.description,
            "color": self.color,
            "items": utils.iddict(map(lambda i: i.as_dict(), self.items.all())),
        }

    @classmethod
    @decorators.validation_func()
    def from_post_data(cls, data: dict, team: Team) -> "ToDoList":
        """Create a new ToDoList from POST data"""

        return cls.objects.create(
            team=team,
            name = validation.text(data, "name", True, max_length=50),
            description = validation.text(data, "description", True),
            color = validation.text(data, "color", False, default="#FFFFFF"),
        )

    @decorators.validation_func()
    def update_from_post_data(self, data: dict):
        """Update the ToDoList from POST data"""

        self.name = validation.text(data, "name", False, default=self.name, max_length=50)
        self.description = validation.text(data, "description", False, default=self.description)
        self.color = validation.text(data, "color", False, default=self.color)
        self.save()

class ToDoListItem(models.Model):
    uid = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    todolist = models.ForeignKey(
        to="ToDoList",
        related_name="items",
        on_delete=models.CASCADE,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, related_name="+")

    updated_at = models.DateTimeField(auto_now=True)

    name = models.CharField(max_length=50)
    description = models.TextField(blank=True, default="")

    done = models.BooleanField(default=False)
    done_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, related_name="+")
    done_at = models.DateTimeField(null=True)

    objects = models.Manager()

    class Meta:
        verbose_name = _("To-do-Lis­teneintrag")
        verbose_name_plural = _("To-do-Lis­teneinträge")

    def __str__(self) -> str:
        return f"{self.name} ({self.uid})"

    def as_dict(self) -> dict:
        return {
            "id": str(self.uid),
            "name": self.name,
            "description": self.description,
            "done": self.done,
            "done_by_id": str(self.done_by.uid) if self.done_by else None,
            "done_at": self.done_at.isoformat() if self.done_at else None,
        }

    @classmethod
    @decorators.validation_func()
    def from_post_data(cls, data: dict, user: User, todolist: ToDoList) -> "ToDoListItem":
        """Create a new ToDoListItem from POST data"""

        return cls.objects.create(
            todolist=todolist,
            created_by=user,
            name = validation.text(data, "name", True, max_length=50),
            description = validation.text(data, "description", False),
        )

    @decorators.validation_func()
    def update_from_post_data(self, data: dict, user: User):
        """Update a ToDoListItem from POST data"""

        self.name = validation.text(data, "name", False, default=self.name, max_length=50)
        self.description = validation.text(data, "description", False, default=self.description)

        done = validation.boolean(data, "done", False, null=True)
        if done is True and self.done is False: # Mark as done
            self.done = True
            self.done_by = user
            self.done_at = timezone.now()
        elif done is False and self.done is True: # Mark as undone
            self.done = False
            self.done_by = None
            self.done_at = None

        self.save()

# This model is for future use

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
