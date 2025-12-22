/**
 * Utils for the club features
 */

import $ from 'jquery';
import React from 'react';

import * as ClubAPI from '../api/club';
import { CacheCategory } from '../interfaces/cache/cacheCategory';
import { Club, ClubRequestDTO } from '../interfaces/club/club';
import { ClubGroup, ClubGroupRequestDTO } from '../interfaces/club/clubGroup';
import {
    ClubMember,
    ClubMemberRequestDTO,
} from '../interfaces/club/clubMember';
import {
    ClubMemberPortfolio,
    ClubMemberPortfolioRequestDTO,
} from '../interfaces/club/clubMemberPortfolio';
import { ID, IDIndexedObjectList } from '../interfaces/common';
import { Team } from '../interfaces/teams/team';
import {
    confirmAlert,
    doubleConfirmAlert,
    fireAlert,
    successAlert,
    Swal,
} from '../utils/alerts';
import * as CacheService from './cache.service';

//// API calls ////

// Club creation

export async function createClub(teamId: ID, club: ClubRequestDTO) {
    return await ClubAPI.createClub(teamId, club).then(async (data) => {
        CacheService.getTeamData(teamId).team.club = data.club;
        return data.club;
    });
}

export async function createClubPopup(team: Team) {
    return await fireAlert<Club>({
        title: 'Verein erstellen',
        html: (
            <>
                <label className="swal2-input-label" htmlFor="swal-input-name">
                    Name:
                </label>
                <input
                    type="text"
                    id="swal-input-name"
                    className="swal2-input"
                    placeholder="Dein Verein"
                />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-description"
                >
                    Beschreibung:
                </label>
                <textarea
                    id="swal-input-description"
                    className="swal2-textarea"
                    placeholder="Infos über deinen Verein"
                />
                <label className="swal2-input-label" htmlFor="swal-input-slug">
                    Slug:
                </label>
                <input
                    type="text"
                    id="swal-input-slug"
                    className="swal2-input"
                    placeholder="dein-verein"
                />
            </>
        ),
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Erstellen',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const name = $('#swal-input-name').val() as string;
            const description = $('#swal-input-description').val() as string;
            const slug = $('#swal-input-slug').val() as string;

            if (!name || !description || !slug) {
                Swal.showValidationMessage('Bitte fülle alle Felder aus!');
                return false;
            }
            if (!slug.match(/^[0-9a-z\-_]+$/)) {
                Swal.showValidationMessage(
                    'Der Slug darf nur aus Kleinbuchstaben, Zahlen und Bindestrichen bestehen!'
                );
                return false;
            }

            Swal.showLoading();
            return await createClub(team.id, { name, slug, description });
        },
    });
}

// Club edit

export async function editClub(teamId: ID, club: Partial<ClubRequestDTO>) {
    return await ClubAPI.updateClub(teamId, club).then(async (data) => {
        CacheService.getTeamData(teamId).team.club = data.club;
        return data.club;
    });
}

export async function editClubPopup(team: Team) {
    return await fireAlert<Club>({
        title: 'Verein bearbeiten',
        html: (
            <>
                <p>Verein: {team.club!.name}</p>
                <hr />
                <label className="swal2-input-label" htmlFor="swal-input-name">
                    Name:
                </label>
                <input
                    type="text"
                    id="swal-input-name"
                    className="swal2-input"
                    placeholder={team.club!.name}
                    defaultValue={team.club!.name}
                />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-description"
                >
                    Beschreibung:
                </label>
                <textarea
                    id="swal-input-description"
                    className="swal2-textarea"
                    placeholder={team.club!.description ?? ''}
                    defaultValue={team.club!.description ?? ''}
                />
            </>
        ),
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Aktualisieren',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const name = $('#swal-input-name').val() as string;
            const description = $('#swal-input-description').val() as string;

            if (!name || !description) {
                Swal.showValidationMessage('Bitte fülle alle Felder aus!');
                return false;
            }

            Swal.showLoading();
            return await editClub(team.id, { name, description });
        },
    });
}

// Club delete

export async function deleteClub(teamId: ID) {
    return await ClubAPI.deleteClub(teamId).then(async () => {
        const teamData = CacheService.getTeamData(teamId);
        teamData.team.club = null;
        teamData.club_members = {};
    });
}

export async function deleteClubPopup(team: Team) {
    return await doubleConfirmAlert(
        <>
            Willst du den Verein <b>{team.club!.name}</b> wirklich löschen und
            somit den Vereinsmodus im Team <b>{team.name}</b> deaktivieren?
        </>,
        async () => await deleteClub(team.id)
    );
}

