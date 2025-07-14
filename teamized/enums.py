"""Lists and more

Note: These are not "real" enum objects.
"""

from django.db import models
from django.utils.translation import gettext as _


class Roles(models.TextChoices):
    """Roles a team member can have"""

    OWNER = "owner", _("Besitzer")
    ADMIN = "admin", _("Administrator")
    MEMBER = "member", _("Mitglied")


# The following enums are part of a planned feature: Logging

# class Scopes:
#     TEAM = 'team'
#     MEMBERS = 'members'
#     MEMBER = 'member'

#     SCOPES = [
#         (TEAM, _("Teamverwaltung")),
#         (MEMBERS, _("Mitgliederverwaltung")),
#         (MEMBER, _("Mitgliedschaft & Einstellungen")),
#     ]

# class Actions:
#     CREATE = 'create'
#     CHANGE = 'change'
#     DELETE = 'delete'
#     INVITE = 'invite'
#     JOIN = 'join'
#     LEAVE = 'leave'

#     ACTIONS = [
#         (CREATE, _("Erstellen")),
#         (CHANGE, _("Ändern")),
#         (DELETE, _("Löschen")),
#         (INVITE, _("Einladen")),
#         (JOIN, _("Beitreten")),
#         (LEAVE, _("Verlassen")),
#     ]


class PollFieldTypes(models.TextChoices):
    SHORT_TEXT = "short_text", "Kurzer Text"
    LONG_TEXT = "long_text", "Langer Text"
    NUMBER = "number", "Zahl"
    YESNO = "yesno", "Ja/Nein"
    CHOICE = "choice", "Auswahl"
    CHOICE_MULTIPLE = "choice_multiple", "Auswahl (mehrere)"
