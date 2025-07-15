"""Database Models for the club subapp

Django will handle the database itself. Only the models need to be defined here.
"""

import uuid
from copy import deepcopy

from django.contrib import messages
from django.core.mail import send_mail
from django.db import models
from django.template.loader import render_to_string
from django.urls import reverse
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from teamized import utils, decorators, validation


# Create your models here.


class Club(models.Model):
    uid = models.UUIDField(
        primary_key=True, default=uuid.uuid4, verbose_name=_("UID"), editable=False
    )
    slug = models.SlugField(
        verbose_name=_("Slug"),
        unique=True,
        max_length=50,
        null=True,
        blank=True,
        default=None,
    )

    name = models.CharField(max_length=50, verbose_name=_("Name"))
    description = models.TextField(
        verbose_name=_("Beschreibung"),
        blank=True,
        default="",
        help_text=_("Wird auf der Login-Seite angezeigt."),
    )

    date_created = models.DateTimeField(verbose_name=_("Erstellt am"), auto_now_add=True)
    date_modified = models.DateTimeField(verbose_name=_("Zuletzt geändert am"), auto_now=True)

    class Meta:
        verbose_name = _("Verein")
        verbose_name_plural = _("Vereine")

    objects = models.Manager()

    def __str__(self):
        return str(self.name)

    def as_dict(self):
        return {
            "id": str(self.uid),
            "name": str(self.name),
            "description": str(self.description),
            "slug": str(self.slug),
            "url": reverse("teamized:club_login", kwargs={"clubslug": self.slug}),
            "membercount": self.members.count(),
        }

    def ensure_session_structure(self, request):
        if "teamized_clubmember_sessions" not in request.session:
            request.session["teamized_clubmember_sessions"] = {}
        if str(self.uid) not in request.session["teamized_clubmember_sessions"]:
            request.session["teamized_clubmember_sessions"][str(self.uid)] = {}

    def session_get_logged_in_members(self, request):
        self.ensure_session_structure(request)
        members = []
        for member_uid, session_uid in deepcopy(
            request.session["teamized_clubmember_sessions"][str(self.uid)]
        ).items():
            if ClubMemberSession.objects.filter(
                uid=session_uid,
                member_id=member_uid,
                valid_until__gt=timezone.now(),
            ).exists():
                session = ClubMemberSession.objects.get(
                    uid=session_uid,
                    member_id=member_uid,
                    valid_until__gt=timezone.now(),
                )
                members.append(
                    {
                        "member": session.member,
                        "url": (
                            reverse(
                                "teamized:club_member_app",
                                kwargs={
                                    "clubslug": session.member.club.slug,
                                    "memberuid": session.member.uid,
                                },
                            )
                        ),
                    }
                )
            else:
                del request.session["teamized_clubmember_sessions"][str(self.uid)][member_uid]
                request.session.modified = True
        return members

    @classmethod
    @decorators.validation_func()
    def from_post_data(cls, data: dict) -> "Club":
        """Create a new object from POST data"""

        return cls.objects.create(
            name=validation.text(data, "name", True),
            description=validation.text(data, "description", False, default=""),
            slug=validation.slug(data, "slug", True),
        )

    @decorators.validation_func()
    def update_from_post_data(self, data: dict):
        self.name = validation.text(data, "name", False, default=self.name)
        self.description = validation.text(data, "description", False, default=self.description)
        self.save()


