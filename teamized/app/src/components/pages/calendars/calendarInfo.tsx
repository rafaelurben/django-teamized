import React from 'react';

import * as Calendars from '../../../utils/calendars';
import * as Navigation from '../../../utils/navigation';
import IconTooltip from '../../common/tooltips/iconTooltip';
import Tooltip from '../../common/tooltips/tooltip';
import * as Dashboard from '../../common/dashboard';
import { Team } from '../../../interfaces/teams/team';
import { Calendar } from '../../../interfaces/calendar/calendar';

interface Props {
    team: Team;
    selectedCalendar: Calendar | null;
    onCalendarDeleted: () => any;
    isAdmin: boolean;
}

export default function CalendarInfo({
    team,
    selectedCalendar,
    onCalendarDeleted,
    isAdmin,
}: Props) {
    const editCalendar = () => {
        Calendars.editCalendarPopup(team, selectedCalendar!).then(
            Navigation.renderPage
        );
    };

    const deleteCalendar = () => {
        Calendars.deleteCalendarPopup(team, selectedCalendar!).then(() => {
            onCalendarDeleted();
        });
    };

    const subscriptionPopup = async () => {
        await Calendars.showCalendarSubscriptionPopup(selectedCalendar!);
    };

    if (!selectedCalendar) {
        return (
            <p className="ms-1 mb-0">
                Im ausgewählten Team ist noch kein Kalender vorhanden.{' '}
                {isAdmin ? (
                    <IconTooltip
                        key="admin"
                        title='Du kannst mit den "Kalender erstellen"-Knopf weiter oben eine neue Liste erstellen.'
                    ></IconTooltip>
                ) : (
                    <IconTooltip
                        key="noadmin"
                        title="Bitte wende dich an einen Admin dieses Teams, um einen neuen Kalender zu erstellen."
                    ></IconTooltip>
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
