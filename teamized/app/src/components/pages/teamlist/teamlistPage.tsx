import React from 'react';

import { Button } from '@/shadcn/components/ui/button';
import { ButtonGroup } from '@/shadcn/components/ui/button-group';
import { Input } from '@/shadcn/components/ui/input';
import Dashboard from '@/teamized/components/common/dashboard';
import * as TeamsService from '@/teamized/service/teams.service';
import { waitingAlert } from '@/teamized/utils/alerts';
import { useAppdata } from '@/teamized/utils/appdataProvider';
import {
    useNavigationState,
    useNavigationStateDispatch,
} from '@/teamized/utils/navigation/navigationProvider';

import TeamTable from './teamTable';

export default function TeamlistPage() {
    const { selectedTeamId } = useNavigationState();
    const updateNavigationState = useNavigationStateDispatch();

    const appdata = useAppdata();
    const teams = Object.values(appdata.teamCache).map((t) => t.team);
    const loading = teams.length === 0;

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
                <Dashboard.CustomCard title="Teamübersicht" wrapInCardContent>
                    <TeamTable
                        teams={teams}
                        selectedTeamId={selectedTeamId}
                        loading={loading}
                    />
                </Dashboard.CustomCard>

                <Dashboard.CustomCard
                    title="Team erstellen oder beitreten"
                    wrapInCardContent
                >
                    <p className="tw:mb-4">
                        Klicke auf &quot;Team erstellen&quot;, um ein neues Team
                        zu erstellen oder gib einen Einladungstoken ein und
                        klicke auf &quot;Team beitreten&quot;, um einem Team
                        beizutreten.
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
                </Dashboard.CustomCard>
            </Dashboard.Column>
        </Dashboard.Page>
    );
}
