"""Custom exceptions"""

from django.http import JsonResponse


class AlertException(Exception):
    "Exception class for errors that should be alerted to the user"

    def __init__(
        self,
        text,
        *args,
        title="Fehler",
        errorname="generic_error",
        status=400,
        **kwargs
    ) -> None:
        super().__init__(*args, **kwargs)
        self._custom_title = title
        self._custom_text = text
        self._custom_errorname = errorname
        self._custom_status = status

    def get_response(self) -> JsonResponse:
        return JsonResponse(
            {
                "error": str(self._custom_errorname),
                "message": str(self._custom_text),
                "alert": {
                    "title": str(self._custom_title),
                    "text": str(self._custom_text),
                },
            },
            status=self._custom_status,
        )


class ValidationError(AlertException):
    "Exception class for validation errors"

    def __init__(
        self,
        text,
        *args,
        title="Ungültige Daten",
        errorname="data_invalid",
        status=400,
        **kwargs
    ) -> None:
        super().__init__(
            text, *args, title=title, errorname=errorname, status=status, **kwargs
        )
