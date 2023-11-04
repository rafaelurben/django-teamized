/*!
 * Auto dark mode
 */

'use strict'

function updateTheme() {
    const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', theme)
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    updateTheme()
})

window.addEventListener('DOMContentLoaded', () => {
    updateTheme()
})
