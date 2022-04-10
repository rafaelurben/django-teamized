# Generated by Django 3.2.10 on 2022-03-24 12:20

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('orgatask', '0001_initial'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Organization',
            new_name='Team',
        ),
        migrations.AlterModelOptions(
            name='member',
            options={'verbose_name': 'Mitglied', 'verbose_name_plural': 'Mitglieder'},
        ),
        migrations.AlterModelOptions(
            name='team',
            options={'verbose_name': 'Team', 'verbose_name_plural': 'Teams'},
        ),
        migrations.AlterModelOptions(
            name='user',
            options={'verbose_name': 'Benutzer', 'verbose_name_plural': 'Benutzer'},
        ),
        migrations.RenameField(
            model_name='member',
            old_name='organization',
            new_name='team',
        ),
    ]