"""
Run the app build

Note: This is a management command, so it can be run with the command
"python manage.py teamized_build" from the project root directory.
"""

import os
import os.path

from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Run the Teamized app build"

    def add_arguments(self, parser):
        parser.add_argument(
            "--live",
            action="store_true",
        )

    def handle(self, *args, **options):
        oldcwd = os.getcwd()

        # Navigate to the "app" directory relative from this file
        filepath = os.path.abspath(__file__)
        folderpath = os.path.dirname(os.path.dirname(os.path.dirname(filepath)))
        newcwd = os.path.join(folderpath, "app")
        os.chdir(newcwd)

        self.stdout.write("Installing Teamized app dependencies...")
        os.system("npm install")

        self.stdout.write("Building Teamized app...")

        try:
            if options["live"]:
                os.system("npm run build-live")
            else:
                os.system("npm run build")
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING("Keyboard interrupt!"))

        # Navigate back to the old working directory
        os.chdir(oldcwd)
        self.stdout.write(self.style.SUCCESS("Finished building Teamized app..."))
