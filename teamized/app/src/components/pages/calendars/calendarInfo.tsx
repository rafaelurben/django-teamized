import React from 'react';

import { Calendar } from '../../../interfaces/calendar/calendar';
import { Team } from '../../../interfaces/teams/team';
import * as CalendarService from '../../../service/calendars.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import Tables from '../../common/tables';
import IconTooltip from '../../common/tooltips/iconTooltip';
import Tooltip from '../../common/tooltips/tooltip';
import Urlize from '../../common/utils/urlize';

interface Props {
    team: Team;
    selectedCalendar: Calendar | null;
    onCalendarDeleted: () => unknown;
    isAdmin: boolean;
}

export default function CalendarInfo({
    team,
    selectedCalendar,
    onCalendarDeleted,
    isAdmin,
}: Props) {
    const refreshData = useAppdataRefresh();

    const editCalendar = () => {
        CalendarService.editCalendarPopup(team, selectedCalendar!).then(
            (result) => {
                if (result.isConfirmed) refreshData();
            }
        );
    };

    const deleteCalendar = () => {
        CalendarService.deleteCalendarPopup(team, selectedCalendar!).then(
            (result) => {
                if (result.isConfirmed) {
                    onCalendarDeleted();
                    refreshData();
                }
            }
        );
    };

    const subscriptionPopup = async () => {
        await CalendarService.showCalendarSubscriptionPopup(selectedCalendar!);
    };

    if (!selectedCalendar) {
        return (
            <p className="ms-1 mb-0">
                <span className="me-1">
                    Im ausgewählten Team ist noch kein Kalender vorhanden.
                </span>
                {isAdmin ? (
                    <IconTooltip title='Du kannst mit den "Kalender erstellen"-Knopf weiter oben eine neue Liste erstellen.'></IconTooltip>
                ) : (
                    <IconTooltip title="Bitte wende dich an einen Admin dieses Teams, um einen neuen Kalender zu erstellen."></IconTooltip>
                )}
            </p>
        );
    }

    return (
        <Tables.VerticalDataTable
            items={[
                {
                    label: 'Name',
                    value: selectedCalendar.name,
                },
                {
                    label: 'Beschreibung',
                    value: <Urlize text={selectedCalendar.description} />,
                    limitWidth: true,
                },
                {
                    label: 'Farbe',
                    value: (
                        <i
                            style={{ color: selectedCalendar.color }}
                            className="fa-solid fa-circle small"
                        ></i>
                    ),
                },
                {
                    label: 'ID',
                    value: selectedCalendar.id,
                    isDebugId: true,
                },
            ]}
        >
            <Tables.ButtonFooter noTopBorder={true}>
                {isAdmin ? (
                    <>
                        <button
                            className="btn btn-outline-dark"
                            onClick={editCalendar}
                        >
                            Bearbeiten
                        </button>
                        <button
                            className="btn btn-outline-danger"
                            onClick={deleteCalendar}
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
                <button
                    className="btn btn-outline-info"
                    onClick={subscriptionPopup}
                >
                    Abonnieren
                </button>
            </Tables.ButtonFooter>
        </Tables.VerticalDataTable>
    );
}