class ClubMember(models.Model):
    uid = models.UUIDField(
        primary_key=True, default=uuid.uuid4, verbose_name=_("UID"), editable=False
    )
    club = models.ForeignKey(
        Club, on_delete=models.CASCADE, verbose_name=_("Verein"), related_name="members"
    )

    email = models.EmailField(verbose_name=_("E-Mail"))

    first_name = models.CharField(max_length=50, verbose_name=_("Vorname"))
    last_name = models.CharField(max_length=50, verbose_name=_("Nachname"))
    birth_date = models.DateField(
        verbose_name=_("Geburtsdatum"), null=True, blank=True, default=None
    )

    phone = models.CharField(max_length=50, verbose_name=_("Telefon"), blank=True, default="")
    mobile = models.CharField(max_length=50, verbose_name=_("Mobil"), blank=True, default="")

    street = models.CharField(max_length=50, verbose_name=_("Straße"), blank=True, default="")
    zip_code = models.CharField(max_length=50, verbose_name=_("PLZ"), blank=True, default="")
    city = models.CharField(max_length=50, verbose_name=_("Ort"), blank=True, default="")

    notes = models.TextField(verbose_name=_("Notizen"), blank=True, default="")

    date_created = models.DateTimeField(verbose_name=_("Erstellt am"), auto_now_add=True)
    date_modified = models.DateTimeField(verbose_name=_("Zuletzt geändert am"), auto_now=True)

    portfolio_visible = models.BooleanField(verbose_name=_("Portfolio sichtbar?"), default=True)
    portfolio_image1_url = models.URLField(
        verbose_name=_("Portfolio-Bild 1"), default="", blank=True
    )
    portfolio_image2_url = models.URLField(
        verbose_name=_("Portfolio-Bild 1"), default="", blank=True
    )
    portfolio_member_since = models.PositiveIntegerField(
        verbose_name=_("Mitglied seit (Jahr)"), default=None, null=True, blank=True
    )
    portfolio_hobby_since = models.PositiveIntegerField(
        verbose_name=_("Hobby seit (Jahr)"), default=None, null=True, blank=True
    )
    portfolio_role = models.CharField(
        verbose_name=_("Rolle"), max_length=50, default="", blank=True
    )
    portfolio_profession = models.CharField(
        verbose_name=_("Beruf"), max_length=50, default="", blank=True
    )
    portfolio_hobbies = models.TextField(verbose_name=_("Hobbies"), default="", blank=True)
    portfolio_highlights = models.TextField(verbose_name=_("Highlights"), default="", blank=True)
    portfolio_biography = models.TextField(verbose_name=_("Biografie"), default="", blank=True)
    portfolio_contact_email = models.EmailField(
        verbose_name=_("Kontakt-E-Mail"), default="", blank=True
    )

    class Meta:
        verbose_name = _("Vereinsmitglied")
        verbose_name_plural = _("Vereinsmitglieder")
        unique_together = [["club", "email"]]

    objects = models.Manager()

    @property
    def clubuid(self):
        return str(self.club_id)  # type: ignore # pylint: disable=no-member

    @property
    def memberuid(self):
        return str(self.uid)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

    def as_dict(self, detailed=False):
        if detailed:
            return {
                "id": str(self.memberuid),
                "email": str(self.email),
                "first_name": str(self.first_name),
                "last_name": str(self.last_name),
                "birth_date": str(self.birth_date),
                "phone": str(self.phone),
                "mobile": str(self.mobile),
                "street": str(self.street),
                "zip_code": str(self.zip_code),
                "city": str(self.city),
                "notes": str(self.notes),
            }
        return {
            "id": str(self.memberuid),
            "email": str(self.email),
            "first_name": str(self.first_name),
            "last_name": str(self.last_name),
            "birth_date": str(self.birth_date) if self.birth_date is not None else None,
        }

    def portfolio_as_dict(self):
        return {
            "id": str(self.memberuid),
            "visible": self.portfolio_visible,
            "image1_url": self.portfolio_image1_url,
            "image2_url": self.portfolio_image2_url,
            "member_since": self.portfolio_member_since,
            "hobby_since": self.portfolio_hobby_since,
            "role": self.portfolio_role,
            "profession": self.portfolio_profession,
            "hobbies": self.portfolio_hobbies,
            "highlights": self.portfolio_highlights,
            "biography": self.portfolio_biography,
            "contact_email": self.portfolio_contact_email,
        }

    def can_login_with_magicuid(self, magic_uid):
        if not utils.is_valid_uuid(magic_uid):
            return False
        return ClubMemberMagicLink.objects.filter(
            uid=magic_uid,
            member=self,
            valid_until__gt=timezone.now(),
        ).exists()

    def session_is_logged_in(self, request):
        self.club.ensure_session_structure(request)
        club_sessions = request.session["teamized_clubmember_sessions"][self.clubuid]
        if self.memberuid not in club_sessions:
            return False
        if not ClubMemberSession.objects.filter(
            uid=club_sessions[self.memberuid], member=self, valid_until__gt=timezone.now()
        ).exists():
            del club_sessions[self.memberuid]
            request.session.modified = True
            messages.error(
                request,
                _("Deine Sitzung ist ungültig oder abgelaufen. Bitte logge dich erneut ein."),
            )
            return False
        return True

    def session_login(self, request, magic_uid):
        if not self.can_login_with_magicuid(magic_uid):
            return False

        ClubMemberMagicLink.objects.get(
            uid=magic_uid,
            member=self,
        ).delete()
        session = self.create_session()

        self.club.ensure_session_structure(request)
        request.session["teamized_clubmember_sessions"][self.clubuid][self.memberuid] = str(
            session.uid
        )
        request.session.modified = True
        return True

    def session_logout(self, request):
        self.club.ensure_session_structure(request)
        if self.memberuid not in request.session["teamized_clubmember_sessions"][self.clubuid]:
            return
        session_uid = request.session["teamized_clubmember_sessions"][self.clubuid][self.memberuid]
        del request.session["teamized_clubmember_sessions"][self.clubuid][self.memberuid]
        request.session.modified = True
        if ClubMemberSession.objects.filter(uid=session_uid, member=self).exists():
            ClubMemberSession.objects.get(uid=session_uid, member=self).delete()

    def create_session(self) -> "ClubMemberSession":
        """Create a session for this member."""

        return ClubMemberSession.objects.create(member=self)

    def create_magic_link(self) -> "ClubMemberMagicLink":
        """Create a new magic link for this member."""

        return ClubMemberMagicLink.objects.create(member=self)

    def send_magic_link(self, request):
        """Send a new magic link to the member's email address. Request is needed for building the URL."""

        magic_link = self.create_magic_link()
        magic_link.send_email(request)

    @classmethod
    @decorators.validation_func()
    def from_post_data(cls, data: dict, club: Club) -> "ClubMember":
        """Create a new object from POST data"""

        return cls.objects.create(
            club=club,
            first_name=validation.text(data, "first_name", True),
            last_name=validation.text(data, "last_name", True),
            email=validation.text(data, "email", True),
            birth_date=validation.date(data, "birth_date", False, default=None, null=True),
        )

    @decorators.validation_func()
    def update_from_post_data(self, data: dict):
        self.first_name = validation.text(data, "first_name", False, default=self.first_name)
        self.last_name = validation.text(data, "last_name", False, default=self.last_name)
        self.email = validation.text(data, "email", False, default=self.email)
        self.birth_date = validation.date(
            data, "birth_date", False, default=self.birth_date, null=True
        )
        self.save()

    @decorators.validation_func()
    def update_portfolio_from_post_data(self, data: dict):
        self.portfolio_visible = validation.boolean(
            data, "visible", False, default=self.portfolio_visible
        )
        self.portfolio_image1_url = validation.text(
            data, "image1_url", False, default=self.portfolio_image1_url
        )
        self.portfolio_image2_url = validation.text(
            data, "image2_url", False, default=self.portfolio_image2_url
        )
        self.portfolio_member_since = validation.integer(
            data, "member_since", False, default=self.portfolio_member_since
        )
        self.portfolio_hobby_since = validation.integer(
            data, "hobby_since", False, default=self.portfolio_hobby_since
        )
        self.portfolio_role = validation.text(data, "role", False, default=self.portfolio_role)
        self.portfolio_profession = validation.text(
            data, "profession", False, default=self.portfolio_profession
        )
        self.portfolio_hobbies = validation.text(
            data, "hobbies", False, default=self.portfolio_hobbies
        )
        self.portfolio_highlights = validation.text(
            data, "highlights", False, default=self.portfolio_highlights
        )
        self.portfolio_biography = validation.text(
            data, "biography", False, default=self.portfolio_biography
        )
        self.portfolio_contact_email = validation.text(
            data, "contact_email", False, default=self.portfolio_contact_email
        )
        self.save()


