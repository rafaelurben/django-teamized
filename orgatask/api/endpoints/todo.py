"""Calendar API endpoints"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.translation import gettext as _

from orgatask.api.constants import NO_PERMISSION, OBJ_NOT_FOUND
from orgatask.api.decorators import require_objects, api_view
from orgatask.decorators import orgatask_prep
from orgatask.models import ToDoList, ToDoListItem, Team, User


@api_view(["get", "post"])
@orgatask_prep()
@csrf_exempt
@require_objects([("team", Team, "team")])
def endpoint_todolists(request, team: Team):
    """
    Endpoint for listing all ToDoLists of the specified team and creating a new one.
    """

    user: User = request.orgatask_user

    if request.method == "GET":
        if not team.user_is_member(user):
            return NO_PERMISSION

        # Get all ToDoLists of the team
        todolists = team.todolists.all().order_by("name")
        return JsonResponse({
            "todolists": [todolist.as_dict() for todolist in todolists],
        })
    if request.method == "POST":
        if not team.user_is_admin(user):
            return NO_PERMISSION

        todolist = ToDoList.from_post_data(request.POST, team)
        return JsonResponse({
            "success": True,
            "id": todolist.uid,
            "todolist": todolist.as_dict(),
            "alert": {
                "title": _("ToDo-Liste erstellt"),
                "text": _("Die ToDo-Liste wurde erfolgreich erstellt."),
            }
        })


@api_view(["get", "post", "delete"])
@csrf_exempt
@orgatask_prep()
@require_objects([("team", Team, "team"), ("todolist", ToDoList, "todolist")])
def endpoint_todolist(request, team: Team, todolist: ToDoList):
    """
    Endpoint for managing or deleting a ToDoList.
    """

    # Check if todolist is in team
    if todolist.team != team:
        return OBJ_NOT_FOUND

    user: User = request.orgatask_user

    if request.method == "GET":
        if not team.user_is_member(user):
            return NO_PERMISSION

        return JsonResponse({
            "id": todolist.uid,
            "todolist": todolist.as_dict(),
        })
    if request.method == "POST":
        if not team.user_is_admin(user):
            return NO_PERMISSION

        todolist.update_from_post_data(request.POST)
        return JsonResponse({
            "success": True,
            "id": todolist.uid,
            "todolist": todolist.as_dict(),
            "alert": {
                "title": _("ToDo-Liste geändert"),
                "text": _("Die ToDo-Liste wurde erfolgreich geändert."),
            }
        })
    if request.method == "DELETE":
        if not team.user_is_admin(user):
            return NO_PERMISSION

        todolist.delete()
        return JsonResponse({
            "success": True,
            "alert": {
                "title": _("ToDo-Liste gelöscht"),
                "text": _("Die ToDo-Liste wurde erfolgreich gelöscht."),
            }
        })

@api_view(["get", "post"])
@csrf_exempt
@orgatask_prep()
@require_objects([("team", Team, "team"), ("todolist", ToDoList, "todolist")])
def endpoint_todolistitems(request, team: Team, todolist: ToDoList):
    """
    Endpoint for creating a new item in the ToDoList.
    """

    # Check if todolist is in team
    if todolist.team != team:
        return OBJ_NOT_FOUND

    user: User = request.orgatask_user

    # Check if user is member of team
    if not team.user_is_member(user):
        return NO_PERMISSION

    if request.method == "GET":
        items = todolist.items.all()
        return JsonResponse({
            "items": [item.as_dict() for item in items],
        })
    if request.method == "POST":
        item = ToDoListItem.from_post_data(request.POST, user=user, todolist=todolist)
        return JsonResponse({
            "success": True,
            "id": item.uid,
            "item": item.as_dict(),
            "alert": {
                "title": _("Listeneintrag erstellt"),
                "text": _("Der Listeneintrag wurde erfolgreich erstellt."),
            }
        })


@api_view(["get", "post", "delete"])
@csrf_exempt
@orgatask_prep()
@require_objects([("team", Team, "team"), ("todolist", ToDoList, "todolist"), ("item", ToDoListItem, "item")])
def endpoint_todolistitem(request, team: Team, todolist: ToDoList, item: ToDoListItem):
    """
    Endpoint for managing or deleting a ToDoListItem.
    """

    # Check if todolist is in team
    if todolist.team != team:
        return OBJ_NOT_FOUND
    # Check if item is in todolist
    if item.todolist != todolist:
        return OBJ_NOT_FOUND

    user: User = request.orgatask_user

    if not team.user_is_member(user):
        return NO_PERMISSION

    if request.method == "GET":
        return JsonResponse({
            "id": item.uid,
            "item": item.as_dict(),
        })
    if request.method == "POST":
        item.update_from_post_data(request.POST, user)
        return JsonResponse({
            "success": True,
            "id": item.uid,
            "item": item.as_dict(),
            "alert": {
                "title": _("Listeneintrag geändert"),
                "text": _("Der Listeneintrag wurde erfolgreich geändert."),
            }
        })
    if request.method == "DELETE":
        item.delete()
        return JsonResponse({
            "success": True,
            "alert": {
                "title": _("Listeneintrag gelöscht"),
                "text": _("Der Listeneintrag wurde erfolgreich gelöscht."),
            }
        })
