/**
 * Utils for the club features
 */

import $ from "jquery";

import {requestSuccessAlert, confirmAlert, doubleConfirmAlert, successAlert} from "./alerts.js";
import * as API from "./api.js";
import * as Cache from "./cache.js";

export function getCurrentClubData() {
    const teamdata = Cache.getCurrentTeamData();
    if (teamdata) {
        return teamdata.team.club;
    }
    return undefined;
}

//// API calls ////

// Club creation

export async function createClub(teamId, data) {
    return await API.POST(`teams/${teamId}/create-club`, data).then(async (data) => {
        requestSuccessAlert(data);
        Cache.getTeamData(teamId).team.club = data.club;
        return data.team;
    })
}

export async function createClubPopup(team) {
    return (await Swal.fire({
        title: "Verein erstellen",
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
        confirmButtonText: "Erstellen",
        cancelButtonText: "Abbrechen",
        preConfirm: async () => {
            const name = document.getElementById("swal-input-name").value;
            const description = document.getElementById("swal-input-description").value;
            const slug = document.getElementById("swal-input-slug").value;

            if (!name || !description || !slug) {
                Swal.showValidationMessage("Bitte fülle alle Felder aus!");
                return false;
            }
            if (!slug.match(/^[0-9a-z\-_]+$/)) {
                Swal.showValidationMessage("Der Slug darf nur aus Kleinbuchstaben, Zahlen und Bindestrichen bestehen!");
                return false;
            }

            Swal.showLoading();
            return await createClub(team.id, {name, slug, description});
        },
    })).value;
}

// Club edit

export async function editClub(teamId, data) {
    return await API.POST(`teams/${teamId}/club`, data).then(async (data) => {
        requestSuccessAlert(data);
        Cache.getTeamData(teamId).team.club = data.club;
        return data.team;
    })
}

export async function editClubPopup(team) {
    return (await Swal.fire({
        title: "Verein bearbeiten",
        html: `
      <p>Verein: ${team.club.name}</p><hr />
      <label class="swal2-input-label" for="swal-input-name">Name:</label>
      <input type="text" id="swal-input-name" class="swal2-input" placeholder="${team.club.name}" value="${team.club.name}">
      <label class="swal2-input-label" for="swal-input-description">Beschreibung:</label>
      <textarea id="swal-input-description" class="swal2-textarea" placeholder="${team.club.description}">${team.club.description}</textarea>
    `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Aktualisieren",
        cancelButtonText: "Abbrechen",
        preConfirm: async () => {
            const name = document.getElementById("swal-input-name").value;
            const description = document.getElementById("swal-input-description").value;

            if (!name || !description) {
                Swal.showValidationMessage("Bitte fülle alle Felder aus!");
                return false;
            }

            Swal.showLoading();
            return await editClub(team.id, {name, description});
        },
    })).value;
}

// Club delete

export async function deleteClub(teamId) {
    return await API.DELETE(`teams/${teamId}/club`).then(async (data) => {
        requestSuccessAlert(data);
        let teamdata = Cache.getTeamData(teamId);
        teamdata.team.club = null;
        teamdata.club_members = {};
        return data.team;
    })
}

export async function deleteClubPopup(team) {
    return await doubleConfirmAlert(`Willst du den Verein '${team.club.name}' wirklich löschen und somit den Vereinsmodus im Team '${team.name}' deaktivieren?`, async () => await deleteClub(team.id));
}

// Member list

export async function getClubMembers(teamId) {
    let members = await Cache.refreshTeamCacheCategory(teamId, "club_members");
    Cache.getTeamData(teamId).team.club.membercount = members.length;
    return members;
}

// Member creation

export async function createClubMember(teamId, data) {
    return await API.POST(`teams/${teamId}/club/members`, data).then(async (data) => {
        requestSuccessAlert(data);
        let teamdata = Cache.getTeamData(teamId)
        teamdata.club_members[data.member.id] = data.member;
        teamdata.team.club.membercount += 1;
        return data.member;
    })
}

export async function createClubMemberPopup(team) {
    return (await Swal.fire({
        title: "Vereinsmitglied hinzufügen",
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
        confirmButtonText: "Hinzufügen",
        cancelButtonText: "Abbrechen",
        preConfirm: async () => {
            const first_name = document.getElementById("swal-input-first_name").value;
            const last_name = document.getElementById("swal-input-last_name").value;
            const email = document.getElementById("swal-input-email").value;
            const birth_date = document.getElementById("swal-input-birth_date").value;

            if (!first_name || !last_name || !email) {
                Swal.showValidationMessage("Namen und E-Mail-Adresse sind Pflichtfelder!");
                return false;
            }

            Swal.showLoading();
            return await createClubMember(team.id, {first_name, last_name, email, birth_date});
        },
    })).value;
}

// Member edit

export async function editClubMember(teamId, memberId, data) {
    return await API.POST(`teams/${teamId}/club/members/${memberId}`, data).then((data) => {
        requestSuccessAlert(data);
        Cache.getTeamData(teamId).club_members[memberId] = data.member;
        return data.member;
    })
}

