"Custom exceptions for OrgaTask"

from django.http import JsonResponse

class AlertException(Exception):
    "Exception class for errors that should be alerted to the user"
    
    def __init__(self, text, *args, title="Fehler", errorname="generic_error", **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.orgatask_text = text
        self.orgatask_title = title
        self.orgatask_errorname = errorname

    def get_response(self) -> JsonResponse:
        return JsonResponse({
            "error": str(self.orgatask_errorname),
            "message": str(self.orgatask_text),
            "alert": {
                "title": str(self.orgatask_title),
                "text": str(self.orgatask_text),
            },
        }, status=400)
