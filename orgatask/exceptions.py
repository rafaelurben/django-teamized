"Custom exceptions for OrgaTask"

class AlertException(Exception):
    "Exception class for errors that should be alerted to the user"
    
    def __init__(self, message, *args, name="generic_error", **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.orgatask_name = name
        self.orgatask_message = message
