# Generated by Django 3.2.10 on 2022-06-06 21:21

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('orgatask', '0002_worksession'),
    ]

    operations = [
        migrations.CreateModel(
            name='Calendar',
            fields=[
                ('uid', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=50)),
                ('description', models.TextField(blank=True, default='')),
                ('ics_uid', models.UUIDField(default=uuid.uuid4, unique=True)),
                ('is_public', models.BooleanField(default=True)),
                ('team', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='calendars', to='orgatask.team')),
            ],
            options={
                'verbose_name': 'Kalender',
                'verbose_name_plural': 'Kalender',
            },
        ),
        migrations.CreateModel(
            name='CalendarEvent',
            fields=[
                ('uid', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=50)),
                ('description', models.TextField(blank=True, default='')),
                ('dtstart', models.DateTimeField(blank=True, default=None, null=True)),
                ('dtend', models.DateTimeField(blank=True, default=None, null=True)),
                ('dstart', models.DateField(blank=True, default=None, null=True)),
                ('dend', models.DateField(blank=True, default=None, null=True)),
                ('fullday', models.BooleanField(default=False)),
                ('calendar', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='events', to='orgatask.calendar')),
            ],
            options={
                'verbose_name': 'Ereignis',
                'verbose_name_plural': 'Ereignisse',
            },
        ),
    ]