// Member list

export async function getClubMembers(teamId: ID) {
    const members = await CacheService.refreshTeamCacheCategory<ClubMember>(
        teamId,
        CacheCategory.CLUB_MEMBERS
    );
    CacheService.getTeamData(teamId).team.club!.membercount = members.length;
    return members;
}

// Member creation

export async function createClubMember(
    teamId: ID,
    member: ClubMemberRequestDTO
) {
    return await ClubAPI.createClubMember(teamId, member).then(async (data) => {
        const teamData = CacheService.getTeamData(teamId);
        teamData.club_members[data.member.id] = data.member;
        teamData.team.club!.membercount += 1;
        return data.member;
    });
}

export async function createClubMemberPopup(team: Team) {
    return await fireAlert<ClubMember>({
        title: 'Vereinsmitglied hinzufügen',
        html: (
            <>
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-first_name"
                >
                    Vorname:
                </label>
                <input
                    type="text"
                    id="swal-input-first_name"
                    className="swal2-input"
                    placeholder="Max"
                />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-last_name"
                >
                    Nachname:
                </label>
                <input
                    type="text"
                    id="swal-input-last_name"
                    className="swal2-input"
                    placeholder="Mustermann"
                />
                <label className="swal2-input-label" htmlFor="swal-input-email">
                    E-Mail:
                </label>
                <input
                    type="email"
                    id="swal-input-email"
                    className="swal2-input"
                    placeholder="max.mustermann@example.com"
                />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-birth_date"
                >
                    Geburtsdatum:
                </label>
                <input
                    type="date"
                    id="swal-input-birth_date"
                    className="swal2-input"
                />
            </>
        ),
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Hinzufügen',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const first_name = $('#swal-input-first_name').val() as string;
            const last_name = $('#swal-input-last_name').val() as string;
            const email = $('#swal-input-email').val() as string;
            const birth_date = $('#swal-input-birth_date').val() as string;

            if (!first_name || !last_name || !email) {
                Swal.showValidationMessage(
                    'Namen und E-Mail-Adresse sind Pflichtfelder!'
                );
                return false;
            }

            Swal.showLoading();
            return await createClubMember(team.id, {
                first_name,
                last_name,
                email,
                birth_date,
            });
        },
    });
}

// Member edit

export async function editClubMember(
    teamId: ID,
    memberId: ID,
    member: Partial<ClubMemberRequestDTO>
) {
    return await ClubAPI.updateClubMember(teamId, memberId, member).then(
        (data) => {
            CacheService.getTeamData(teamId).club_members[memberId] =
                data.member;
            return data.member;
        }
    );
}

export async function editClubMemberPopup(team: Team, member: ClubMember) {
    return await fireAlert<ClubMember>({
        title: 'Vereinsmitglied bearbeiten',
        html: (
            <>
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-first_name"
                >
                    Vorname:
                </label>
                <input
                    type="text"
                    id="swal-input-first_name"
                    className="swal2-input"
                    placeholder={member.first_name}
                    defaultValue={member.first_name}
                />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-last_name"
                >
                    Nachname:
                </label>
                <input
                    type="text"
                    id="swal-input-last_name"
                    className="swal2-input"
                    placeholder={member.last_name}
                    defaultValue={member.last_name}
                />
                <label className="swal2-input-label" htmlFor="swal-input-email">
                    E-Mail:
                </label>
                <input
                    type="email"
                    id="swal-input-email"
                    className="swal2-input"
                    placeholder={member.email}
                    defaultValue={member.email}
                />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-birth_date"
                >
                    Geburtsdatum:
                </label>
                <input
                    type="date"
                    id="swal-input-birth_date"
                    className="swal2-input"
                    defaultValue={member.birth_date}
                />
            </>
        ),
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Aktualisieren',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const first_name = $('#swal-input-first_name').val() as string;
            const last_name = $('#swal-input-last_name').val() as string;
            const email = $('#swal-input-email').val() as string;
            const birth_date = $('#swal-input-birth_date').val() as string;

            if (!first_name || !last_name || !email) {
                Swal.showValidationMessage(
                    'Namen und E-Mail-Adresse sind Pflichtfelder!'
                );
                return false;
            }

            Swal.showLoading();
            return await editClubMember(team.id, member.id, {
                first_name,
                last_name,
                email,
                birth_date,
            });
        },
    });
}

