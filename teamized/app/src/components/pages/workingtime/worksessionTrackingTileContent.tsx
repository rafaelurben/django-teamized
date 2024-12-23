import React, { useEffect, useRef, useState } from 'react';

import { Team } from '../../../interfaces/teams/team';
import { Worksession } from '../../../interfaces/workingtime/worksession';
import * as WorkingtimeService from '../../../service/workingtime.service';
import { useAppdata, useAppdataRefresh } from '../../../utils/appdataProvider';
import { ms2HoursMinutesSeconds } from '../../../utils/datetime';

function getTimeDisplay(currentWorksession: Worksession | null | undefined) {
    if (currentWorksession) {
        const now = new Date().getTime();
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

export default function WorksessionTrackingTileContent({ team }: Props) {
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
            <h1 className="text-center">{timeDisplay}</h1>

            <div className="text-center">
                {currentWorksession ? (
                    <div className="row m-2 g-2">
                        <button
                            className="btn btn-danger col-12"
                            onClick={stopSession}
                        >
                            Aufzeichnung beenden
                        </button>
                        <button
                            className="btn btn-outline-dark col-12"
                            onClick={renameCurrentSession}
                        >
                            Aufzeichnung benennen
                        </button>
                    </div>
                ) : (
                    <div className="row m-2">
                        <button
                            className="btn btn-success col-12"
                            onClick={startSession}
                        >
                            Aufzeichnung starten
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
