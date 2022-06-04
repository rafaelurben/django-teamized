# Generated by Django 3.2.10 on 2022-06-02 15:08

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('orgatask', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='WorkSession',
            fields=[
                ('uid', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('time_start', models.DateTimeField(default=django.utils.timezone.now)),
                ('time_end', models.DateTimeField(blank=True, default=None, null=True)),
                ('is_created_via_tracking', models.BooleanField(default=False)),
                ('is_ended', models.BooleanField(default=False)),
                ('note', models.TextField(blank=True, default='')),
                ('member', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='work_sessions', to='orgatask.member')),
                ('team', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='work_sessions', to='orgatask.team')),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='work_sessions', to='orgatask.user')),
            ],
            options={
                'verbose_name': 'Sitzung',
                'verbose_name_plural': 'Sitzungen',
            },
        ),
    ]