class ClubMemberSession(models.Model):
    uid = models.UUIDField(
        primary_key=True, default=uuid.uuid4, verbose_name=_("UID"), editable=False
    )
    member = models.ForeignKey(
        ClubMember,
        on_delete=models.CASCADE,
        verbose_name=_("Mitglied"),
        related_name="sessions",
    )

    valid_until = models.DateTimeField(verbose_name=_("Gültig bis"), default=utils.now_plus_180d)

    date_created = models.DateTimeField(verbose_name=_("Erstellt am"), auto_now_add=True)
    date_modified = models.DateTimeField(verbose_name=_("Zuletzt geändert am"), auto_now=True)

    class Meta:
        verbose_name = _("Sitzung")
        verbose_name_plural = _("Sitzungen")

    objects = models.Manager()


class ClubMemberMagicLink(models.Model):
    uid = models.UUIDField(
        primary_key=True, default=uuid.uuid4, verbose_name=_("UID"), editable=False
    )
    member = models.ForeignKey(
        ClubMember,
        on_delete=models.CASCADE,
        verbose_name=_("Mitglied"),
        related_name="magic_links",
    )

    valid_until = models.DateTimeField(verbose_name=_("Verwendbar bis"), default=utils.now_plus_1w)

    date_created = models.DateTimeField(verbose_name=_("Erstellt am"), auto_now_add=True)
    date_modified = models.DateTimeField(verbose_name=_("Zuletzt geändert am"), auto_now=True)

    class Meta:
        verbose_name = _("Magischer Link")
        verbose_name_plural = _("Magische Links")

    objects = models.Manager()

    def get_absolute_url(self, request):
        return (
            request.build_absolute_uri(
                reverse(
                    "teamized:club_member_login",
                    kwargs={
                        "clubslug": self.member.club.slug,
                        "memberuid": self.member.uid,
                    },
                )
            )
            + f"?magicuid={self.uid}"
        )

    def send_email(self, request):
        """Send the magic link to the member's email address."""

        url = self.get_absolute_url(request)

        send_mail(
            subject="Dein magischer Login-Link",
            message=render_to_string(
                "teamized/club/emails/magic_mail.txt",
                {
                    "magicurl": url,
                    "member": self.member,
                },
                request=request,
            ),
            from_email=None,
            recipient_list=[self.member.email],
        )


