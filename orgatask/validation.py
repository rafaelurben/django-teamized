"""
Utils for validation

These utils are used in API endpoints or models to make validation of POST data easier.
"""

import datetime as dt

from django.utils.translation import gettext as _

from orgatask.exceptions import ValidationError


def _basic(datadict: dict, attr: str, required: bool=True, default=None, null=False) -> str:
    if not attr in datadict:
        if required:
            raise ValidationError(
                _("{} darf nicht weggelassen werden.").format(attr))
        if callable(default):
            return default()
        return default

    data = datadict[attr]

    if data in [None, ""]:
        if null:
            return None
        raise ValidationError(_("{} darf nicht null sein.").format(attr))

    return data


def boolean(datadict: dict, attr: str, required: bool=False, default: bool=True, null=False) -> bool:
    data = _basic(datadict, attr, required, default, null)

    if null and (data is None or data == ""):
        return None

    if isinstance(data, str) and data.lower() == "false":
        data = False
    return bool(data)


def integer(datadict: dict, attr: str, required: bool=True, default: int="", null=False) -> int:
    data = _basic(datadict, attr, required, default, null)

    if null and data is None:
        return None

    try:
        return int(data)
    except ValueError as exc:
        raise ValidationError(_("'{}' ist keine gültige Zahl.").format(data)) from exc


def text(datadict: dict, attr: str, required: bool=True, default: str="", null=False, max_length: int=None) -> str:
    if not required and attr in datadict and datadict[attr] == "":
        return ""

    data = _basic(datadict, attr, required, default, null)

    if null and data is None:
        return None

    if max_length and len(data) > max_length:
        data = data[:max_length]
    return str(data)


def datetime(datadict: dict, attr: str, required: bool = True, default: dt.datetime = None, null=False, fmt="%Y-%m-%dT%H:%M:%S.%f%z") -> dt.datetime:
    data = _basic(datadict, attr, required, default, null)

    if null and data is None:
        return None

    try:
        return dt.datetime.strptime(data, fmt).replace(tzinfo=dt.timezone.utc)
    except ValueError as exc:
        raise ValidationError(_("'{}' ist kein gültiger Zeitpunkt.").format(data)) from exc


def date(datadict: dict, attr: str, required: bool = True, default: dt.date = None, null=False, fmt="%Y-%m-%d") -> dt.date:
    data = _basic(datadict, attr, required, default, null)

    if null and data is None:
        return None

    try:
        return dt.datetime.strptime(data, fmt).date()
    except ValueError as exc:
        raise ValidationError(_("'{}' ist kein gültiges Datum.").format(data)) from exc
