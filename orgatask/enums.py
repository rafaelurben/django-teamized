"Lists and more"

from django.utils.translation import gettext as _

class Roles:
    "Roles an organization member can have"

    OWNER = 'owner'
    ADMIN = 'admin'
    MEMBER = 'member'

    ROLES = [
        (OWNER, _('Besitzer')),
        (ADMIN, _('Administrator')),
        (MEMBER, _('Mitglied')),
    ]

class Scopes:
    ORGANIZATION = 'organization'
    MEMBERS = 'members'
    MEMBER = 'member'

    SCOPES = [
        (ORGANIZATION, _("Organisationsverwaltung")),
        (MEMBERS, _("Mitgliederverwaltung")),
        (MEMBER, _("Mitgliedschaft & Einstellungen")),
    ]

class Actions:
    CREATE = 'create'
    CHANGE = 'change'
    DELETE = 'delete'
    INVITE = 'invite'
    JOIN = 'join'
    LEAVE = 'leave'

    ACTIONS = [
        (CREATE, _("Erstellen")),
        (CHANGE, _("Ändern")),
        (DELETE, _("Löschen")),
        (INVITE, _("Einladen")),
        (JOIN, _("Beitreten")),
        (LEAVE, _("Verlassen")),
    ]