class ClubMemberGroup(models.Model):
    uid = models.UUIDField(
        primary_key=True, default=uuid.uuid4, verbose_name=_("UID"), editable=False
    )
    club = models.ForeignKey(
        Club, on_delete=models.CASCADE, verbose_name=_("Verein"), related_name="groups"
    )

    name = models.CharField(max_length=50, verbose_name=_("Name"))
    description = models.TextField(verbose_name=_("Beschreibung"), blank=True)

    members = models.ManyToManyField(
        to=ClubMember,
        verbose_name=_("Mitglieder"),
        related_name="groups",
        through="ClubMemberGroupMembership",
    )

    shared_uid = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
    )

    date_created = models.DateTimeField(verbose_name=_("Erstellt am"), auto_now_add=True)
    date_modified = models.DateTimeField(verbose_name=_("Zuletzt geändert am"), auto_now=True)

    class Meta:
        verbose_name = _("Vereinsmitgliedergruppe")
        verbose_name_plural = _("Vereinsmitgliedergruppen")

    objects = models.Manager()

    def __str__(self):
        return self.name

    def as_dict(self, request=None, include_shared_url=False):
        data = {
            "id": self.uid,
            "name": self.name,
            "description": self.description or "",
            "memberids": [ms.member_id for ms in self.memberships.all()],
        }
        if include_shared_url:
            shared_url = reverse(
                "teamized:club-api-public-group-portfolios",
                kwargs={"uuid": self.shared_uid},
            )
            if request is not None:
                shared_url = request.build_absolute_uri(shared_url)
            data["shared_url"] = shared_url
        return data

    @classmethod
    @decorators.validation_func()
    def from_post_data(cls, data: dict, club: Club) -> "ClubMemberGroup":
        """Create a new object from POST data"""

        return cls.objects.create(
            club=club,
            name=validation.text(data, "name", True),
            description=validation.text(data, "description", False, default=""),
        )

    @decorators.validation_func()
    def update_from_post_data(self, data: dict):
        self.name = validation.text(data, "name", False, default=self.name)
        self.description = validation.text(data, "description", False, default=self.description)
        self.save()

    def get_member_portfolios(self):
        """Get all members portfolios"""

        portfolios = []
        for member in self.members.filter(portfolio_visible=True):
            portfolios.append(
                {
                    "first_name": member.first_name,
                    "last_name": member.last_name,
                    **member.portfolio_as_dict(),
                }
            )
        return {
            "name": self.name,
            "description": self.description,
            "portfolios": portfolios,
        }