export async function editClubMemberPopup(team, member) {
    return (await Swal.fire({
        title: "Vereinsmitglied bearbeiten",
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
        confirmButtonText: "Aktualisieren",
        cancelButtonText: "Abbrechen",
        preConfirm: async () => {
            const first_name = document.getElementById("swal-input-first_name").value;
            const last_name = document.getElementById("swal-input-last_name").value;
            const email = document.getElementById("swal-input-email").value;
            const birth_date = document.getElementById("swal-input-birth_date").value;

            if (!first_name || !last_name || !email) {
                Swal.showValidationMessage("Namen und E-Mail-Adresse sind Pflichtfelder!");
                return false;
            }

            Swal.showLoading();
            return await editClubMember(team.id, member.id, {first_name, last_name, email, birth_date});
        },
    })).value;
}

// Member deletion

export async function deleteClubMember(teamId, memberId) {
    return await API.DELETE(`teams/${teamId}/club/members/${memberId}`).then(async (data) => {
        requestSuccessAlert(data);
        let teamdata = Cache.getTeamData(teamId);
        delete teamdata.club_members[memberId];
        teamdata.team.club.membercount -= 1;

        // Remove member from all groups
        for (let group of Object.values(teamdata.club_groups)) {
            if (group.memberids.includes(memberId)) {
                teamdata.club_groups[group.id].memberids.splice(teamdata.club_groups[group.id].memberids.indexOf(memberId), 1);
            }
        }
    })
}

export async function deleteClubMemberPopup(team, member) {
    return await confirmAlert(`Willst du ${member.first_name} ${member.last_name} aus dem Verein '${team.club.name}' entfernen?`, async () => await deleteClubMember(team.id, member.id));
}

// Member portfolio

export async function getClubMemberPortfolio(teamId, memberId) {
    return await API.GET(`teams/${teamId}/club/members/${memberId}/portfolio`).then((data) => {
        return data.portfolio;
    })
}

export async function editClubMemberPortfolio(teamId, memberId, data) {
    return await API.POST(`teams/${teamId}/club/members/${memberId}/portfolio`, data).then((data) => {
        requestSuccessAlert(data);
        return data.portfolio;
    })
}

