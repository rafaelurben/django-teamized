import React, { useEffect, useState } from 'react';
import * as Dashboard from '../../common/dashboard';
import * as Cache from '../../../utils/cache';
import ListView from './listView';
import ListSelector from './listSelector';
import ListInfo from './listInfo';
import { Team } from '../../../interfaces/teams/team';
import * as Todo from '../../../utils/todo';
import { ID } from '../../../interfaces/common';
import { Todolist } from '../../../interfaces/todolist/todolist';

interface Props {
    team: Team;
}

export default function TodoPage({ team }: Props) {
    const [selectedListId, setSelectedListId] = useState<ID | null>(null);

    const todolistMap = Cache.getTeamData(team.id).todolists;
    const loading = Cache.getCurrentTeamData()._state.todolists._initial;

    const isAdmin = team.member!.is_admin;

    useEffect(() => {
        ensureValidListId();

        if (loading) Todo.getToDoLists(team.id); // will re-render page
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
        Cache.getCurrentTeamData().todolists[
            selectedListId
        ]) as Todolist | null;

    return (
        <Dashboard.Page
            title="To-do-Listen"
            subtitle="Behalte den Überblick über die Aufgaben deines Teams"
            loading={loading}
        >
            <Dashboard.Column sizes={{ lg: 4 }}>
                <Dashboard.Tile
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
                </Dashboard.Tile>
                <Dashboard.Tile
                    title="Listendetails"
                    help="Sieh dir Infos zur oben ausgewählten Liste an."
                >
                    <ListInfo
                        team={team}
                        selectedList={selectedList}
                        onListDeleted={() => setSelectedListId(null)}
                        isAdmin={isAdmin}
                    />
                </Dashboard.Tile>
            </Dashboard.Column>
            <Dashboard.Column sizes={{ lg: 8 }}>
                <Dashboard.Tile
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
                </Dashboard.Tile>
            </Dashboard.Column>
        </Dashboard.Page>
    );
}