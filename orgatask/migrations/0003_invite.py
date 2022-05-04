# Generated by Django 3.2.10 on 2022-05-04 17:36

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('orgatask', '0002_auto_20220324_1320'),
    ]

    operations = [
        migrations.CreateModel(
            name='Invite',
            fields=[
                ('uid', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('token', models.UUIDField(default=uuid.uuid4, unique=True)),
                ('max_uses', models.PositiveIntegerField(default=1)),
                ('uses_left', models.PositiveIntegerField(default=1)),
                ('note', models.TextField(blank=True, default='')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('valid_until', models.DateTimeField(blank=True, default=None, null=True)),
                ('team', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='invites', to='orgatask.team')),
            ],
            options={
                'verbose_name': 'Einladung',
                'verbose_name_plural': 'Einladungen',
            },
        ),
    ]
