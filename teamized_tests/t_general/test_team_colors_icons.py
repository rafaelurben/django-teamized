from django.test import TestCase

from teamized.exceptions import ValidationError
from teamized.models import Team


class TeamColorsAndIconsTest(TestCase):
    def test_team_as_dict_contains_color_and_icon(self):
        team = Team.objects.create(
            name="Team A",
            description="Beschreibung",
            color="#123456",
            icon="RocketIcon",
        )

        data = team.as_dict(membercount=0)

        self.assertEqual(data["color"], "#123456")
        self.assertEqual(data["icon"], "RocketIcon")

    def test_team_update_from_post_data_updates_color_and_icon(self):
        team = Team.objects.create(
            name="Team A",
            description="Beschreibung",
            color="#123456",
            icon="RocketIcon",
        )

        team.update_from_post_data({"color": "#abcdef", "icon": "ShieldIcon"})
        team.refresh_from_db()

        self.assertEqual(team.color, "#abcdef")
        self.assertEqual(team.icon, "ShieldIcon")

    def test_team_update_from_post_data_rejects_invalid_color(self):
        team = Team.objects.create(name="Team A", description="Beschreibung")

        with self.assertRaises(ValidationError):
            team.update_from_post_data({"color": "blue"})

    def test_team_update_from_post_data_rejects_invalid_icon(self):
        team = Team.objects.create(name="Team A", description="Beschreibung")

        with self.assertRaises(ValidationError):
            team.update_from_post_data({"icon": "users"})
