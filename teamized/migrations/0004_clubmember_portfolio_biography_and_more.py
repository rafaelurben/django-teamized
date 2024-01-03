# Generated by Django 4.2.7 on 2023-11-04 16:28

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("teamized", "0003_basic_club_models"),
    ]

    operations = [
        migrations.AddField(
            model_name="clubmember",
            name="portfolio_biography",
            field=models.TextField(blank=True, default="", verbose_name="Biografie"),
        ),
        migrations.AddField(
            model_name="clubmember",
            name="portfolio_contact_email",
            field=models.EmailField(
                blank=True, default="", max_length=254, verbose_name="Kontakt-E-Mail"
            ),
        ),
        migrations.AddField(
            model_name="clubmember",
            name="portfolio_highlights",
            field=models.TextField(blank=True, default="", verbose_name="Highlights"),
        ),
        migrations.AddField(
            model_name="clubmember",
            name="portfolio_hobbies",
            field=models.TextField(blank=True, default="", verbose_name="Hobbies"),
        ),
        migrations.AddField(
            model_name="clubmember",
            name="portfolio_hobby_since",
            field=models.PositiveIntegerField(
                blank=True, default=None, null=True, verbose_name="Hobby seit (Jahr)"
            ),
        ),
        migrations.AddField(
            model_name="clubmember",
            name="portfolio_image1_url",
            field=models.URLField(
                blank=True, default="", verbose_name="Portfolio-Bild 1"
            ),
        ),
        migrations.AddField(
            model_name="clubmember",
            name="portfolio_image2_url",
            field=models.URLField(
                blank=True, default="", verbose_name="Portfolio-Bild 1"
            ),
        ),
        migrations.AddField(
            model_name="clubmember",
            name="portfolio_member_since",
            field=models.PositiveIntegerField(
                blank=True, default=None, null=True, verbose_name="Mitglied seit (Jahr)"
            ),
        ),
        migrations.AddField(
            model_name="clubmember",
            name="portfolio_profession",
            field=models.CharField(
                blank=True, default="", max_length=50, verbose_name="Beruf"
            ),
        ),
        migrations.AddField(
            model_name="clubmember",
            name="portfolio_role",
            field=models.CharField(
                blank=True, default="", max_length=50, verbose_name="Rolle"
            ),
        ),
        migrations.AddField(
            model_name="clubmember",
            name="portfolio_visible",
            field=models.BooleanField(default=True, verbose_name="Portfolio sichtbar?"),
        ),
    ]