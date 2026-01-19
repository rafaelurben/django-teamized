import React, { useEffect, useRef, useState } from 'react';

import { Button } from '@/shadcn/components/ui/button';
import { Team } from '@/teamized/interfaces/teams/team';
import { Worksession } from '@/teamized/interfaces/workingtime/worksession';
import * as WorkingtimeService from '@/teamized/service/workingtime.service';
import {
    useAppdata,
    useAppdataRefresh,
} from '@/teamized/utils/appdataProvider';
import { ms2HoursMinutesSeconds } from '@/teamized/utils/datetime';

function getTimeDisplay(currentWorksession: Worksession | null | undefined) {
    if (currentWorksession) {
        const now = Date.now();
        const start = new Date(currentWorksession.time_start).getTime();
        const timediff = now - start;
        const diff = ms2HoursMinutesSeconds(timediff);
        return `${diff.hours}:${diff.minutes}:${diff.seconds}`;
    } else {
        return '00:00:00';
    }
}

interface Props {
    team: Team;
}

export default function WorksessionTrackingTileContent({
    team,
}: Readonly<Props>) {
    const appdata = useAppdata();
    const refreshData = useAppdataRefresh();

    const currentWorksession = appdata.current_worksession;

    const [timeDisplay, setTimeDisplay] = useState(
        getTimeDisplay(currentWorksession)
    );

    const clockRefreshIntervalID = useRef<ReturnType<typeof setInterval>>(null);
    const currentSessionRefreshIntervalId =
        useRef<ReturnType<typeof setInterval>>(null);

    const startInProgress = useRef(false);
    const stopInProgress = useRef(false);

    const startSession = async () => {
        if (!startInProgress.current) {
            startInProgress.current = true;
            await WorkingtimeService.startTrackingSession(team.id).then(
                refreshData
            );
            startInProgress.current = false;
        }
    };

    const stopSession = async () => {
        if (!stopInProgress.current) {
            stopInProgress.current = true;
            await WorkingtimeService.stopTrackingSession().then(refreshData);
            stopInProgress.current = false;
        }
    };

    const renameCurrentSession = () => {
        WorkingtimeService.renameWorkSessionPopup(
            team,
            currentWorksession!
        ).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    useEffect(() => {
        const updateTimeDisplay = () => {
            const newDisplay = getTimeDisplay(currentWorksession);
            setTimeDisplay(newDisplay);
        };

        const updateCurrentSession = async () => {
            const before = currentWorksession;
            const after = await WorkingtimeService.getTrackingSession();

            if (before && (!after || before.id !== after.id)) {
                WorkingtimeService.getMyWorkSessionsInTeam(team.id).then(
                    refreshData
                );
            } else if (before && after && before.note !== after.note) {
                refreshData();
            }
        };

        clockRefreshIntervalID.current = setInterval(updateTimeDisplay, 1000);
        currentSessionRefreshIntervalId.current = setInterval(
            updateCurrentSession,
            15000
        );

        updateTimeDisplay();

        return () => {
            if (clockRefreshIntervalID.current) {
                clearInterval(clockRefreshIntervalID.current);
            }
            if (currentSessionRefreshIntervalId.current) {
                clearInterval(currentSessionRefreshIntervalId.current);
            }
        };
    }, [currentWorksession, refreshData, team.id]);

    return (
        <>
            <div className="tw:text-center tw:text-4xl tw:font-bold tw:mb-4">
                {timeDisplay}
            </div>

            <div className="tw:flex tw:flex-col tw:gap-2">
                {currentWorksession ? (
                    <>
                        <Button
                            variant="destructive"
                            className="tw:w-full"
                            onClick={stopSession}
                        >
                            Aufzeichnung beenden
                        </Button>
                        <Button
                            variant="outline"
                            className="tw:w-full"
                            onClick={renameCurrentSession}
                        >
                            Aufzeichnung benennen
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="success"
                        className="tw:w-full"
                        onClick={startSession}
                    >
                        Aufzeichnung starten
                    </Button>
                )}
            </div>
        </>
    );
}