class ClubMemberGroupMembership(models.Model):
    uid = models.UUIDField(
        primary_key=True, default=uuid.uuid4, verbose_name=_("UID"), editable=False
    )
    group = models.ForeignKey(
        to=ClubMemberGroup,
        on_delete=models.CASCADE,
        verbose_name=_("Gruppe"),
        related_name="memberships",
    )
    member = models.ForeignKey(
        to=ClubMember,
        on_delete=models.CASCADE,
        verbose_name=_("Mitglied"),
        related_name="group_memberships",
    )

    date_created = models.DateTimeField(verbose_name=_("Erstellt am"), auto_now_add=True)
    date_modified = models.DateTimeField(verbose_name=_("Zuletzt geändert am"), auto_now=True)

    class Meta:
        verbose_name = _("Gruppenmitgliedschaft")
        verbose_name_plural = _("Gruppenmitgliedschaften")
        unique_together = [["group", "member"]]


class ClubAttendanceEvent(models.Model):
    uid = models.UUIDField(
        primary_key=True, default=uuid.uuid4, verbose_name=_("UID"), editable=False
    )
    club = models.ForeignKey(
        Club, on_delete=models.CASCADE, verbose_name=_("Verein"), related_name="attendance_events"
    )

    title = models.CharField(max_length=50, verbose_name=_("Titel"))
    description = models.TextField(verbose_name=_("Beschreibung"), blank=True)

    participating_by_default = models.BooleanField(
        verbose_name=_("Teilnahme standardmäßig"),
        default=True,
        help_text=_(
            "Wenn gesetzt, sind zugewiesene Mitglieder standardmäßig für die Teilnahme eingetragen."
        ),
    )

    dt_start = models.DateTimeField(verbose_name=_("Beginn"))
    dt_end = models.DateTimeField(verbose_name=_("Ende"))

    points = models.PositiveIntegerField(
        verbose_name=_("Punkte"),
        default=1,
        help_text=_("Punkte, die für die Teilnahme vergeben werden."),
    )

    locked = models.BooleanField(
        verbose_name=_("Gesperrt?"),
        default=False,
        help_text=_("Wenn gesetzt, können Teilnahmen nicht mehr geändert werden."),
    )

    date_created = models.DateTimeField(verbose_name=_("Erstellt am"), auto_now_add=True)
    date_modified = models.DateTimeField(verbose_name=_("Zuletzt geändert am"), auto_now=True)

    class Meta:
        verbose_name = _("Anwesenheitsereignis")
        verbose_name_plural = _("Anwesenheitsereignisse")

    objects = models.Manager()

    def __str__(self):
        return self.title

    def as_dict(self):
        return {
            "id": str(self.uid),
            "title": self.title,
            "description": self.description,
            "participating_by_default": self.participating_by_default,
            "dt_start": self.dt_start.isoformat(),
            "dt_end": self.dt_end.isoformat(),
            "points": self.points,
            "locked": self.locked,
        }

    @classmethod
    @decorators.validation_func()
    def from_post_data(cls, data: dict, club: Club) -> "ClubAttendanceEvent":
        """Create a new object from POST data"""

        return cls.objects.create(
            club=club,
            title=validation.text(data, "title", True),
            description=validation.text(data, "description", False, default=""),
            participating_by_default=validation.boolean(
                data, "participating_by_default", False, default=True
            ),
            dt_start=validation.datetime(data, "dt_start", True),
            dt_end=validation.datetime(data, "dt_end", True),
            points=validation.integer(data, "points", False, default=1),
            locked=False,
        )

    @decorators.validation_func()
    def update_from_post_data(self, data: dict):
        self.title = validation.text(data, "title", False, default=self.title)
        self.description = validation.text(data, "description", False, default=self.description)
        self.participating_by_default = validation.boolean(
            data, "participating_by_default", False, default=self.participating_by_default
        )
        self.dt_start = validation.datetime(data, "dt_start", False, default=self.dt_start)
        self.dt_end = validation.datetime(data, "dt_end", False, default=self.dt_end)
        self.points = validation.integer(data, "points", False, default=self.points)
        self.save()


