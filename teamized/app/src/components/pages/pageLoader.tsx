/**
 *  This component is used to render the pages.
 */

import { TriangleAlertIcon } from 'lucide-react';
import React, { Suspense } from 'react';

import { Spinner } from '@/shadcn/components/ui/spinner';
import AppHeader from '@/teamized/components/layout/AppHeader';
import { PAGE_CONFIGS } from '@/teamized/components/pages/pageConfigs';
import {
    useCurrentTeamData,
    useNavigationState,
} from '@/teamized/utils/navigation/navigationProvider';

export function PageLoader() {
    const { selectedPage } = useNavigationState();
    const teamData = useCurrentTeamData();

    const pageData = PAGE_CONFIGS[selectedPage];

    const pageName = pageData?.title || '404 Nicht gefunden';
    if (teamData?.team) {
        document.title = `${pageName} - ${teamData.team.name} | Teamized App`;
    } else {
        document.title = `${pageName} | Teamized App`;
    }

    const getPage = () => {
        if (!pageData) {
            return (
                <div className="tw:w-full tw:h-full tw:flex tw:flex-col tw:items-center tw:justify-center tw:text-center tw:p-4">
                    <TriangleAlertIcon className="tw:size-12 tw:text-destructive tw:mb-4" />
                    <h3 className="tw:text-xl tw:font-bold tw:mb-2">
                        404 Nicht gefunden
                    </h3>
                    <p className="tw:text-muted-foreground">
                        Diese Seite wurde leider nicht gefunden. Vielleicht
                        findest du die gesuchte Seite ja links in der
                        Navigation?
                    </p>
                </div>
            );
        }

        if (!teamData && !pageData.canHandleNoTeamData) {
            return (
                <div className="tw:w-full tw:h-full tw:flex tw:flex-col tw:items-center tw:justify-center">
                    <Spinner className="tw:size-12 tw:mb-3" />
                    <p>Daten werden abgerufen...</p>
                </div>
            );
        }

        if (selectedPage.startsWith('club') && teamData?.team?.club === null) {
            return (
                <div className="tw:w-full tw:h-full tw:flex tw:flex-col tw:items-center tw:justify-center tw:text-center tw:p-4">
                    <TriangleAlertIcon className="tw:size-12 tw:text-destructive tw:mb-4" />
                    <p>
                        Die Vereinsfunktionen sind in diesem Team noch nicht
                        aktiviert! Bitte wähle ein anderes Team oder eine andere
                        Seite.
                    </p>
                </div>
            );
        }

        return <pageData.component />;
    };

    return (
        <>
            <AppHeader />
            <Suspense
                fallback={
                    <div className="tw:w-full tw:h-full tw:flex tw:flex-col tw:items-center tw:justify-center">
                        <Spinner className="tw:size-12 tw:mb-3" />
                        <p>Seite wird geladen...</p>
                    </div>
                }
            >
                {getPage()}
            </Suspense>
        </>
    );
}
