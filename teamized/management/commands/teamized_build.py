"""
Run the app build

Note: This is a management command, so it can be run with the command
"python manage.py teamized_build" from the project root directory.
"""

import os
import os.path
import sys

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
        code = os.system("npm install")

        if code:
            self.stdout.write(
                self.style.ERROR("[ERROR] 'npm install' exited with non-zero status code")
            )
            sys.exit(code)

        self.stdout.write("Building Teamized app...")

        try:
            if options["live"]:
                code = os.system("npm run build-live")
            else:
                code = os.system("npm run build")
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING("Keyboard interrupt!"))

        # Navigate back to the old working directory
        os.chdir(oldcwd)
        self.stdout.write(self.style.SUCCESS("Finished building Teamized app..."))

        if code:
            self.stdout.write(
                self.style.ERROR("[ERROR] 'npm run build[-live]' exited with non-zero status code!")
            )
            sys.exit(code)
