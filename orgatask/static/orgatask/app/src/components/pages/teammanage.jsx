"use strict";

import { errorAlert } from "../../utils/alerts.js";
import * as Teams from "../../utils/teams.js";
import * as Navigation from "../../utils/navigation.js";
import * as Dashboard from "../dashboard.js";

export default class Page_TeamManage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // let memberrows = this.props.teams.map((team) => {
    //   return (
    //     <TeamMembersTableRow
    //       key={team.id}
    //       team={team}
    //       selectedTeamId={this.props.selectedTeamId}
    //     />
    //   );
    // });

    // let inviterows = this.props.teams.map((team) => {
    //   return (
    //     <TeamInvitesTableRow
    //       key={team.id}
    //       team={team}
    //       selectedTeamId={this.props.selectedTeamId}
    //     />
    //   );
    // });

    return (
      <Dashboard.Dashboard title="Dein Team">
        <Dashboard.DashboardColumn size="12">
          <Dashboard.DashboardTile>
            <table className="table table-borderless align-middle mb-0">
              <tbody>{/* {memberrows} */}</tbody>
            </table>
          </Dashboard.DashboardTile>

          <Dashboard.DashboardTile>
            <table className="table table-borderless align-middle mb-0">
              <tbody>
                {/* {inviterows} */}
                <tr>
                  <td>
                    <button
                      type="button"
                      className="btn btn-outline-primary border-1"
                      onClick={Teams.createInviteSwal}
                    >
                      Einladung erstellen
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </Dashboard.DashboardTile>
        </Dashboard.DashboardColumn>
      </Dashboard.Dashboard>
    );
  }
}
