"""
Run the OrgaTask app build
"""

import os
import os.path

from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = ("Run the OrgaTask app build")

    def add_arguments(self, parser):
        parser.add_argument('--live', action='store_true',)

    def handle(self, *args, **options):
        oldcwd = os.getcwd()

        filepath = os.path.abspath(__file__)
        folderpath = os.path.dirname(os.path.dirname(os.path.dirname(filepath)))

        newcwd = os.path.join(folderpath, "app")
        os.chdir(newcwd)

        self.stdout.write(self.style.SUCCESS("Building OrgaTask app..."))

        try:
            if options["live"]:
                os.system("npm run build-live")
            else:
                os.system("npm run build")
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING("Keyboard interrupt!"))

        os.chdir(oldcwd)
        self.stdout.write(self.style.SUCCESS("Finished building OrgaTask app..."))
