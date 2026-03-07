/*!
 * Auto dark mode
 */

'use strict';

function updateTheme() {
    document.documentElement.dataset.bsTheme = globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

globalThis.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    updateTheme();
});

globalThis.addEventListener('DOMContentLoaded', () => {
    updateTheme();
});