export async function editClubMemberPortfolioPopup(team, member) {
    return (await Swal.fire({
        title: `${member.first_name} ${member.last_name}: Portfolio bearbeiten`,
        html: `Portfolio laden...`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Aktualisieren",
        cancelButtonText: "Abbrechen",
        didOpen: async () => {
            Swal.showLoading();
            Swal.disableButtons()
            const container = Swal.getHtmlContainer();
            getClubMemberPortfolio(team.id, member.id).then(portfolio => {
                Swal.hideLoading();
                Swal.enableButtons();
                console.log(portfolio);
                container.innerHTML = `
            <label class="swal2-checkbox d-flex" for="swal-input-visible">
                <input type="checkbox" id="swal-input-visible" ${portfolio.visible ? "checked" : ""}>
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
            });
        },
        preConfirm: async () => {
            const visible = document.getElementById("swal-input-visible").checked;
            const image1_url = document.getElementById("swal-input-image1_url").value;
            const image2_url = document.getElementById("swal-input-image2_url").value;
            const member_since = document.getElementById("swal-input-member_since").value;
            const hobby_since = document.getElementById("swal-input-hobby_since").value;
            const role = document.getElementById("swal-input-role").value;
            const profession = document.getElementById("swal-input-profession").value;
            const hobbies = document.getElementById("swal-input-hobbies").textContent;
            const highlights = document.getElementById("swal-input-highlights").textContent;
            const biography = document.getElementById("swal-input-biography").textContent;
            const contact_email = document.getElementById("swal-input-contact_email").value;

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
                contact_email
            });
        },
    })).value;
}


// Member magic link

export async function createClubMemberMagicLink(teamId, memberId) {
    return await API.POST(`teams/${teamId}/club/members/${memberId}/create-magic-link`).then(async (data) => {
        requestSuccessAlert(data);
        return data.url;
    })
}

// Group list

export async function getClubGroups(teamId) {
    let groups = await Cache.refreshTeamCacheCategory(teamId, "club_groups");
    return groups;
}

// Group creation

export async function createClubGroup(teamId, data) {
    return await API.POST(`teams/${teamId}/club/groups`, data).then(async (data) => {
        requestSuccessAlert(data);
        let teamdata = Cache.getTeamData(teamId)
        teamdata.club_groups[data.group.id] = data.group;
        return data.group;
    })
}

export async function createClubGroupPopup(team) {
    return (await Swal.fire({
        title: "Gruppe erstellen",
        html: `
      <p>Verein: ${team.club.name}</p><hr />
      <label class="swal2-input-label" for="swal-input-name">Name:</label>
      <input type="text" id="swal-input-name" class="swal2-input" placeholder="Name">
      <label class="swal2-input-label" for="swal-input-description">Beschreibung:</label>
      <textarea id="swal-input-description" class="swal2-textarea" placeholder="Beschreibung"></textarea>
    `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Erstellen",
        cancelButtonText: "Abbrechen",
        preConfirm: async () => {
            const name = document.getElementById("swal-input-name").value;
            const description = document.getElementById("swal-input-description").value;

            if (!name) {
                Swal.showValidationMessage("Bitte gib einen Namen ein!");
                return false;
            }

            Swal.showLoading();
            return await createClubGroup(team.id, {name, description});
        },
    })).value;
}

// Group edit

export async function editClubGroup(teamId, groupId, data) {
    return await API.POST(`teams/${teamId}/club/groups/${groupId}`, data).then((data) => {
        requestSuccessAlert(data);
        Cache.getTeamData(teamId).club_groups[groupId] = data.group;
        return data.group;
    })
}

export async function editClubGroupPopup(team, group) {
    return (await Swal.fire({
        title: "Gruppe bearbeiten",
        html: `
      <p>Gruppe: ${group.name}</p><hr />
      <label class="swal2-input-label" for="swal-input-name">Name:</label>
      <input type="text" id="swal-input-name" class="swal2-input" placeholder="${group.name}" value="${group.name}">
      <label class="swal2-input-label" for="swal-input-description">Beschreibung:</label>
      <textarea id="swal-input-description" class="swal2-textarea" placeholder="${group.description}">${group.description}</textarea>
    `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Aktualisieren",
        cancelButtonText: "Abbrechen",
        preConfirm: async () => {
            const name = document.getElementById("swal-input-name").value;
            const description = document.getElementById("swal-input-description").value;

            if (!name) {
                Swal.showValidationMessage("Bitte gib einen Namen ein!");
                return false;
            }

            Swal.showLoading();
            return await editClubGroup(team.id, group.id, {name, description});
        },
    })).value;
}

// Group deletion

export async function deleteClubGroup(teamId, groupId) {
    return await API.DELETE(`teams/${teamId}/club/groups/${groupId}`).then(async (data) => {
        requestSuccessAlert(data);
        let teamdata = Cache.getTeamData(teamId);
        delete teamdata.club_groups[groupId];
    })
}

export async function deleteClubGroupPopup(team, group) {
    return await confirmAlert(`Willst du die Gruppe '${group.name}' wirklich löschen?`, async () => await deleteClubGroup(team.id, group.id));
}

// Add/remove member to/from group

export async function addClubMemberToGroup(teamId, memberId, groupId) {
    return await API.POST(`teams/${teamId}/club/members/${memberId}/membership/${groupId}`).then(async (data) => {
        requestSuccessAlert(data);
        let teamdata = Cache.getTeamData(teamId);
        teamdata.club_groups[groupId].memberids.push(memberId);
    })
}

export async function removeClubMemberFromGroup(teamId, memberId, groupId) {
    return await API.DELETE(`teams/${teamId}/club/members/${memberId}/membership/${groupId}`).then(async (data) => {
        requestSuccessAlert(data);
        let teamdata = Cache.getTeamData(teamId);
        teamdata.club_groups[groupId].memberids.splice(teamdata.club_groups[groupId].memberids.indexOf(memberId), 1);
    })
}

export async function updateClubMemberGroupsPopup(team, member) {
    // Show a sweetalert with a multi-select of all groups; on submit, make add/remove requests for each group respectively
    let teamdata = Cache.getTeamData(team.id);
    let groups = Object.values(teamdata.club_groups);

    var currentgroupids = [];
    for (let group of Object.values(groups)) {
        if (group.memberids.includes(member.id)) {
            currentgroupids.push(group.id);
        }
    }

    return (await Swal.fire({
        title: "Gruppenzuordnung",
        html: `
      <p>Vereinsmitglied: ${member.first_name} ${member.last_name}</p><hr />
      <label class="swal2-input-label" for="swal-input-groups">Gruppen:</label>
      <select id="swal-input-groups" class="swal2-input h-auto py-3" multiple size="${groups.length}"></select>
    `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Aktualisieren",
        cancelButtonText: "Abbrechen",
        didOpen: () => {
            $('#swal-input-groups').html(groups.map((group) => (`
            <option value="${group.id}">
                ${group.name}
            </option>
          `)).join(''));
            $('#swal-input-groups').val(currentgroupids);
        },
        preConfirm: async () => {
            let selectedgroupids = $('#swal-input-groups').val();

            Swal.showLoading();
            let requests = [];
            for (let groupId of selectedgroupids) {
                if (!currentgroupids.includes(groupId)) {
                    requests.push(addClubMemberToGroup(team.id, member.id, groupId));
                }
            }
            for (let groupId of currentgroupids) {
                if (!selectedgroupids.includes(groupId)) {
                    requests.push(removeClubMemberFromGroup(team.id, member.id, groupId));
                }
            }
            await Promise.all(requests);
            successAlert("Gruppenzuordnung aktualisiert!");
            return true;
        }
    })).value;
}