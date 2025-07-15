import React from 'react';

import { ClubAttendanceEvent } from '../../../interfaces/club/clubAttendanceEvent';
import { Team } from '../../../interfaces/teams/team';
import * as ClubAttendanceService from '../../../service/clubAttendance.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import { getDateTimeString } from '../../../utils/datetime';
import Dashboard from '../../common/dashboard';
import Tooltip from '../../common/tooltips/tooltip';
import Urlize from '../../common/utils/urlize';

interface Props {
    team: Team;
    selectedEvent: ClubAttendanceEvent | null;
    isAdmin: boolean;
}

export default function EventInfo({ team, selectedEvent, isAdmin }: Props) {
    const refreshData = useAppdataRefresh();

    const editEvent = () => {
        ClubAttendanceService.editAttendanceEventPopup(
            team,
            selectedEvent!
        ).then((result) => {
            if (result.isConfirmed) refreshData();
        });
    };

    const deleteEvent = () => {
        ClubAttendanceService.deleteAttendanceEventPopup(
            team,
            selectedEvent!
        ).then((result) => {
            if (result.isConfirmed) {
                refreshData();
            }
        });
    };

    if (!selectedEvent) {
        return <p className="ms-1 mb-0">Kein Ereignis ausgewählt.</p>;
    }

    return (
        <Dashboard.Table vertical={true}>
            <tbody>
                <tr>
                    <th>Name:</th>
                    <td>{selectedEvent.title}</td>
                </tr>
                <tr>
                    <th style={{ width: '1px' }} className="pe-3">
                        Beschreibung:
                    </th>
                    <td>
                        <Urlize text={selectedEvent.description} />
                    </td>
                </tr>
                <tr>
                    <th>Start:</th>
                    <td>
                        {getDateTimeString(new Date(selectedEvent.dt_start))}
                    </td>
                </tr>
                <tr>
                    <th>Ende:</th>
                    <td>{getDateTimeString(new Date(selectedEvent.dt_end))}</td>
                </tr>
                <tr>
                    <th>Punkte:</th>
                    <td>{selectedEvent.points}</td>
                </tr>
                <tr>
                    <th>Standardmäßig teilnehmend:</th>
                    <td>
                        {selectedEvent.participating_by_default ? 'Ja' : 'Nein'}
                    </td>
                </tr>
                <tr>
                    <th>Gesperrt:</th>
                    <td>{selectedEvent.locked ? 'Ja' : 'Nein'}</td>
                </tr>
                <tr className="debug-only">
                    <th>ID:</th>
                    <td>{selectedEvent.id}</td>
                </tr>
            </tbody>
            <Dashboard.TableButtonFooter noTopBorder={true}>
                {isAdmin ? (
                    <>
                        <button
                            className="btn btn-outline-dark me-2"
                            onClick={editEvent}
                        >
                            Bearbeiten
                        </button>
                        <button
                            className="btn btn-outline-danger"
                            onClick={deleteEvent}
                        >
                            Löschen
                        </button>
                    </>
                ) : (
                    <Tooltip title="Diese Aktionen stehen nur Admins zur Verfügung">
                        <button className="btn btn-outline-dark disabled">
                            Bearbeiten/Löschen
                        </button>
                    </Tooltip>
                )}
            </Dashboard.TableButtonFooter>
        </Dashboard.Table>
    );
}
