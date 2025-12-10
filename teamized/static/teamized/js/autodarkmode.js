/*!
 * Auto dark mode
 */

'use strict';

function updateTheme() {
    document.documentElement.dataset.bsTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    updateTheme();
});

window.addEventListener('DOMContentLoaded', () => {
    updateTheme();
});
