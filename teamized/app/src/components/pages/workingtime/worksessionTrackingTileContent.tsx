import React, { useEffect, useReducer, useRef, useState } from 'react';
import * as WorkingTime from '../../../utils/workingtime';
import { ms2HoursMinutesSeconds } from '../../../utils/datetime';
import { Worksession } from '../../../interfaces/workingtime/worksession';
import { Team } from '../../../interfaces/teams/team';

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
    onFinishedSessionAdded: () => unknown;
}

export default function WorksessionTrackingTileContent({
    team,
    onFinishedSessionAdded,
}: Props) {
    const currentWorksession = window.appdata.current_worksession;
    const [, forceComponentUpdate] = useReducer((x) => x + 1, 0);

    const [timeDisplay, setTimeDisplay] = useState(
        getTimeDisplay(currentWorksession)
    );

    const clockRefreshIntervalID = useRef<ReturnType<typeof setInterval>>();
    const currentSessionRefreshIntervalId =
        useRef<ReturnType<typeof setInterval>>();

    const startInProgress = useRef(false);
    const stopInProgress = useRef(false);

    const startSession = async () => {
        if (!startInProgress.current) {
            startInProgress.current = true;
            await WorkingTime.startTrackingSession(team.id).then(() => {
                forceComponentUpdate();
            });
            startInProgress.current = false;
        }
    };

    const stopSession = async () => {
        if (!stopInProgress.current) {
            stopInProgress.current = true;
            await WorkingTime.stopTrackingSession().then(() => {
                forceComponentUpdate();
                onFinishedSessionAdded();
            });
            stopInProgress.current = false;
        }
    };

    const renameCurrentSession = async () => {
        await WorkingTime.renameWorkSessionPopup(team, currentWorksession!);
        forceComponentUpdate();
    };

    const updateTimeDisplay = () => {
        const newDisplay = getTimeDisplay(window.appdata.current_worksession);
        setTimeDisplay(newDisplay);
    };

    const updateCurrentSession = async () => {
        const before = window.appdata.current_worksession;
        const after = await WorkingTime.getTrackingSession();
        if (before !== after && (before || after)) {
            forceComponentUpdate();

            if (before && (!after || before.id !== after.id)) {
                WorkingTime.getMyWorkSessionsInTeam(team.id).then(() =>
                    onFinishedSessionAdded()
                );
            }
        }
    };

    useEffect(() => {
        clockRefreshIntervalID.current = setInterval(updateTimeDisplay, 1000);
        currentSessionRefreshIntervalId.current = setInterval(
            updateCurrentSession,
            15000
        );

        updateCurrentSession();

        return () => {
            clearInterval(clockRefreshIntervalID.current);
            clearInterval(currentSessionRefreshIntervalId.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
