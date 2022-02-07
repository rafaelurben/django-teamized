"Lists and more"

from django.utils.translation import gettext as _

ROLES = [
    ('owner', _('Besitzer')),
    ('admin', _('Administrator')),
    ('member', _('Mitglied')),
]

SCOPES = [
    ('organization', _("Organisationsverwaltung")),
    ('members', _("Mitgliederverwaltung")),
    ('member', _("Mitgliedschaft & Einstellungen")),
]

ACTIONS = [
    ('create', _("Erstellen")),
    ('change', _("Ändern")),
    ('delete', _("Löschen")),
    ('invite', _("Einladen")),
    ('join', _("Beitreten")),
    ('leave', _("Verlassen")),
]
