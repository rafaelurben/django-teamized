from django.utils.timezone import utc
from datetime import timedelta, datetime, date

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

def iddict(lst: list):
    """
    Returns a dictionary from a list objects with an id attribute
    """
    return {x['id']: x for x in lst}