// Member deletion

export async function deleteClubMember(teamId: ID, memberId: ID) {
    return await ClubAPI.deleteClubMember(teamId, memberId).then(async () => {
        const teamData = CacheService.getTeamData(teamId);
        delete teamData.club_members[memberId];
        teamData.team.club!.membercount -= 1;

        // Remove member from all groups
        for (const group of Object.values(
            teamData.club_groups as IDIndexedObjectList<ClubGroup>
        )) {
            if (group.memberids.includes(memberId)) {
                teamData.club_groups[group.id].memberids.splice(
                    teamData.club_groups[group.id].memberids.indexOf(memberId),
                    1
                );
            }
        }
    });
}

export async function deleteClubMemberPopup(team: Team, member: ClubMember) {
    return await doubleConfirmAlert(
        <>
            Willst du das Vereinsmitglied{' '}
            <b>
                {member.first_name} {member.last_name}
            </b>{' '}
            im Verein <b>{team.club!.name}</b> wirklich löschen? Dabei werden
            auch alle zugehörigen Daten wie Portfolios und
            Gruppenzugehörigkeiten gelöscht!
        </>,
        async () => await deleteClubMember(team.id, member.id)
    );
}

// Member portfolio

export async function getClubMemberPortfolio(teamId: ID, memberId: ID) {
    return await ClubAPI.getClubMemberPortfolio(teamId, memberId).then(
        (data) => {
            return data.portfolio;
        }
    );
}

export async function editClubMemberPortfolio(
    teamId: ID,
    memberId: ID,
    portfolio: Partial<ClubMemberPortfolioRequestDTO>
) {
    return await ClubAPI.updateClubMemberPortfolio(
        teamId,
        memberId,
        portfolio
    ).then((data) => {
        return data.portfolio;
    });
}

