import React from 'react';

import { Calendar } from '../../../interfaces/calendar/calendar';
import { Team } from '../../../interfaces/teams/team';
import * as CalendarService from '../../../service/calendars.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import Dashboard from '../../common/dashboard';
import IconTooltip from '../../common/tooltips/iconTooltip';
import Tooltip from '../../common/tooltips/tooltip';

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
                Im ausgewählten Team ist noch kein Kalender vorhanden.{' '}
                {isAdmin ? (
                    <IconTooltip title='Du kannst mit den "Kalender erstellen"-Knopf weiter oben eine neue Liste erstellen.'></IconTooltip>
                ) : (
                    <IconTooltip title="Bitte wende dich an einen Admin dieses Teams, um einen neuen Kalender zu erstellen."></IconTooltip>
                )}
            </p>
        );
    }

    return (
        <Dashboard.Table>
            <tbody>
                <tr>
                    <th>Name:</th>
                    <td>{selectedCalendar.name}</td>
                </tr>
                <tr>
                    <th style={{ width: '1px' }} className="pe-3">
                        Beschreibung:
                    </th>
                    <td style={{ whiteSpace: 'pre-line' }}>
                        {selectedCalendar.description}
                    </td>
                </tr>
                <tr>
                    <th>Farbe:</th>
                    <td>
                        <i
                            style={{ color: selectedCalendar.color }}
                            className="fas fa-circle small"
                        ></i>
                    </td>
                </tr>
                <tr className="debug-only">
                    <th>ID:</th>
                    <td>{selectedCalendar.id}</td>
                </tr>
            </tbody>
            <Dashboard.TableButtonFooter noTopBorder={true}>
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
            </Dashboard.TableButtonFooter>
        </Dashboard.Table>
    );
}
