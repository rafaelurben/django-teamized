/**
 * Module for navigation, routing and rendering
 */

import React from 'react';
import { createRoot } from 'react-dom/client';

import App from '../components/App';
import { NavigationProvider } from '../utils/navigation/navigationProvider';

const rootElem = document.getElementById('react-root')!;
let root = createRoot(rootElem);

export function toggleSidebar() {
    document.body.classList.toggle('sidebar-visible');
}

export function hideSidebarOnMobile() {
    if (window.innerWidth < 992) {
        document.body.classList.remove('sidebar-visible');
    }
}

export function showSidebarOnDesktop() {
    if (window.innerWidth >= 992) {
        document.body.classList.add('sidebar-visible');
    }
}

export function render() {
    root.render(
        <NavigationProvider>
            <App />
        </NavigationProvider>
    );
}

export function reRender() {
    root.unmount();
    root = createRoot(rootElem);
    render();
}