export async function editClubMemberPortfolioPopup(
    team: Team,
    member: ClubMember
) {
    // Show a small loading alert while we fetch the portfolio
    fireAlert({
        title: `${member.first_name} ${member.last_name}: Portfolio bearbeiten`,
        text: 'Lade Portfolio...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        showCancelButton: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });

    const portfolio = await getClubMemberPortfolio(team.id, member.id);

    return await fireAlert<ClubMemberPortfolio>({
        title: `${member.first_name} ${member.last_name}: Portfolio bearbeiten`,
        html: (
            <>
                <label
                    className="swal2-checkbox d-flex"
                    htmlFor="swal-input-visible"
                >
                    <input
                        type="checkbox"
                        id="swal-input-visible"
                        defaultChecked={portfolio.visible}
                    />
                    <span>Portfolio sichtbar?</span>
                </label>

                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-image1_url"
                >
                    Bild 1:
                </label>
                <input
                    type="text"
                    id="swal-input-image1_url"
                    className="swal2-input"
                    placeholder="https://example.com/image1.jpg"
                    defaultValue={portfolio.image1_url ?? ''}
                />

                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-image2_url"
                >
                    Bild 2:
                </label>
                <input
                    type="text"
                    id="swal-input-image2_url"
                    className="swal2-input"
                    placeholder="https://example.com/image2.jpg"
                    defaultValue={portfolio.image2_url ?? ''}
                />

                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-member_since"
                >
                    Mitglied seit:
                </label>
                <input
                    type="number"
                    id="swal-input-member_since"
                    className="swal2-input"
                    placeholder="1994"
                    defaultValue={portfolio.member_since ?? ''}
                />

                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-hobby_since"
                >
                    Hobby seit:
                </label>
                <input
                    type="number"
                    id="swal-input-hobby_since"
                    className="swal2-input"
                    placeholder="1994"
                    defaultValue={portfolio.hobby_since ?? ''}
                />

                <label className="swal2-input-label" htmlFor="swal-input-role">
                    Rolle:
                </label>
                <input
                    type="text"
                    id="swal-input-role"
                    className="swal2-input"
                    placeholder="Vorstand"
                    defaultValue={portfolio.role ?? ''}
                />

                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-profession"
                >
                    Beruf:
                </label>
                <input
                    type="text"
                    id="swal-input-profession"
                    className="swal2-input"
                    placeholder="Softwareentwickler"
                    defaultValue={portfolio.profession ?? ''}
                />

                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-hobbies"
                >
                    Hobbies:
                </label>
                <textarea
                    id="swal-input-hobbies"
                    className="swal2-textarea"
                    defaultValue={portfolio.hobbies ?? ''}
                />

                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-highlights"
                >
                    Highlights:
                </label>
                <textarea
                    id="swal-input-highlights"
                    className="swal2-textarea"
                    defaultValue={portfolio.highlights ?? ''}
                />

                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-biography"
                >
                    Biografie:
                </label>
                <textarea
                    id="swal-input-biography"
                    className="swal2-textarea"
                    defaultValue={portfolio.biography ?? ''}
                />

                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-contact_email"
                >
                    Kontakt-E-Mail:
                </label>
                <input
                    type="email"
                    id="swal-input-contact_email"
                    className="swal2-input"
                    placeholder="example@tpto.ch"
                    defaultValue={portfolio.contact_email ?? ''}
                />
            </>
        ),
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Aktualisieren',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const visible = $('#swal-input-visible').prop('checked') as boolean;
            const image1_url = $('#swal-input-image1_url').val() as string;
            const image2_url = $('#swal-input-image2_url').val() as string;
            const member_since = $('#swal-input-member_since').val() as number;
            const hobby_since = $('#swal-input-hobby_since').val() as number;
            const role = $('#swal-input-role').val() as string;
            const profession = $('#swal-input-profession').val() as string;
            const hobbies = $('#swal-input-hobbies').val() as string;
            const highlights = $('#swal-input-highlights').val() as string;
            const biography = $('#swal-input-biography').val() as string;
            const contact_email = $(
                '#swal-input-contact_email'
            ).val() as string;

            Swal.showLoading();
            return await editClubMemberPortfolio(team.id, member.id, {
                visible,
                image1_url,
                image2_url,
                member_since,
                hobby_since,
                role,
                profession,
                hobbies,
                highlights,
                biography,
                contact_email,
            });
        },
    });
}

// Member magic link

export async function createClubMemberMagicLink(teamId: ID, memberId: ID) {
    return await ClubAPI.createClubMemberMagicLink(teamId, memberId).then(
        async (data) => {
            return data.url;
        }
    );
}

// Group list

export async function getClubGroups(teamId: ID) {
    return await CacheService.refreshTeamCacheCategory<ClubGroup>(
        teamId,
        CacheCategory.CLUB_GROUPS
    );
}

// Group creation

export async function createClubGroup(teamId: ID, group: ClubGroupRequestDTO) {
    return await ClubAPI.createClubGroup(teamId, group).then(async (data) => {
        const teamData = CacheService.getTeamData(teamId);
        teamData.club_groups[data.group.id] = data.group;
        return data.group;
    });
}

export async function createClubGroupPopup(team: Team) {
    return await fireAlert<ClubGroup>({
        title: 'Gruppe erstellen',
        html: (
            <>
                <p>Verein: {team.club!.name}</p>
                <hr />
                <label className="swal2-input-label" htmlFor="swal-input-name">
                    Name:
                </label>
                <input
                    type="text"
                    id="swal-input-name"
                    className="swal2-input"
                    placeholder="Name"
                />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-description"
                >
                    Beschreibung:
                </label>
                <textarea
                    id="swal-input-description"
                    className="swal2-textarea"
                    placeholder="Beschreibung"
                />
            </>
        ),
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Erstellen',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const name = $('#swal-input-name').val() as string;
            const description = $('#swal-input-description').val() as string;

            if (!name) {
                Swal.showValidationMessage('Bitte gib einen Namen ein!');
                return false;
            }

            Swal.showLoading();
            return await createClubGroup(team.id, { name, description });
        },
    });
}

// Group edit

export async function editClubGroup(
    teamId: ID,
    groupId: ID,
    group: Partial<ClubGroupRequestDTO>
) {
    return await ClubAPI.updateClubGroup(teamId, groupId, group).then(
        (data) => {
            CacheService.getTeamData(teamId).club_groups[groupId] = data.group;
            return data.group;
        }
    );
}

export async function editClubGroupPopup(team: Team, group: ClubGroup) {
    return await fireAlert<ClubGroup>({
        title: 'Gruppe bearbeiten',
        html: (
            <>
                <p>Gruppe: {group.name}</p>
                <hr />
                <label className="swal2-input-label" htmlFor="swal-input-name">
                    Name:
                </label>
                <input
                    type="text"
                    id="swal-input-name"
                    className="swal2-input"
                    placeholder={group.name}
                    defaultValue={group.name}
                />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-description"
                >
                    Beschreibung:
                </label>
                <textarea
                    id="swal-input-description"
                    className="swal2-textarea"
                    placeholder={group.description ?? ''}
                    defaultValue={group.description ?? ''}
                />
            </>
        ),
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Aktualisieren',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const name = $('#swal-input-name').val() as string;
            const description = $('#swal-input-description').val() as string;

            if (!name) {
                Swal.showValidationMessage('Bitte gib einen Namen ein!');
                return false;
            }

            Swal.showLoading();
            return await editClubGroup(team.id, group.id, {
                name,
                description,
            });
        },
    });
}

