/**
 * Utils for the base team features
 */

import { requestSuccessAlert, confirmAlert } from "./alerts.js";
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

// Team edit

export async function editClub(teamId, name, description) {
  return await API.POST(`teams/${teamId}/club`, {
    name, description,
  }).then(
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
      return await editClub(team.id, name, description);
    },
  })).value;
}

// // Member list

export async function getClubMembers(teamId) {
  let members = await Cache.refreshTeamCacheCategory(teamId, "club_members");
  Cache.getTeamData(teamId).team.club.membercount = members.length;
  return members;
}

// // Member edit

// export async function editClubMember(teamId, memberId, OPTIONS) {
//   return await API.POST(`teams/${teamId}/club/members/${memberId}`, {
//     OPTIONS,
//   }).then(
//     (data) => {
//       requestSuccessAlert(data);
//       Cache.getTeamData(teamId).club_members[memberId] = data.member;
//       return data.id;
//     }
//   )
// }

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
    `Willst du ${member.user.last_name} ${member.user.first_name} aus dem Verein '${team.club.name}' entfernen?`,
    async () => await deleteClubMember(team.id, member.id)
  );
}
