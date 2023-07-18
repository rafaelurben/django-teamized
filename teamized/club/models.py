"""Database Models for the club subapp

Django will handle the database itself. Only the models need to be defined here.
"""

import uuid

from copy import deepcopy

from django.db import models
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
from django.urls import reverse

from teamized import enums, utils

_ = (
    lambda s: s  # dummy translation function # pylint: disable=unnecessary-lambda-assignment
)

# Create your models here.


class Club(models.Model):
    uid = models.UUIDField(
        primary_key=True, default=uuid.uuid4, verbose_name=_("UID"), editable=False
    )
    slug = models.SlugField(
        verbose_name=_("Slug"), unique=True, max_length=50, null=True, blank=True, default=None
    )

    name = models.CharField(max_length=50, verbose_name=_("Name"))
    description = models.TextField(
        verbose_name=_("Beschreibung"),
        blank=True,
        default="",
        help_text=_("Wird auf der Login-Seite angezeigt."),
    )

    date_created = models.DateTimeField(
        verbose_name=_("Erstellt am"), auto_now_add=True
    )
    date_modified = models.DateTimeField(
        verbose_name=_("Zuletzt geändert am"), auto_now=True
    )

    class Meta:
        verbose_name = _("Verein")
        verbose_name_plural = _("Vereine")

    objects = models.Manager()

    def __str__(self):
        return str(self.name)

    def as_dict(self):
        return {
            "uid": str(self.uid),
            "name": str(self.name),
            "description": str(self.description),
        }

    def session_get_logged_in_members(self, request):
        members = []
        if "clubmanager_sessions" in request.session:
            sessions = request.session["clubmanager_sessions"]
            if str(self.uid) in sessions:
                for memberuid, magicuid in deepcopy(
                    request.session["clubmanager_sessions"][str(self.uid)]
                ).items():
                    if ClubMemberMagicLink.objects.filter(
                        uid=magicuid,
                        member_id=memberuid,
                        logged_in=True,
                        disabled=False,
                        valid_until__gt=timezone.now(),
                    ).exists():
                        magiclink = ClubMemberMagicLink.objects.get(
                            uid=magicuid,
                            member_id=memberuid,
                            logged_in=True,
                            disabled=False,
                            valid_until__gt=timezone.now(),
                        )
                        members.append(
                            {
                                "member": magiclink.member,
                                "url": (
                                    reverse(
                                        "clubmanager:member_app",
                                        kwargs={"memberuid": magiclink.member.uid},
                                    )
                                ),
                            }
                        )
                    else:
                        del request.session["clubmanager_sessions"][str(self.uid)][memberuid]
                        request.session.modified = True
        return members