class ClubAttendanceEventParticipation(models.Model):
    class MemberResponseChoices(models.TextChoices):
        YES = "yes", _("Ja")
        NO = "no", _("Nein")
        MAYBE = "maybe", _("Vielleicht")
        UNKNOWN = "unknown", _("Unbekannt")

    uid = models.UUIDField(
        primary_key=True, default=uuid.uuid4, verbose_name=_("UID"), editable=False
    )

    event = models.ForeignKey(
        ClubAttendanceEvent,
        on_delete=models.CASCADE,
        verbose_name=_("Anwesenheitsereignis"),
        related_name="participations",
    )
    member = models.ForeignKey(
        ClubMember,
        on_delete=models.CASCADE,
        verbose_name=_("Mitglied"),
        related_name="attendance_event_participations",
    )

    # Member response
    member_response = models.CharField(
        verbose_name=_("Antwort des Mitglieds"),
        max_length=10,
        choices=MemberResponseChoices.choices,
        default=MemberResponseChoices.UNKNOWN,
    )
    member_notes = models.TextField(
        verbose_name=_("Grund der An-/Abmeldung"),
        blank=True,
        default="",
    )

    # Attendance check
    has_attended = models.BooleanField(
        verbose_name=_("Am Event teilgenommen?"),
        default=None,
        null=True,
    )

    # Admin notes
    admin_notes = models.TextField(
        verbose_name=_("Admin-Notizen"),
        blank=True,
        default="",
    )

    date_created = models.DateTimeField(verbose_name=_("Erstellt am"), auto_now_add=True)
    date_modified = models.DateTimeField(verbose_name=_("Zuletzt geändert am"), auto_now=True)

    class Meta:
        verbose_name = _("Anwesenheitsteilnahme")
        verbose_name_plural = _("Anwesenheitsteilnahmen")
        unique_together = [["event", "member"]]

    objects = models.Manager()

    def as_dict(self):
        return {
            "id": str(self.uid),
            "event_id": self.event_id,
            "member_id": self.member_id,
            "member_response": self.member_response,
            "member_notes": self.member_notes,
            "has_attended": self.has_attended,
            "admin_notes": self.admin_notes,
        }

    @classmethod
    def create(
        cls, event: ClubAttendanceEvent, member: ClubMember
    ) -> "ClubAttendanceEventParticipation":
        """Create a new object"""

        return cls.objects.create(
            event=event,
            member=member,
            member_response=(
                cls.MemberResponseChoices.YES
                if event.participating_by_default
                else cls.MemberResponseChoices.UNKNOWN
            ),
        )

    @decorators.validation_func()
    def update_from_post_data(self, data: dict):
        """Update the participation from POST data"""

        self.member_response = validation.text(
            data, "member_response", False, default=self.member_response
        )
        self.member_notes = validation.text(data, "member_notes", False, default=self.member_notes)
        self.has_attended = validation.boolean(
            data, "has_attended", False, default=self.has_attended
        )
        self.admin_notes = validation.text(data, "admin_notes", False, default=self.admin_notes)
        self.save()


