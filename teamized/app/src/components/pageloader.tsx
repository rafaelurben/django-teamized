/**
 *  This component is used to render the pages.
 */

import { TriangleAlert } from 'lucide-react';
import React, { lazy, Suspense } from 'react';

import { Spinner } from '@/shadcn/components/ui/spinner';
import AppHeader from '@/teamized/components/layout/AppHeader';
import {
    calculateBreadcrumbs,
    PAGE_CONFIGS,
} from '@/teamized/components/layout/pages';

import * as TeamsService from '../service/teams.service';
import {
    useCurrentTeamData,
    useNavigationState,
} from '../utils/navigation/navigationProvider';

const CalendarsPage = lazy(() => import('./pages/calendars/calendarsPage'));
const ClubPage = lazy(() => import('./pages/club/clubPage'));
const ClubAttendancePage = lazy(
    () => import('./pages/club_attendance/clubAttendancePage')
);
const HomePage = lazy(() => import('./pages/home/homePage'));
const TeamPage = lazy(() => import('./pages/team/teamPage'));
const TeamlistPage = lazy(() => import('./pages/teamlist/teamlistPage'));
const TodoPage = lazy(() => import('./pages/todo/todoPage'));
const WorkingtimePage = lazy(
    () => import('./pages/workingtime/workingtimePage')
);

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
                    <TriangleAlert className="tw:size-12 tw:text-destructive tw:mb-4" />
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

        if (!teamData && !pageData.canHandleNoAppData) {
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
                    <TriangleAlert className="tw:size-12 tw:text-destructive tw:mb-4" />
                    <p>
                        Die Vereinsfunktionen sind in diesem Team noch nicht
                        aktiviert! Bitte wähle ein anderes Team oder eine andere
                        Seite.
                    </p>
                </div>
            );
        }

        switch (selectedPage) {
            case 'home':
                return <HomePage />;
            case 'teamlist':
                return <TeamlistPage teams={TeamsService.getTeamsList()} />;
            case 'team':
                return <TeamPage />;
            case 'workingtime':
                return <WorkingtimePage />;
            case 'calendars':
                return <CalendarsPage />;
            case 'todo':
                return <TodoPage />;
            case 'club':
                return <ClubPage />;
            case 'club_attendance':
                return <ClubAttendancePage />;
            default:
                return (
                    <div className="tw:w-full tw:h-full tw:flex tw:flex-col tw:items-center tw:justify-center tw:text-center tw:p-4">
                        <TriangleAlert className="tw:size-12 tw:text-destructive tw:mb-4" />
                        <h3 className="tw:text-xl tw:font-bold tw:mb-2">
                            UUPS! Seite nicht gefunden.
                        </h3>
                        <p className="tw:text-muted-foreground">
                            Etwas ist schiefgelaufen. Die angeforderte Seite
                            konnte nicht geladen werden.
                        </p>
                    </div>
                );
        }
    };

    return (
        <>
            <AppHeader breadcrumbs={calculateBreadcrumbs(selectedPage)} />
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
