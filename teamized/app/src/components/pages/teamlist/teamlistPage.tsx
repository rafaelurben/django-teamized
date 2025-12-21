import React from 'react';

import { CardContent } from '@/shadcn/components/ui/card';

import { Team } from '../../../interfaces/teams/team';
import * as TeamsService from '../../../service/teams.service';
import { waitingAlert } from '../../../utils/alerts';
import {
    useNavigationState,
    useNavigationStateDispatch,
} from '../../../utils/navigation/navigationProvider';
import Dashboard from '../../common/dashboard';
import TeamTable from './teamTable';

interface Props {
    teams: Team[];
}

export default function TeamlistPage({ teams }: Readonly<Props>) {
    const { selectedTeamId } = useNavigationState();
    const updateNavigationState = useNavigationStateDispatch();

    const joinTeam = () => {
        const token = (
            document.getElementById('invite-token') as HTMLInputElement
        ).value;

        waitingAlert('Einladung wird geprüft...');
        TeamsService.checkInvitePopup(token)
            .then((result) => {
                if (result.isConfirmed) {
                    updateNavigationState({
                        update: {
                            selectedPage: 'team',
                            selectedTeamId: result.value!.id,
                        },
                        remove: ['invite'],
                    });
                }
            })
            .catch(() => {
                updateNavigationState({ remove: ['invite'] });
            });
    };

    const createTeam = () => {
        TeamsService.createTeamPopup().then((result) => {
            if (result.isConfirmed) {
                updateNavigationState({
                    update: {
                        selectedPage: 'team',
                        selectedTeamId: result.value!.id,
                    },
                });
            }
        });
    };

    const prefilledInviteToken =
        new URL(location.href).searchParams.get('invite') ?? '';

    return (
        <Dashboard.Page>
            <Dashboard.Column>
                <Dashboard.CustomCard title="Teamübersicht">
                    <TeamTable teams={teams} selectedTeamId={selectedTeamId} />
                </Dashboard.CustomCard>

                <Dashboard.CustomCard title="Team erstellen oder beitreten">
                    <CardContent>
                        <p className="mx-1">
                            Klicke auf &quot;Team erstellen&quot;, um ein neues
                            Team zu erstellen oder gib einen Einladungstoken ein
                            und klicke auf &quot;Team beitreten&quot;, um einem
                            Team beizutreten.
                        </p>
                        <div className="input-group my-2 px-1">
                            <button
                                type="button"
                                className="btn btn-outline-success border-1"
                                onClick={createTeam}
                            >
                                Team erstellen
                            </button>
                            <input
                                id="invite-token"
                                type="text"
                                className="form-control"
                                placeholder="Token der Einladung"
                                defaultValue={prefilledInviteToken}
                            />
                            <button
                                type="button"
                                className="btn btn-outline-primary border-1"
                                onClick={joinTeam}
                            >
                                Team beitreten
                            </button>
                        </div>
                    </CardContent>
                </Dashboard.CustomCard>
            </Dashboard.Column>
        </Dashboard.Page>
    );
}