// Group deletion

export async function deleteClubGroup(teamId: ID, groupId: ID) {
    return await ClubAPI.deleteClubGroup(teamId, groupId).then(async () => {
        const teamData = CacheService.getTeamData(teamId);
        delete teamData.club_groups[groupId];
    });
}

export async function deleteClubGroupPopup(team: Team, group: ClubGroup) {
    return await confirmAlert(
        <>
            Willst du die Gruppe <b>{group.name}</b> wirklich löschen? Die
            Mitglieder dieser Gruppe werden nicht gelöscht, sondern nur aus der
            Gruppe entfernt.
        </>,
        async () => await deleteClubGroup(team.id, group.id)
    );
}

// Add/remove member to/from group

export async function addClubMemberToGroup(
    teamId: ID,
    memberId: ID,
    groupId: ID
) {
    return await ClubAPI.addClubMemberToGroup(teamId, memberId, groupId).then(
        async () => {
            const teamData = CacheService.getTeamData(teamId);
            teamData.club_groups[groupId].memberids.push(memberId);
        }
    );
}

export async function removeClubMemberFromGroup(
    teamId: ID,
    memberId: ID,
    groupId: ID
) {
    return await ClubAPI.removeClubMemberFromGroup(
        teamId,
        memberId,
        groupId
    ).then(async () => {
        const teamData = CacheService.getTeamData(teamId);
        teamData.club_groups[groupId].memberids.splice(
            teamData.club_groups[groupId].memberids.indexOf(memberId),
            1
        );
    });
}

export async function updateClubMemberGroupsPopup(
    team: Team,
    member: ClubMember
) {
    // Show a sweetalert with a multi-select of all groups; on submit, make add/remove requests for each group respectively
    const teamData = CacheService.getTeamData(team.id);
    const groups = Object.values(
        teamData.club_groups as IDIndexedObjectList<ClubGroup>
    );

    const currentGroupIds: ID[] = Object.values(groups)
        .filter((group) => group.memberids.includes(member.id))
        .map((group) => group.id);

    return await fireAlert({
        title: 'Gruppenzuordnung',
        html: (
            <>
                <p>
                    Vereinsmitglied: {member.first_name} {member.last_name}
                </p>
                <hr />
                <label
                    className="swal2-input-label"
                    htmlFor="swal-input-groups"
                >
                    Gruppen:
                </label>
                <select
                    id="swal-input-groups"
                    className="swal2-select h-auto py-3"
                    multiple
                    size={groups.length}
                    value={currentGroupIds}
                >
                    {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                            {group.name}
                        </option>
                    ))}
                </select>
            </>
        ),
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Aktualisieren',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const selectedGroupIds = $('#swal-input-groups').val() as ID[];

            Swal.showLoading();
            const requests: Promise<void>[] = [];
            for (const groupId of selectedGroupIds) {
                if (!currentGroupIds.includes(groupId)) {
                    requests.push(
                        addClubMemberToGroup(team.id, member.id, groupId)
                    );
                }
            }
            for (const groupId of currentGroupIds) {
                if (!selectedGroupIds.includes(groupId)) {
                    requests.push(
                        removeClubMemberFromGroup(team.id, member.id, groupId)
                    );
                }
            }
            await Promise.all(requests);
            successAlert(
                'Die Gruppenzuordnung wurde aktualisiert.',
                'Gruppenzuordnung aktualisiert'
            );
            return true;
        },
    });
}

// Group portfolios

export async function showClubGroupPortfolioExportPopup(group: ClubGroup) {
    return await fireAlert({
        title: 'Mitgliederportfolios exportieren',
        html: (
            <>
                Über folgende URL können die Mitgliederportfolios der Gruppe{' '}
                <b>{group.name}</b> im JSON-Format abgerufen werden:
                <input
                    className="swal2-input"
                    type="text"
                    readOnly
                    value={group.shared_url}
                />
            </>
        ),
        showCancelButton: true,
        showConfirmButton: false,
        cancelButtonText: 'Schliessen',
    });
}
