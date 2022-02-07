"Utils for OrgaTask"

from django.contrib.auth.models import User

def user_as_json(user: User):
    "Return a JSON representation of a User object."
    return {
        "id": user.id,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
    }