# class ClubPoll(models.Model):
#     uid = models.UUIDField(
#         primary_key=True, default=uuid.uuid4, verbose_name=_("UID"), editable=False
#     )
#     club = models.ForeignKey(Club, on_delete=models.CASCADE, verbose_name=_("Verein"))

#     title = models.CharField(max_length=50, verbose_name=_("Titel"))
#     description = models.TextField(verbose_name=_("Beschreibung"), blank=True)

#     shown_from = models.DateTimeField(
#         verbose_name=_("Anzeigen ab"), default=timezone.now
#     )
#     deadline = models.DateTimeField(
#         verbose_name=_("Deadline"), default=utils.now_plus_2w
#     )
#     shown_until = models.DateTimeField(
#         verbose_name=_("Anzeigen bis"), default=utils.now_plus_8w
#     )

#     can_decline = models.BooleanField(verbose_name=_("Absagen erlauben"), default=False)

#     date_created = models.DateTimeField(
#         verbose_name=_("Erstellt am"), auto_now_add=True
#     )
#     date_modified = models.DateTimeField(
#         verbose_name=_("Zuletzt geändert am"), auto_now=True
#     )

#     class Meta:
#         verbose_name = _("Umfrage")
#         verbose_name_plural = _("Umfragen")

#     objects = models.Manager()

#     def __str__(self):
#         return str(self.title)

#     @property
#     def deadline_passed(self):
#         return self.deadline < timezone.now()

#     def as_dict(self, include_fields=False, include_stats=False):
#         data = {
#             "uid": str(self.uid),
#             "title": self.title,
#             "description": self.description,
#             "shown_from": None if self.shown_from is None else self.shown_from.isoformat(),
#             "deadline": None if self.deadline is None else self.deadline.isoformat(),
#             "deadline_passed": self.deadline_passed,
#             "shown_until": None if self.shown_until is None else self.shown_until.isoformat(),
#             "can_decline": self.can_decline
#         }
#         if include_fields:
#             data["fields"] = [field.as_dict() for field in self.fields.all()]
#         if include_stats:
#             data["total_entries"] = self.entries.count()
#             data["total_entries_voted"] = self.entries.filter(voted=True).count()
#         return data

#     def create_entry_for(self, member):
#         return ClubPollEntry.objects.create(poll=self, member=member)

# class ClubPollField(models.Model):
#     uid = models.UUIDField(
#         primary_key=True, default=uuid.uuid4, verbose_name=_("UID"), editable=False
#     )
#     poll = models.ForeignKey(
#         ClubPoll, on_delete=models.CASCADE, verbose_name=_("Umfrage"), related_name="fields"
#     )

#     order = models.PositiveSmallIntegerField(verbose_name=_("Reihenfolge"))

#     hidden = models.BooleanField(verbose_name=_("Versteckt?"), default=False)
#     title = models.CharField(max_length=50, verbose_name=_("Titel"))
#     description = models.TextField(verbose_name=_("Beschreibung"), blank=True)

