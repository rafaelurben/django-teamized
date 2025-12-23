import React, { createContext, useContext, useReducer } from 'react';

import { Appdata } from '@/teamized/interfaces/appdata';

const AppdataContext = createContext<{ version: number; appdata: Appdata }>({
    version: 0,
    appdata: window.appdata,
});
const AppdataRefreshContext = createContext<() => void>(() => {});

interface Props {
    children: React.ReactNode;
}

export function AppdataProvider({ children }: Props) {
    const [appdataVersion, incrementAppdataVersion] = useReducer(
        (x) => x + 1,
        0
    );

    return (
        <AppdataContext.Provider
            value={{ version: appdataVersion, appdata: window.appdata }}
        >
            <AppdataRefreshContext.Provider value={incrementAppdataVersion}>
                {children}
            </AppdataRefreshContext.Provider>
        </AppdataContext.Provider>
    );
}

export function useAppdata() {
    return useContext(AppdataContext).appdata;
}

export function useAppdataRefresh() {
    return useContext(AppdataRefreshContext);
}
