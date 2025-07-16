import React from 'react';

import { ClubAttendanceEvent } from '../../../interfaces/club/clubAttendanceEvent';
import { Team } from '../../../interfaces/teams/team';
import * as ClubAttendanceService from '../../../service/clubAttendance.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import { getDateTimeString } from '../../../utils/datetime';
import Tables from '../../common/tables';
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
        <Tables.VerticalDataTable
            items={[
                {
                    label: 'Ereignis',
                    value: selectedEvent.title,
                },
                {
                    label: 'Beschreibung',
                    value: <Urlize text={selectedEvent.description} />,
                    limitWidth: true,
                },
                {
                    label: 'Start',
                    value: getDateTimeString(new Date(selectedEvent.dt_start)),
                },
                {
                    label: 'Ende',
                    value: getDateTimeString(new Date(selectedEvent.dt_end)),
                },
                {
                    label: 'Punkte',
                    value: selectedEvent.points,
                },
                {
                    label: 'Standardmässig teilnehmend',
                    value: selectedEvent.participating_by_default
                        ? 'Ja'
                        : 'Nein',
                },
                {
                    label: 'Gesperrt',
                    value: selectedEvent.locked ? 'Ja' : 'Nein',
                },
                {
                    label: 'ID',
                    value: selectedEvent.id,
                    isDebugId: true,
                },
            ]}
        >
            <Tables.ButtonFooter noTopBorder={true}>
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
            </Tables.ButtonFooter>
        </Tables.VerticalDataTable>
    );
}
