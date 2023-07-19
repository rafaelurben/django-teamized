/**
 * Utils for the club features
 */

import { requestSuccessAlert, confirmAlert, doubleConfirmAlert } from "./alerts.js";
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
  return await API.POST(`teams/${teamId}/create-club`, data).then(
    async (data) => {
      requestSuccessAlert(data);
      Cache.getTeamData(teamId).team.club = data.club;
      return data.team;
    }
  )
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
      const description = document.getElementById(
        "swal-input-description"
      ).value;
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
      return await createClub(team.id, { name, slug, description });
    },
  })).value;
}

// Club edit

export async function editClub(teamId, data) {
  return await API.POST(`teams/${teamId}/club`, data).then(
    async (data) => {
      requestSuccessAlert(data);
      Cache.getTeamData(teamId).team.club = data.club;
      return data.team;
    }
  )
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
      const description = document.getElementById(
        "swal-input-description"
      ).value;

      if (!name || !description) {
        Swal.showValidationMessage("Bitte fülle alle Felder aus!");
        return false;
      }

      Swal.showLoading();
      return await editClub(team.id, { name, description });
    },
  })).value;
}

// Club delete

export async function deleteClub(teamId) {
  return await API.DELETE(`teams/${teamId}/club`).then(
    async (data) => {
      requestSuccessAlert(data);
      let teamdata = Cache.getTeamData(teamId);
      teamdata.team.club = null;
      teamdata.club_members = {};
      return data.team;
    }
  )
}

export async function deleteClubPopup(team) {
  return await doubleConfirmAlert(
    `Willst du den Verein '${team.club.name}' wirklich löschen und somit den Vereinsmodus im Team '${team.name}' deaktivieren?`,
    async () => await deleteClub(team.id)
  );
}

// Member list

export async function getClubMembers(teamId) {
  let members = await Cache.refreshTeamCacheCategory(teamId, "club_members");
  Cache.getTeamData(teamId).team.club.membercount = members.length;
  return members;
}

// Member creation

export async function createClubMember(teamId, data) {
  return await API.POST(`teams/${teamId}/club/members`, data).then(
    async (data) => {
      requestSuccessAlert(data);
      let teamdata = Cache.getTeamData(teamId)
      teamdata.club_members[data.member.id] = data.member;
      teamdata.team.club.membercount += 1;
      return data.member;
    }
  )
}

// Member edit

export async function editClubMember(teamId, memberId, data) {
  return await API.POST(`teams/${teamId}/club/members/${memberId}`, data).then(
    (data) => {
      requestSuccessAlert(data);
      Cache.getTeamData(teamId).club_members[memberId] = data.member;
      return data.member;
    }
  )
}

// Member deletion

export async function deleteClubMember(teamId, memberId) {
  return await API.DELETE(`teams/${teamId}/club/members/${memberId}`).then(
    async (data) => {
      requestSuccessAlert(data);
      let teamdata = Cache.getTeamData(teamId);
      delete teamdata.club_members[memberId];
      teamdata.team.club.membercount -= 1;
    }
  )
}

export async function deleteClubMemberPopup(team, member) {
  return await confirmAlert(
    `Willst du ${member.first_name} ${member.last_name} aus dem Verein '${team.club.name}' entfernen?`,
    async () => await deleteClubMember(team.id, member.id)
  );
}

// Group list

export async function getClubGroups(teamId) {
  let groups = await Cache.refreshTeamCacheCategory(teamId, "club_groups");
  return groups;
}

// Group creation

export async function createClubGroup(teamId, data) {
  return await API.POST(`teams/${teamId}/club/groups`, data).then(
    async (data) => {
      requestSuccessAlert(data);
      let teamdata = Cache.getTeamData(teamId)
      teamdata.club_groups[data.group.id] = data.group;
      return data.group;
    }
  )
}

// Group edit

export async function editClubGroup(teamId, groupId, data) {
  return await API.POST(`teams/${teamId}/club/groups/${groupId}`, data).then(
    (data) => {
      requestSuccessAlert(data);
      Cache.getTeamData(teamId).club_groups[groupId] = data.group;
      return data.group;
    }
  )
}

// Group deletion

export async function deleteClubGroup(teamId, groupId) {
  return await API.DELETE(`teams/${teamId}/club/groups/${groupId}`).then(
    async (data) => {
      requestSuccessAlert(data);
      let teamdata = Cache.getTeamData(teamId);
      delete teamdata.club_groups[groupId];
    }
  )
}

export async function deleteClubGroupPopup(team, group) {
  return await confirmAlert(
    `Willst du die Gruppe '${group.name}' wirklich löschen?`,
    async () => await deleteClubGroup(team.id, group.id)
  );
}
