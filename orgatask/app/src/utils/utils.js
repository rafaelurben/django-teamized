// Utils

export function validateUUID(uuid) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

export function padZero(num, len) {
    return String(num).padStart(len, "0");
}

export function toggleDebug(noask) {
    if ($("body").hasClass("debug")) {
        $("body").removeClass("debug")
    } else {
        if (noask === true || window.appdata.debug_prompt_accepted === true || confirm("Möchtest du den DEBUG-Modus aktivieren?")) {
            window.appdata.debug_prompt_accepted = true;
            $("body").addClass("debug");
        }
    };
}
