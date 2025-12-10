import $ from 'jquery';

/**
 * Get CSRF token from cookies
 * @source https://docs.djangoproject.com/en/6.0/howto/csrf/#using-csrf
 * @param name the name of the cookie
 */
function getCookie(name: string) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const cookieTrimmed = cookie.trim();
            // Does this cookie string begin with the name we want?
            if (cookieTrimmed.substring(0, name.length + 1) === name + '=') {
                cookieValue = decodeURIComponent(
                    cookieTrimmed.substring(name.length + 1)
                );
                break;
            }
        }
    }
    return cookieValue;
}

export function setupCSRFToken() {
    const csrfToken = getCookie('csrftoken');

    $.ajaxSetup({
        headers: {
            'X-CSRFToken': csrfToken,
        },
    });
}
