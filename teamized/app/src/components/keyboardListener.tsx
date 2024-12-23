import $ from 'jquery';
import { useEffect } from 'react';

import { softRefresh } from '../service/navigation.service';
import * as GeneralUtils from '../utils/general';

export default function KeyboardListener() {
    useEffect(() => {
        const onkeypress = (e: JQuery.Event) => {
            if (e.key === 'F5') {
                // F5
                if (e.shiftKey) {
                    // Shift+F5 normal reload
                    e.preventDefault();
                    window.location.reload();
                } else if (!e.ctrlKey && !e.altKey) {
                    // F5 soft reload
                    e.preventDefault();
                    softRefresh();
                }
            } else if (e.key === 'F6' && e.shiftKey) {
                // Shift+F6 toggle debug mode
                e.preventDefault();
                GeneralUtils.toggleDebug();
            }
        };

        $(document).on('keydown', onkeypress);

        return () => {
            $(document).off('keydown', onkeypress);
        };
    }, []);

    return null;
}
