import uuid
from datetime import timedelta, datetime, date
from collections.abc import Iterable

from django.utils import timezone


def get_week_start_end(dt: datetime, weekoffset=0):
    """
    Returns the start and end datetime of the week for a given date.
    """
    day = dt.replace(hour=0, minute=0, second=0, microsecond=0)
    day += timedelta(weeks=weekoffset)
    week_start = day - timedelta(days=day.weekday())
    week_end = week_start + timedelta(days=7, microseconds=-1)
    return week_start, week_end


def ical_date(da: date):
    """
    Returns a timestamp in icalendar date format.
    """
    return da.strftime("%Y%m%d")


def ical_datetime(dt: datetime):
    """
    Returns a timestamp in icalendar datetime format.
    """
    return dt.strftime("%Y%m%dT%H%M%SZ")


def ical_text(text: str):
    """
    Returns a text in icalendar format.
    """
    text = text.replace("\r\n", "\n")
    text = text.replace("\\", "\\\\")
    text = text.replace("\n", "\\n")
    text = text.replace("\r", "")
    text = text.replace(";", "\\;")
    text = text.replace(",", "\\,")
    return text


def iddict(lst: Iterable):
    """
    Returns a dictionary from an object iterable with an id attribute
    """
    return {x["id"]: x for x in lst}


def now_plus_1h():
    return timezone.now() + timedelta(hours=1)


def now_plus_1w():
    return timezone.now() + timedelta(weeks=1)


def now_plus_2w():
    return timezone.now() + timedelta(weeks=2)


def now_plus_180d():
    return timezone.now() + timedelta(days=180)


def is_valid_uuid(val):
    try:
        uuid.UUID(str(val))
        return True
    except ValueError:
        return False
