"Custom exceptions for OrgaTask"

from django.http import JsonResponse

class AlertException(Exception):
    "Exception class for errors that should be alerted to the user"

    def __init__(self, text, *args, title="Fehler", errorname="generic_error", status=400, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.orgatask_title = title
        self.orgatask_text = text
        self.orgatask_errorname = errorname
        self.orgatask_status = status

    def get_response(self) -> JsonResponse:
        return JsonResponse({
            "error": str(self.orgatask_errorname),
            "message": str(self.orgatask_text),
            "alert": {
                "title": str(self.orgatask_title),
                "text": str(self.orgatask_text),
            },
        }, status=self.orgatask_status)

class ValidationError(AlertException):
    "Exception class for validation errors"

    def __init__(self, text, *args, title="Ungültige Daten", errorname="data_invalid", status=400, **kwargs) -> None:
        super().__init__(text, *args, title=title, errorname=errorname, status=status, **kwargs)
