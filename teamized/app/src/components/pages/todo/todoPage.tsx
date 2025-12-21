import React, { useEffect, useState } from 'react';

import { ID } from '../../../interfaces/common';
import { Todolist } from '../../../interfaces/todolist/todolist';
import * as Todo from '../../../service/todo.service';
import { useAppdataRefresh } from '../../../utils/appdataProvider';
import { useCurrentTeamData } from '../../../utils/navigation/navigationProvider';
import Dashboard from '../../common/dashboard';
import ListInfo from './listInfo';
import ListSelector from './listSelector';
import ListView from './listView';

export default function TodoPage() {
    const refreshData = useAppdataRefresh();

    const teamData = useCurrentTeamData();
    const team = teamData?.team;

    const [selectedListId, setSelectedListId] = useState<ID | null>(null);

    const todolistMap = teamData.todolists;
    const loading = teamData._state.todolists._initial;

    const isAdmin = team.member!.is_admin;

    useEffect(() => {
        ensureValidListId();

        if (loading) {
            Todo.getToDoLists(team.id).then(refreshData);
        }
    });

    const ensureValidListId = () => {
        const isValid =
            selectedListId && Object.hasOwn(todolistMap, selectedListId);
        const listIds = Object.keys(todolistMap);
        const hasList = listIds.length > 0;

        if (!isValid && hasList) {
            // If the current todolist is invalid and there are todolistMap, select the first one.
            setSelectedListId(listIds[0]);
        } else if (!isValid && selectedListId !== null) {
            // If the current todolist is set but there are no todolistMap, select null.
            setSelectedListId(null);
        }
    };

    const selectedList = (selectedListId &&
        teamData.todolists[selectedListId]) as Todolist | null;

    return (
        <Dashboard.Page loading={loading}>
            <Dashboard.Column sizes={{ lg: 4 }}>
                <Dashboard.CustomCard
                    title="Listenübersicht"
                    help="Wechsle zwischen den To-do-Listen deines Teams oder erstelle eine neue."
                >
                    <ListSelector
                        team={team}
                        lists={Object.values(todolistMap)}
                        selectedList={selectedList}
                        onListSelect={setSelectedListId}
                        isAdmin={isAdmin}
                    />
                </Dashboard.CustomCard>
                <Dashboard.CustomCard
                    title="Listendetails"
                    help="Sieh dir Infos zur oben ausgewählten Liste an."
                >
                    <ListInfo
                        team={team}
                        selectedList={selectedList}
                        onListDeleted={() => setSelectedListId(null)}
                        isAdmin={isAdmin}
                    />
                </Dashboard.CustomCard>
            </Dashboard.Column>
            <Dashboard.Column sizes={{ lg: 8 }}>
                <Dashboard.CustomCard
                    title={
                        selectedList
                            ? 'To-do-Liste: ' + selectedList.name
                            : 'To-do-Liste'
                    }
                >
                    <ListView
                        team={team}
                        selectedList={selectedList}
                        isAdmin={isAdmin}
                    />
                </Dashboard.CustomCard>
            </Dashboard.Column>
        </Dashboard.Page>
    );
}
