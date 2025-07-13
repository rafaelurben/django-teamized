/**
 * Utils for the club features
 */

import $ from 'jquery';

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
        html: `
          <label class="swal2-input-label" for="swal-input-name">Name:</label>
          <input type="text" id="swal-input-name" class="swal2-input" placeholder="Dein Verein">
          <label class="swal2-input-label" for="swal-input-description">Beschreibung:</label>
          <textarea id="swal-input-description" class="swal2-textarea" placeholder="Infos über deinen Verein"></textarea>
          <label class="swal2-input-label" for="swal-input-slug">Slug:</label>
          <input type="text" id="swal-input-slug" class="swal2-input" placeholder="dein-verein">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Erstellen',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const name = <string>$('#swal-input-name').val();
            const description = <string>$('#swal-input-description').val();
            const slug = <string>$('#swal-input-slug').val();

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
        html: `
      <p>Verein: ${team.club!.name}</p><hr />
      <label class="swal2-input-label" for="swal-input-name">Name:</label>
      <input type="text" id="swal-input-name" class="swal2-input" placeholder="${team.club!.name}" value="${team.club!.name}">
      <label class="swal2-input-label" for="swal-input-description">Beschreibung:</label>
      <textarea id="swal-input-description" class="swal2-textarea" placeholder="${team.club!.description}">${team.club!.description}</textarea>
    `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Aktualisieren',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const name = <string>$('#swal-input-name').val();
            const description = <string>$('#swal-input-description').val();

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
        `Willst du den Verein '${team.club!.name}' wirklich löschen und somit den Vereinsmodus im Team '${team.name}' deaktivieren?`,
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
        html: `
      <label class="swal2-input-label" for="swal-input-first_name">Vorname:</label>
      <input type="text" id="swal-input-first_name" class="swal2-input" placeholder="Max">
      <label class="swal2-input-label" for="swal-input-last_name">Nachname:</label>
      <input type="text" id="swal-input-last_name" class="swal2-input" placeholder="Mustermann">
      <label class="swal2-input-label" for="swal-input-email">E-Mail:</label>
      <input type="email" id="swal-input-email" class="swal2-input" placeholder="max.mustermann@example.com">
      <label class="swal2-input-label" for="swal-input-birth_date">Geburtsdatum:</label>
      <input type="date" id="swal-input-birth_date" class="swal2-input">
    `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Hinzufügen',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const first_name = <string>$('#swal-input-first_name').val();
            const last_name = <string>$('#swal-input-last_name').val();
            const email = <string>$('#swal-input-email').val();
            const birth_date = <string>$('#swal-input-birth_date').val();

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
        html: `
      <label class="swal2-input-label" for="swal-input-first_name">Vorname:</label>
      <input type="text" id="swal-input-first_name" class="swal2-input" placeholder="${member.first_name}" value="${member.first_name}">
      <label class="swal2-input-label" for="swal-input-last_name">Nachname:</label>
      <input type="text" id="swal-input-last_name" class="swal2-input" placeholder="${member.last_name}" value="${member.last_name}">
      <label class="swal2-input-label" for="swal-input-email">E-Mail:</label>
      <input type="email" id="swal-input-email" class="swal2-input" placeholder="${member.email}" value="${member.email}">
      <label class="swal2-input-label" for="swal-input-birth_date">Geburtsdatum:</label>
      <input type="date" id="swal-input-birth_date" class="swal2-input" value="${member.birth_date}">
    `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Aktualisieren',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const first_name = <string>$('#swal-input-first_name').val();
            const last_name = <string>$('#swal-input-last_name').val();
            const email = <string>$('#swal-input-email').val();
            const birth_date = <string>$('#swal-input-birth_date').val();

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
            <IDIndexedObjectList<ClubGroup>>teamData.club_groups
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
    return await confirmAlert(
        `Willst du ${member.first_name} ${member.last_name} aus dem Verein '${team.club!.name}' entfernen?`,
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
    return await fireAlert<ClubMemberPortfolio>({
        title: `${member.first_name} ${member.last_name}: Portfolio bearbeiten`,
        html: `Portfolio laden...`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Aktualisieren',
        cancelButtonText: 'Abbrechen',
        didOpen: async () => {
            Swal.showLoading();
            Swal.disableButtons();
            const container = Swal.getHtmlContainer()!;
            const portfolio = await getClubMemberPortfolio(team.id, member.id);

            Swal.hideLoading();
            Swal.enableButtons();
            container.innerHTML = `
                    <label class="swal2-checkbox d-flex" for="swal-input-visible">
                        <input type="checkbox" id="swal-input-visible" ${portfolio.visible ? 'checked' : ''}>
                        <span>Portfolio sichtbar?</span>
                    </label>
                    <label class="swal2-input-label" for="swal-input-image1_url">Bild 1:</label>
                    <input type="text" id="swal-input-image1_url" class="swal2-input" placeholder="https://example.com/image1.jpg" value="${portfolio.image1_url}">
                    <label class="swal2-input-label" for="swal-input-image2_url">Bild 2:</label>
                    <input type="text" id="swal-input-image2_url" class="swal2-input" placeholder="https://example.com/image2.jpg" value="${portfolio.image2_url}">
                    <label class="swal2-input-label" for="swal-input-member_since">Mitglied seit:</label>
                    <input type="number" id="swal-input-member_since" class="swal2-input" placeholder="1994" value="${portfolio.member_since}">
                    <label class="swal2-input-label" for="swal-input-hobby_since">Hobby seit:</label>
                    <input type="number" id="swal-input-hobby_since" class="swal2-input" placeholder="1994" value="${portfolio.hobby_since}">
                    <label class="swal2-input-label" for="swal-input-role">Rolle:</label>
                    <input type="text" id="swal-input-role" class="swal2-input" placeholder="Vorstand" value="${portfolio.role}">
                    <label class="swal2-input-label" for="swal-input-profession">Beruf:</label>
                    <input type="text" id="swal-input-profession" class="swal2-input" placeholder="Softwareentwickler" value="${portfolio.profession}">
                    <label class="swal2-input-label" for="swal-input-hobbies">Hobbies:</label>
                    <textarea id="swal-input-hobbies" class="swal2-textarea">${portfolio.hobbies}</textarea>
                    <label class="swal2-input-label" for="swal-input-highlights">Highlights:</label>
                    <textarea id="swal-input-highlights" class="swal2-textarea">${portfolio.highlights}</textarea>
                    <label class="swal2-input-label" for="swal-input-biography">Biografie:</label>
                    <textarea id="swal-input-biography" class="swal2-textarea">${portfolio.biography}</textarea>
                    <label class="swal2-input-label" for="swal-input-contact_email">Kontakt-E-Mail:</label>
                    <input type="email" id="swal-input-contact_email" class="swal2-input" placeholder="example@tpto.ch" value="${portfolio.contact_email}">
                `;
        },
        preConfirm: async () => {
            const visible = <boolean>$('#swal-input-visible').prop('checked');
            const image1_url = <string>$('#swal-input-image1_url').val();
            const image2_url = <string>$('#swal-input-image2_url').val();
            const member_since = <number>$('#swal-input-member_since').val();
            const hobby_since = <number>$('#swal-input-hobby_since').val();
            const role = <string>$('#swal-input-role').val();
            const profession = <string>$('#swal-input-profession').val();
            const hobbies = <string>$('#swal-input-hobbies').val();
            const highlights = <string>$('#swal-input-highlights').val();
            const biography = <string>$('#swal-input-biography').val();
            const contact_email = <string>$('#swal-input-contact_email').val();

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
        html: `
      <p>Verein: ${team.club!.name}</p><hr />
      <label class="swal2-input-label" for="swal-input-name">Name:</label>
      <input type="text" id="swal-input-name" class="swal2-input" placeholder="Name">
      <label class="swal2-input-label" for="swal-input-description">Beschreibung:</label>
      <textarea id="swal-input-description" class="swal2-textarea" placeholder="Beschreibung"></textarea>
    `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Erstellen',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const name = <string>$('#swal-input-name').val();
            const description = <string>$('#swal-input-description').val();

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
        html: `
      <p>Gruppe: ${group.name}</p><hr />
      <label class="swal2-input-label" for="swal-input-name">Name:</label>
      <input type="text" id="swal-input-name" class="swal2-input" placeholder="${group.name}" value="${group.name}">
      <label class="swal2-input-label" for="swal-input-description">Beschreibung:</label>
      <textarea id="swal-input-description" class="swal2-textarea" placeholder="${group.description}">${group.description}</textarea>
    `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Aktualisieren',
        cancelButtonText: 'Abbrechen',
        preConfirm: async () => {
            const name = <string>$('#swal-input-name').val();
            const description = <string>$('#swal-input-description').val();

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
        `Willst du die Gruppe '${group.name}' wirklich löschen?`,
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
        <IDIndexedObjectList<ClubGroup>>teamData.club_groups
    );

    const currentGroupIds: ID[] = Object.values(groups)
        .filter((group) => group.memberids.includes(member.id))
        .map((group) => group.id);

    return await fireAlert({
        title: 'Gruppenzuordnung',
        html: `
          <p>Vereinsmitglied: ${member.first_name} ${member.last_name}</p><hr />
          <label class="swal2-input-label" for="swal-input-groups">Gruppen:</label>
          <select id="swal-input-groups" class="swal2-input h-auto py-3" multiple size="${groups.length}"></select>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Aktualisieren',
        cancelButtonText: 'Abbrechen',
        didOpen: () => {
            const $groupsInput = $('#swal-input-groups');

            $groupsInput.html(
                groups
                    .map(
                        (group) =>
                            `<option value="${group.id}">${group.name}</option>`
                    )
                    .join('')
            );
            $groupsInput.val(currentGroupIds);
        },
        preConfirm: async () => {
            const selectedGroupIds = <ID[]>$('#swal-input-groups').val();

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
        html: `
            Über folgende URL können die Mitgliederportfolios der Gruppe "${group.name}"
            im JSON-Format abgerufen werden:
            <input class="swal2-input" type="text" readonly value="${group.shared_url}">
          `,
        showCancelButton: true,
        showConfirmButton: false,
        cancelButtonText: 'Schliessen',
    });
}