#     field_type = models.CharField(
#         max_length=50,
#         verbose_name=_("Feldtyp"),
#         choices=enums.PollFieldTypes.choices,
#         default=enums.PollFieldTypes.SHORT_TEXT,
#     )
#     field_options = models.JSONField(
#         verbose_name=_("Feldoptionen"), blank=True, default=dict
#     )

#     date_created = models.DateTimeField(
#         verbose_name=_("Erstellt am"), auto_now_add=True
#     )
#     date_modified = models.DateTimeField(
#         verbose_name=_("Zuletzt geändert am"), auto_now=True
#     )

#     class Meta:
#         verbose_name = _("Umfragefeld")
#         verbose_name_plural = _("Umfragefelder")

#     objects = models.Manager()

#     def __str__(self):
#         return str(self.title)

#     def as_dict(self):
#         return {
#             "uid": str(self.uid),
#             "hidden": self.hidden,
#             "title": self.title,
#             "description": self.description,
#             "field_type": self.field_type,
#             "field_options": self.field_options,
#         }

# class ClubPollEntry(models.Model):
#     uid = models.UUIDField(
#         primary_key=True, default=uuid.uuid4, verbose_name=_("UID"), editable=False
#     )
#     poll = models.ForeignKey(
#         ClubPoll,
#         on_delete=models.CASCADE,
#         verbose_name=_("Umfrage"),
#         related_name="entries",
#     )
#     member = models.ForeignKey(
#         ClubMember,
#         on_delete=models.CASCADE,
#         verbose_name=_("Mitglied"),
#         related_name="poll_entries",
#     )

#     has_voted = models.BooleanField(verbose_name=_("Hat abgestimmt?"), default=False)
#     has_declined = models.BooleanField(verbose_name=_("Hat abgelehnt?"), default=False)

#     date_created = models.DateTimeField(
#         verbose_name=_("Erstellt am"), auto_now_add=True
#     )
#     date_modified = models.DateTimeField(
#         verbose_name=_("Zuletzt geändert am"), auto_now=True
#     )

#     objects = models.Manager()

#     class Meta:
#         verbose_name = _("Umfragenteilnahme")
#         verbose_name_plural = _("Umfragenteilnahmen")

#     def as_member_dict(self, include_fields=False):
#         data = {
#             "uid": str(self.uid),
#             "poll": self.poll.as_dict(),
#             "has_voted": self.has_voted,
#             "has_declined": self.has_declined,
#         }
#         if include_fields:
#             # Map PollFields together with their corresponding entry value (not very efficient atm)
#             entry_field_values = {str(field.poll_field_id): field.value for field in self.fields.all()}
#             poll_fields = [field.as_dict() for field in self.poll.fields.filter(hidden=False).all()]
#             for field in poll_fields:
#                 field["value"] = entry_field_values.get(field["uid"], None)
#             data["fields"] = poll_fields
#         return data


# class ClubPollEntryField(models.Model):
#     uid = models.UUIDField(
#         primary_key=True, default=uuid.uuid4, verbose_name=_("UID"), editable=False
#     )
#     poll_entry = models.ForeignKey(
#         ClubPollEntry,
#         on_delete=models.CASCADE,
#         verbose_name=_("Umfragenteilnahme"),
#         related_name="fields",
#     )
#     poll_field = models.ForeignKey(
#         ClubPollField,
#         on_delete=models.CASCADE,
#         verbose_name=_("Umfragefeld"),
#         related_name="entries",
#     )

#     value = models.TextField(verbose_name=_("Wert"), blank=True, default="")

#     date_created = models.DateTimeField(
#         verbose_name=_("Erstellt am"), auto_now_add=True
#     )
#     date_modified = models.DateTimeField(
#         verbose_name=_("Zuletzt geändert am"), auto_now=True
#     )

#     class Meta:
#         verbose_name = _("Umfragenteilnahmefeld")
#         verbose_name_plural = _("Umfragenteilnahmefelder")

#     objects = models.Manager()
