"""Club attendance API endpoint"""

import logging

from django.db import IntegrityError
from django.http import JsonResponse
from django.utils.translation import gettext as _
from django.views.decorators.csrf import csrf_exempt

from teamized.api.utils.constants import NO_PERMISSION, ENDPOINT_NOT_FOUND, OBJ_NOT_FOUND
from teamized.api.utils.decorators import api_view, require_objects
from teamized.club.models import Club, ClubAttendanceEvent, ClubAttendanceEventParticipation
from teamized.decorators import teamized_prep
from teamized.models import Team, User

logger = logging.getLogger(__name__)


@api_view(["get", "post"])
@csrf_exempt
@teamized_prep()
@require_objects([("team", Team, "team")])
def endpoint_attendance_events(request, team: Team):
    """
    Endpoint for listing and creating attendance events for a team.
    """

    user: User = request.teamized_user
    if not team.user_is_member(user):
        return NO_PERMISSION

    if team.linked_club is None:
        return ENDPOINT_NOT_FOUND
    club: Club = team.linked_club

    if request.method == "GET":
        attendance_events = club.attendance_events.order_by("-dt_start")

        return JsonResponse({"attendance_events": [event.as_dict() for event in attendance_events]})
    if request.method == "POST":
        if not team.user_is_admin(user):
            return NO_PERMISSION

        attendance_event = ClubAttendanceEvent.from_post_data(request.POST, club=club)

        return JsonResponse(
            {
                "success": True,
                "attendance_event": attendance_event.as_dict(),
                "alert": {
                    "title": _("Ereignis erstellt"),
                    "text": _("Das Ereignis wurde erfolgreich hinzugefügt."),
                },
            }
        )
    return None


@api_view(["post", "delete"])
@csrf_exempt
@teamized_prep()
@require_objects(
    [("team", Team, "team"), ("attendance_event", ClubAttendanceEvent, "attendance_event")]
)
def endpoint_attendance_event(request, team: Team, attendance_event: ClubAttendanceEvent):
    """
    Endpoint for editing and deleting a club attendance event
    """

    user: User = request.teamized_user
    if not team.user_is_admin(user):
        return NO_PERMISSION

    if team.linked_club is None:
        return ENDPOINT_NOT_FOUND
    club: Club = team.linked_club

    # Check if attendance_event corresponds to club
    if attendance_event.club != club:
        return OBJ_NOT_FOUND

    # Methods
    if request.method == "POST":
        attendance_event.update_from_post_data(request.POST)
        attendance_event.save()
        return JsonResponse(
            {
                "success": True,
                "id": attendance_event.uid,
                "attendance_event": attendance_event.as_dict(),
                "alert": {
                    "title": _("Ereignis aktualisiert"),
                    "text": _("Das Ereignis wurde erfolgreich aktualisiert."),
                },
            }
        )

    if request.method == "DELETE":
        attendance_event.delete()
        return JsonResponse(
            {
                "success": True,
                "alert": {
                    "title": _("Ereignis gelöscht"),
                    "text": _("Das Ereignis wurde erfolgreich gelöscht."),
                },
            }
        )
    return None


@api_view(["get"])
@csrf_exempt
@teamized_prep()
@require_objects(
    [("team", Team, "team"), ("attendance_event", ClubAttendanceEvent, "attendance_event")]
)
def endpoint_attendance_event_participation_list(
    request, team: Team, attendance_event: ClubAttendanceEvent
):
    """
    Endpoint for listing participation assignments for a club attendance event.
    """

    user: User = request.teamized_user
    if not team.user_is_member(user):
        return NO_PERMISSION

    if team.linked_club is None:
        return ENDPOINT_NOT_FOUND
    club: Club = team.linked_club

    # Check if attendance_event corresponds to club
    if attendance_event.club != club:
        return OBJ_NOT_FOUND

    if request.method == "GET":
        participations = attendance_event.participations.order_by(
            "member__first_name", "member__last_name"
        )

        return JsonResponse({"participations": [p.as_dict() for p in participations]})
    return None


@api_view(["post"])
@csrf_exempt
@teamized_prep()
@require_objects(
    [("team", Team, "team"), ("attendance_event", ClubAttendanceEvent, "attendance_event")]
)
def endpoint_attendance_event_participation_bulk_create(
    request, team: Team, attendance_event: ClubAttendanceEvent
):
    """
    Endpoint for adding participation assignments for a club attendance event.
    """

    user: User = request.teamized_user
    if not team.user_is_admin(user):
        return NO_PERMISSION

    if team.linked_club is None:
        return ENDPOINT_NOT_FOUND
    club: Club = team.linked_club

    # Check if attendance_event corresponds to club
    if attendance_event.club != club:
        return OBJ_NOT_FOUND

    if request.method == "POST":
        # get the list of member ids from the request
        member_ids = request.POST.getlist("member_ids[]")
        members = club.members.filter(uid__in=member_ids)

        created_participations = []
        for member in members:
            try:
                participation = ClubAttendanceEventParticipation.create(
                    event=attendance_event, member=member
                )
            except IntegrityError:
                logger.warning(
                    "Tried to create a participation for member %s in event %s, but it already exists.",
                    member.uid,
                    attendance_event.uid,
                )
                continue
            created_participations.append(participation)

        return JsonResponse(
            {
                "success": True,
                "participations": [p.as_dict() for p in created_participations],
                "alert": {
                    "title": _("Mitglieder zugewiesen"),
                    "text": _(
                        "{actual}/{requested} Mitglieder wurden erfolgreich zugewiesen."
                    ).format(
                        actual=len(created_participations),
                        requested=len(member_ids),
                    ),
                },
            }
        )
    return None


@api_view(["post", "delete"])
@csrf_exempt
@teamized_prep()
@require_objects(
    [
        ("team", Team, "team"),
        ("attendance_event", ClubAttendanceEvent, "attendance_event"),
        ("participation", ClubAttendanceEventParticipation, "participation"),
    ]
)
def endpoint_attendance_event_participation(
    request,
    team: Team,
    attendance_event: ClubAttendanceEvent,
    participation: ClubAttendanceEventParticipation,
):
    """
    Endpoint for updating and deleting participation assignments for a club attendance event.
    """

    user: User = request.teamized_user
    if not team.user_is_admin(user):
        return NO_PERMISSION

    if team.linked_club is None:
        return ENDPOINT_NOT_FOUND
    club: Club = team.linked_club

    # Check if attendance_event corresponds to club
    if attendance_event.club != club:
        return OBJ_NOT_FOUND
    # Check if participation corresponds to attendance_event
    if participation.event != attendance_event:
        return OBJ_NOT_FOUND

    if request.method == "POST":
        participation.update_from_post_data(request.POST)
        participation.save()

        return JsonResponse(
            {
                "success": True,
                "participation": participation.as_dict(),
                "alert": {
                    "title": _("Teilnahme aktualisiert"),
                    "text": _("Die Teilnahme wurde erfolgreich aktualisiert."),
                },
            }
        )
    if request.method == "DELETE":
        participation.delete()
        return JsonResponse(
            {
                "success": True,
                "alert": {
                    "title": _("Teilnahme gelöscht"),
                    "text": _("Die Teilnahme wurde erfolgreich gelöscht."),
                },
            }
        )
    return None
