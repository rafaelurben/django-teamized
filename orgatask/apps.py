"""App configuration"""

from django.apps import AppConfig


class OrgataskConfig(AppConfig):
    default_auto_field = 'django.db.models.AutoField'
    name = 'orgatask'
    verbose_name = "OrgaTask"