class ClubMember(models.Model):
    uid = models.UUIDField(
        primary_key=True, default=uuid.uuid4, verbose_name=_("UID"), editable=False
    )
    club = models.ForeignKey(Club, on_delete=models.CASCADE, verbose_name=_("Verein"))

    email = models.EmailField(verbose_name=_("E-Mail"))

    first_name = models.CharField(max_length=50, verbose_name=_("Vorname"))
    last_name = models.CharField(max_length=50, verbose_name=_("Nachname"))
    birth_date = models.DateField(
        verbose_name=_("Geburtsdatum"), null=True, blank=True, default=None
    )

    phone = models.CharField(
        max_length=50, verbose_name=_("Telefon"), blank=True, default=""
    )
    mobile = models.CharField(
        max_length=50, verbose_name=_("Mobil"), blank=True, default=""
    )

    street = models.CharField(
        max_length=50, verbose_name=_("Straße"), blank=True, default=""
    )
    zip_code = models.CharField(
        max_length=50, verbose_name=_("PLZ"), blank=True, default=""
    )
    city = models.CharField(
        max_length=50, verbose_name=_("Ort"), blank=True, default=""
    )

    notes = models.TextField(verbose_name=_("Notizen"), blank=True, default="")

    date_created = models.DateTimeField(
        verbose_name=_("Erstellt am"), auto_now_add=True
    )
    date_modified = models.DateTimeField(
        verbose_name=_("Zuletzt geändert am"), auto_now=True
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
        return f"{self.first_name} {self.last_name} (Vereinsmitglied)"

    def as_dict(self, detailed=False):
        if detailed:
            return{
                "uid": str(self.memberuid),
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
            "uid": str(self.memberuid),
            "email": str(self.email),
            "first_name": str(self.first_name),
            "last_name": str(self.last_name),
        }

    def can_login_with_magicuid(self, magic_uid):
        if not utils.is_valid_uuid(magic_uid):
            return False
        return ClubMemberMagicLink.objects.filter(
            uid=magic_uid,
            member=self,
            login_until__gt=timezone.now(),
            logged_in=False,
            disabled=False,
        ).exists()

    def can_use_magicuid(self, magic_uid):
        if not utils.is_valid_uuid(magic_uid):
            return False
        return ClubMemberMagicLink.objects.filter(
            uid=magic_uid,
            member=self,
            valid_until__gt=timezone.now(),
            logged_in=True,
            disabled=False,
        ).exists()

    def session_is_logged_in(self, request):
        if "clubmanager_sessions" in request.session:
            sessions = request.session["clubmanager_sessions"]
            if self.clubuid in sessions:
                if self.memberuid in sessions[self.clubuid]:
                    if self.can_use_magicuid(
                        sessions[self.clubuid][self.memberuid]
                    ):
                        return True
                    del sessions[self.clubuid][self.memberuid]
                    request.session.modified = True
        return False

    def session_login(self, request, magic_uid):
        if not self.can_login_with_magicuid(magic_uid):
            return False

        ClubMemberMagicLink.objects.get(
            uid=magic_uid,
            member=self,
            login_until__gt=timezone.now(),
            logged_in=False,
            disabled=False,
        ).mark_logged_in()

        if not "clubmanager_sessions" in request.session:
            request.session["clubmanager_sessions"] = {}
        if not self.clubuid in request.session["clubmanager_sessions"]:
            request.session["clubmanager_sessions"][self.clubuid] = {}
        request.session["clubmanager_sessions"][self.clubuid][self.memberuid] = str(
            magic_uid
        )
        request.session.modified = True

        return True

    def session_logout(self, request):
        if "clubmanager_sessions" in request.session:
            if self.clubuid in request.session["clubmanager_sessions"]:
                if (
                    self.memberuid
                    in request.session["clubmanager_sessions"][self.clubuid]
                ):
                    magic_uid = request.session["clubmanager_sessions"][self.clubuid][
                        self.memberuid
                    ]
                    del request.session["clubmanager_sessions"][self.clubuid][
                        self.memberuid
                    ]
                    if len(request.session["clubmanager_sessions"][self.clubuid]) == 0:
                        del request.session["clubmanager_sessions"][self.clubuid]
                    if len(request.session["clubmanager_sessions"]) == 0:
                        del request.session["clubmanager_sessions"]
                    if ClubMemberMagicLink.objects.filter(uid=magic_uid, member=self).exists():
                        ClubMemberMagicLink.objects.get(uid=magic_uid, member=self).disable()
        request.session.modified = True

    def send_magic_link(self, request):
        """Send a new magic link to the member's email address."""

        magic_link = ClubMemberMagicLink.objects.create(member=self)
        magic_link.send_email(request)


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

    logged_in = models.BooleanField(verbose_name=_("Verwendet?"), default=False)
    disabled = models.BooleanField(verbose_name=_("Deaktiviert?"), default=False)

    login_until = models.DateTimeField(
        verbose_name=_("Login bis"), default=utils.now_plus_1h
    )
    valid_until = models.DateTimeField(
        verbose_name=_("Verwendbar bis"), default=utils.now_plus_2w
    )

    date_created = models.DateTimeField(
        verbose_name=_("Erstellt am"), auto_now_add=True
    )
    date_modified = models.DateTimeField(
        verbose_name=_("Zuletzt geändert am"), auto_now=True
    )

    class Meta:
        verbose_name = _("Magischer Link")
        verbose_name_plural = _("Magische Links")

    objects = models.Manager()

    def can_login(self):
        return (timezone.now() <= self.login_until) and (not self.logged_in)

    def can_be_logged_in(self):
        return (timezone.now() <= self.valid_until) and (not self.disabled)

    def mark_logged_in(self):
        self.logged_in = True
        self.save()

    def disable(self):
        self.disabled = True
        self.save()

    def send_email(self, request):
        """Send the magic link to the member's email address."""

        url = (
            request.build_absolute_uri(
                reverse(
                    "clubmanager:member_login", kwargs={"memberuid": self.member.uid}
                )
            )
            + f"?magicuid={self.uid}"
        )

        send_mail(
            subject="Dein magischer Login-Link",
            message=render_to_string(
                "clubmanager/emails/magic_mail.txt",
                {
                    "magicurl": url,
                    "member": self.member,
                },
                request=request,
            ),
            from_email=None,
            recipient_list=[self.member.email],
        )


# class ClubMemberGroup(models.Model):

# class ClubMemberGroupMembership(models.Model):


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