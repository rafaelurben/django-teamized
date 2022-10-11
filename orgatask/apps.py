"""App configuration"""

from django.apps import AppConfig


class DefaultConfig(AppConfig):
    default_auto_field = 'django.db.models.AutoField'
    name = 'orgatask'
    label = 'teamized'
    verbose_name = "OrgaTask"
