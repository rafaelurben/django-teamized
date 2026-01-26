# Test settings for django-teamized

from devproject.settings import *  # pylint: disable=wildcard-import, unused-wildcard-import

DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}}

INSTALLED_APPS = ["teamized_tests"] + INSTALLED_APPS
