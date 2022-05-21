from django.utils.timezone import timedelta, datetime

def get_week_start_end(dt: datetime, weekoffset=0):
    """
    Returns the start and end datetime of the week for a given date.
    """
    day = dt.replace(hour=0, minute=0, second=0, microsecond=0)
    day += timedelta(weeks=weekoffset)
    week_start = day - timedelta(days=day.weekday())
    week_end = week_start + timedelta(days=7, microseconds=-1)
    return week_start, week_end
