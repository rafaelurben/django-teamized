# Generated by Django 3.2.10 on 2022-05-07 19:35

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('orgatask', '0003_invite'),
    ]

    operations = [
        migrations.RenameField(
            model_name='team',
            old_name='title',
            new_name='name',
        ),
    ]
