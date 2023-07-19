"""
Utils for validation

These utils are used in API endpoints or models to make validation of POST data easier.
"""

import datetime as dt
import re

from django.utils.translation import gettext as _

from teamized.exceptions import ValidationError

# Base validator class


class BaseValidator():
    "Base class for validating POST request data"

    @classmethod
    def _convert(cls, value, **kwargs):
        return value

    @classmethod
    def _try_convert(cls, value, **kwargs):
        try:
            return cls._convert(value, **kwargs)
        except Exception as exc:
            raise ValidationError(
                _("Der Wert '{}' entspricht nicht dem erwarteten Datentyp!").format(value)) from exc

    @classmethod
    def _is_null(cls, value):
        return value is None or value == ''

    @classmethod
    def _before_convert(cls, value, **kwargs):
        return value

    @classmethod
    def _after_convert(cls, value, **kwargs):
        return value

    @classmethod
    def validate(cls, datadict: dict, attr: str, required: bool = True, default: any = None, null=False, **kwargs):
        # If the attribute is not present in the data dict
        if not attr in datadict:
            if required:
                raise ValidationError(
                    _("Das Attribut '{}' darf nicht weggelassen werden!").format(attr))
            if callable(default):
                return default()
            return default

        value = datadict[attr]

        # If the value is null
        if cls._is_null(value):
            if not null:
                raise ValidationError(
                    _("Das Attribut '{}' darf nicht null sein!").format(attr))
            return None

        # Before convert (for subclasses)
        value = cls._before_convert(value, **kwargs)

        # Try to convert the value
        value = cls._try_convert(value, **kwargs)

        # After convert (for subclasses)
        value = cls._after_convert(value, **kwargs)

        return value

# Custom validators


class BooleanValidator(BaseValidator):
    @classmethod
    def _convert(cls, value, **kwargs):
        return bool(value)

    @classmethod
    def _before_convert(cls, value, **kwargs):
        if isinstance(value, str) and value.lower() == "false":
            return False
        return value


class IntegerValidator(BaseValidator):
    @classmethod
    def _convert(cls, value, **kwargs):
        return int(value)


class StringValidator(BaseValidator):
    @classmethod
    def _convert(cls, value, **kwargs):
        return str(value)

    @classmethod
    def _is_null(cls, value):
        return value is None

    @classmethod
    def _after_convert(cls, value, max_length: int = None, **kwargs):
        if max_length and len(value) > max_length:
            return value[:max_length]
        return value


class DateTimeValidator(BaseValidator):
    @classmethod
    def _convert(cls, value, fmt="%Y-%m-%dT%H:%M:%S.%f%z", **kwargs):
        return dt.datetime.strptime(value, fmt).replace(tzinfo=dt.timezone.utc)


class DateValidator(BaseValidator):
    @classmethod
    def _convert(cls, value, fmt="%Y-%m-%d", **kwargs):
        return dt.datetime.strptime(value, fmt).date()

class RegexValidator(StringValidator):
    @classmethod
    def _convert(cls, value, regex, **kwargs):
        if not re.match(regex, value):
            raise ValidationError(
                _("Der Wert '{}' folgt nicht der Regex-Bedingung '{regex}'!").format(value))
        return value

# Shortcuts


def boolean(datadict: dict, attr: str, required: bool = False, default: bool = True, null=False) -> bool:
    return BooleanValidator.validate(datadict, attr, required, default, null)


def integer(datadict: dict, attr: str, required: bool = True, default: int = "", null=False) -> int:
    return IntegerValidator.validate(datadict, attr, required, default, null)


def text(datadict: dict, attr: str, required: bool = True, default: str = "", null=False, max_length: int = None) -> str:
    return StringValidator.validate(datadict, attr, required, default, null, max_length=max_length)


def datetime(datadict: dict, attr: str, required: bool = True, default: dt.datetime = None, null=False, fmt="%Y-%m-%dT%H:%M:%S.%f%z") -> dt.datetime:
    return DateTimeValidator.validate(datadict, attr, required, default, null, fmt=fmt)


def date(datadict: dict, attr: str, required: bool = True, default: dt.date = None, null=False, fmt="%Y-%m-%d") -> dt.date:
    return DateValidator.validate(datadict, attr, required, default, null, fmt=fmt)


def slug(datadict: dict, attr: str, required: bool = True, default: str = "", null=False, max_length: int = None) -> str:
    return RegexValidator.validate(datadict, attr, required, default, null, max_length=max_length, regex=r'^[0-9a-z\-_]+$')
