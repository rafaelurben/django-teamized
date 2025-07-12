"""Useful constants for api views"""

from django.http import JsonResponse
from django.utils.translation import gettext as _


APIKEY_INVALID = JsonResponse(
    {
        "error": "apikey-invalid",
        "message": _("Dein API-Key ist ungültig!"),
    },
    status=403,
)

ENDPOINT_NOT_FOUND = JsonResponse(
    {
        "error": "endpoint-not-found",
        "message": _("Dieser Endpunkt existiert nicht!"),
    },
    status=404,
)

NO_PERMISSION_APIKEY = JsonResponse(
    {
        "error": "no-permission-api-key",
        "message": _("Du hast keine Berechtigung dazu. (Authentifizierung via API-Key)"),
    },
    status=403,
)

NO_PERMISSION_SESSION = JsonResponse(
    {
        "error": "no-permission-session",
        "message": _("Du hast keine Berechtigung dazu. (Authentifizierung via Session)"),
    },
    status=403,
)

NO_PERMISSION = JsonResponse(
    {
        "error": "no-permission",
        "message": _("Du hast keine Berechtigung dazu."),
    },
    status=403,
)

NOT_AUTHENTICATED = JsonResponse(
    {
        "error": "not-authenticated",
        "message": _("Du bist nicht authentifiziert."),
    },
    status=401,
)

OBJ_NOT_FOUND = JsonResponse(
    {
        "error": "object-not-found",
        "message": _("Dieses Objekt konnte nicht gefunden werden."),
    },
    status=400,
)

METHOD_NOT_ALLOWED = JsonResponse(
    {
        "error": "method-not-allowed",
        "message": _("Diese Methode ist für diesen Endpunkt nicht erlaubt."),
    },
    status=405,
)

SUCCESSFULLY_CHANGED = JsonResponse(
    {"success": "change-successfull", "message": _("Änderung erfolgreich.")}, status=200
)

NOT_IMPLEMENTED = JsonResponse(
    {
        "error": "not-implemented",
        "message": _("Diese Methode ist noch nicht implementiert."),
    },
    status=501,
)

DATA_INVALID = JsonResponse(
    {
        "error": "data-invalid",
        "message": _("Die Daten, die du angegeben hast, sind ungültig."),
    },
    status=400,
)

NOT_AN_UUID = JsonResponse(
    {
        "error": "not-an-uuid",
        "message": _("Dies ist keine gültige UUID."),
    },
    status=400,
)
