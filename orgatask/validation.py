"Utils for validation"

import datetime as dt

from django.utils.translation import gettext as _

from orgatask.exceptions import ValidationError

"These utils are used in API endpoints or models to make validation easier."

def _basic(datadict: dict, attr: str, required: bool=True, default: str="") -> str:
    if not attr in datadict:
        if required:
            raise ValidationError(
                _("{} darf nicht weggelassen werden.").format(attr))
        if callable(default):
            return default()
        return default

    data = datadict[attr]

    if required and not data:
        raise ValidationError(_("{} darf nicht leer sein.").format(attr))

    return data

def boolean(datadict: dict, attr: str, required: bool=False, default: bool=True) -> bool:
    data = _basic(datadict, attr, required, default)

    if isinstance(data, str) and data.lower() == "false":
        data = False
    return bool(data)

def text(datadict: dict, attr: str, required: bool=True, default: str="", max_length: int=None) -> str:
    data = _basic(datadict, attr, required, default)

    if max_length and len(data) > max_length:
        data = data[:max_length]
    return str(data)


def datetime(datadict: dict, attr: str, required: bool = True, default: dt.datetime = None, fmt="%Y-%m-%dT%H:%M:%S.%f%z") -> dt.datetime:
    data = _basic(datadict, attr, required, default)

    try:
        return dt.datetime.strptime(data, fmt).replace(tzinfo=dt.timezone.utc)
    except ValueError as exc:
        raise ValidationError(_("{} ist kein gültiger Zeitpunkt.").format(attr)) from exc


def date(datadict: dict, attr: str, required: bool = True, default: dt.date = None, fmt="%Y-%m-%d") -> dt.date:
    data = _basic(datadict, attr, required, default)

    try:
        return dt.datetime.strptime(data, fmt).date()
    except ValueError as exc:
        raise ValidationError(_("{} ist kein gültiges Datum.").format(attr)) from exc
