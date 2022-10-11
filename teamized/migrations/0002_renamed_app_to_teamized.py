# Generated by Django 4.1 on 2022-10-11 22:06

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("teamized", "0001_squashed_initial"),
    ]

    operations = [
        migrations.AlterModelTable(
            name="apikey",
            table="teamized_apikey",
        ),
        migrations.AlterModelTable(
            name="calendar",
            table="teamized_calendar",
        ),
        migrations.AlterModelTable(
            name="calendarevent",
            table="teamized_calendarevent",
        ),
        migrations.AlterModelTable(
            name="invite",
            table="teamized_invite",
        ),
        migrations.AlterModelTable(
            name="member",
            table="teamized_member",
        ),
        migrations.AlterModelTable(
            name="team",
            table="teamized_team",
        ),
        migrations.AlterModelTable(
            name="todolist",
            table="teamized_todolist",
        ),
        migrations.AlterModelTable(
            name="todolistitem",
            table="teamized_todolistitem",
        ),
        migrations.AlterModelTable(
            name="user",
            table="teamized_user",
        ),
        migrations.AlterModelTable(
            name="worksession",
            table="teamized_worksession",
        ),
    ]
