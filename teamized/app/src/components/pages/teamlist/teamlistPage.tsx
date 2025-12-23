import React from 'react';

import { Button } from '@/shadcn/components/ui/button';
import { ButtonGroup } from '@/shadcn/components/ui/button-group';
import { CardContent } from '@/shadcn/components/ui/card';
import { Input } from '@/shadcn/components/ui/input';

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
                    <CardContent>
                        <TeamTable
                            teams={teams}
                            selectedTeamId={selectedTeamId}
                        />
                    </CardContent>
                </Dashboard.CustomCard>

                <Dashboard.CustomCard title="Team erstellen oder beitreten">
                    <CardContent>
                        <p className="tw:mb-4">
                            Klicke auf &quot;Team erstellen&quot;, um ein neues
                            Team zu erstellen oder gib einen Einladungstoken ein
                            und klicke auf &quot;Team beitreten&quot;, um einem
                            Team beizutreten.
                        </p>
                        <div className="tw:flex tw:gap-2 tw:flex-wrap">
                            <Button
                                variant="default"
                                onClick={createTeam}
                                className="tw:whitespace-nowrap tw:w-full tw:md:w-auto"
                            >
                                Team erstellen
                            </Button>
                            <ButtonGroup className="tw:flex-1">
                                <Input
                                    id="invite-token"
                                    type="text"
                                    placeholder="Token der Einladung"
                                    defaultValue={prefilledInviteToken}
                                    className="tw:flex-1"
                                />
                                <Button
                                    variant="outline"
                                    onClick={joinTeam}
                                    className="tw:whitespace-nowrap"
                                >
                                    Team beitreten
                                </Button>
                            </ButtonGroup>
                        </div>
                    </CardContent>
                </Dashboard.CustomCard>
            </Dashboard.Column>
        </Dashboard.Page>
    );
}
