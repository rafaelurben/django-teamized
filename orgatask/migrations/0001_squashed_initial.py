# Generated by Django 4.1 on 2022-10-11 19:12

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Team",
            fields=[
                (
                    "uid",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("name", models.CharField(max_length=50)),
                ("description", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Team",
                "verbose_name_plural": "Teams",
                "db_table": "orgatask_team",
            },
        ),
        migrations.CreateModel(
            name="User",
            fields=[
                (
                    "uid",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "auth_user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="orgatask_user",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "settings_darkmode",
                    models.BooleanField(blank=True, default=None, null=True),
                ),
            ],
            options={
                "verbose_name": "Benutzer",
                "verbose_name_plural": "Benutzer",
                "db_table": "orgatask_user",
            },
        ),
        migrations.CreateModel(
            name="Member",
            fields=[
                (
                    "uid",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "role",
                    models.CharField(
                        choices=[
                            ("owner", "Besitzer"),
                            ("admin", "Administrator"),
                            ("member", "Mitglied"),
                        ],
                        default="member",
                        max_length=16,
                    ),
                ),
                ("note", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "team",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="members",
                        to="orgatask.team",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="member_instances",
                        to="orgatask.user",
                    ),
                ),
            ],
            options={
                "verbose_name": "Mitglied",
                "verbose_name_plural": "Mitglieder",
                "db_table": "orgatask_member",
            },
        ),
        migrations.CreateModel(
            name="Invite",
            fields=[
                (
                    "uid",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("token", models.UUIDField(default=uuid.uuid4, unique=True)),
                ("uses_left", models.PositiveIntegerField(default=1)),
                ("uses_used", models.PositiveIntegerField(default=0)),
                ("note", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "valid_until",
                    models.DateTimeField(blank=True, default=None, null=True),
                ),
                (
                    "team",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="invites",
                        to="orgatask.team",
                    ),
                ),
            ],
            options={
                "verbose_name": "Einladung",
                "verbose_name_plural": "Einladungen",
                "db_table": "orgatask_invite",
            },
        ),
        migrations.CreateModel(
            name="ApiKey",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "key",
                    models.UUIDField(
                        default=uuid.uuid4, unique=True, verbose_name="Key"
                    ),
                ),
                (
                    "name",
                    models.CharField(
                        blank=True, default="", max_length=100, verbose_name="Name"
                    ),
                ),
                (
                    "read",
                    models.BooleanField(default=True, verbose_name="Read permission?"),
                ),
                (
                    "write",
                    models.BooleanField(
                        default=False, verbose_name="Write permission?"
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="orgatask_apikeys",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "API key",
                "verbose_name_plural": "API keys",
                "db_table": "orgatask_apikey",
            },
        ),
        migrations.CreateModel(
            name="WorkSession",
            fields=[
                (
                    "uid",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("time_start", models.DateTimeField(default=django.utils.timezone.now)),
                ("time_end", models.DateTimeField(blank=True, default=None, null=True)),
                ("is_created_via_tracking", models.BooleanField(default=False)),
                ("is_ended", models.BooleanField(default=False)),
                ("note", models.TextField(blank=True, default="")),
                (
                    "member",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="work_sessions",
                        to="orgatask.member",
                    ),
                ),
                (
                    "team",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="work_sessions",
                        to="orgatask.team",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="work_sessions",
                        to="orgatask.user",
                    ),
                ),
            ],
            options={
                "verbose_name": "Sitzung",
                "verbose_name_plural": "Sitzungen",
                "db_table": "orgatask_worksession",
            },
        ),
        migrations.CreateModel(
            name="Calendar",
            fields=[
                (
                    "uid",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("name", models.CharField(max_length=50)),
                ("description", models.TextField(blank=True, default="")),
                ("ics_uid", models.UUIDField(default=uuid.uuid4, unique=True)),
                ("is_public", models.BooleanField(default=True)),
                (
                    "team",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="calendars",
                        to="orgatask.team",
                    ),
                ),
                (
                    "color",
                    models.CharField(blank=True, default="#000000", max_length=20),
                ),
            ],
            options={
                "verbose_name": "Kalender",
                "verbose_name_plural": "Kalender",
                "db_table": "orgatask_calendar",
            },
        ),
        migrations.CreateModel(
            name="CalendarEvent",
            fields=[
                (
                    "uid",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=50)),
                ("description", models.TextField(blank=True, default="")),
                ("dtstart", models.DateTimeField(blank=True, default=None, null=True)),
                ("dtend", models.DateTimeField(blank=True, default=None, null=True)),
                ("dstart", models.DateField(blank=True, default=None, null=True)),
                ("dend", models.DateField(blank=True, default=None, null=True)),
                ("fullday", models.BooleanField(default=False)),
                (
                    "calendar",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="events",
                        to="orgatask.calendar",
                    ),
                ),
                ("location", models.CharField(blank=True, default="", max_length=250)),
            ],
            options={
                "verbose_name": "Ereignis",
                "verbose_name_plural": "Ereignisse",
                "db_table": "orgatask_calendarevent",
            },
        ),
        migrations.CreateModel(
            name="ToDoList",
            fields=[
                (
                    "uid",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=50)),
                ("description", models.TextField(blank=True, default="")),
                (
                    "color",
                    models.CharField(blank=True, default="#FFFFFF", max_length=20),
                ),
                (
                    "team",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="todolists",
                        to="orgatask.team",
                    ),
                ),
            ],
            options={
                "verbose_name": "To-do-Liste",
                "verbose_name_plural": "To-do-Listen",
                "db_table": "orgatask_todolist",
            },
        ),
        migrations.CreateModel(
            name="ToDoListItem",
            fields=[
                (
                    "uid",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=50)),
                ("description", models.TextField(blank=True, default="")),
                ("done", models.BooleanField(default=False)),
                ("done_at", models.DateTimeField(null=True)),
                (
                    "created_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="+",
                        to="orgatask.user",
                    ),
                ),
                (
                    "done_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="+",
                        to="orgatask.user",
                    ),
                ),
                (
                    "todolist",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="items",
                        to="orgatask.todolist",
                    ),
                ),
            ],
            options={
                "verbose_name": "To-do-Listeneintrag",
                "verbose_name_plural": "To-do-Listeneinträge",
                "db_table": "orgatask_todolistitem",
            },
        ),
    ]
