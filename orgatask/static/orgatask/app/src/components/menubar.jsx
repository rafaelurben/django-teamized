"use strict";

/*
    This component is used to render the part of the menubar that is only on the app page.
    I.e. account, home and logout buttons are not created here.
*/

export default class AppMenubar extends React.Component {
  constructor(props) {
    super(props);
    this.handleTeamSelect = this.handleTeamSelect.bind(this);
    this.selectPage = this.selectPage.bind(this);
  }

  handleTeamSelect(e) {
    this.props.onTeamSelect(e.target.value);
  }

  // Note: Calling this function with the page parameter returns a new function
  // that will be called when an event fires.
  selectPage = (page) => (e) => {
    this.props.onPageSelect(page);
  };

  render() {
    let teamlist;
    if (this.props.teams.length == 0) {
      teamlist = <option value="">Laden...</option>;
    } else {
      teamlist = this.props.teams.map((team) => {
        return (
          <option key={team.id} value={team.id}>
            {team.title}
          </option>
        );
      });
    }

    return (
      <div
        className="btn-group border rounded border-secondary ms-2"
        role="group"
        aria-label="team management menubar"
      >
        {/* Team list button */}
        <li className="nav-item border-secondary border-end">
          <a
            className="nav-link mx-1 px-2"
            onClick={this.selectPage("teamlist")}
            href="#"
          >
            <i className="fas fa-fw fa-list"></i>
          </a>
        </li>

        {/* Team switcher */}
        <select
          id="teamswitcher"
          value={this.props.selectedTeamId || ""}
          className="form-select bg-dark text-white-50 border-dark"
          aria-label="team selector"
          onInput={this.handleTeamSelect}
        >
          {teamlist}
        </select>

        {/* Team option button */}
        <li className="nav-item border-secondary border-start">
          <a
            className="nav-link mx-1 px-2"
            onClick={this.selectPage("teammanage")}
            href="#"
          >
            <i className="fas fa-fw fa-user-cog"></i>
          </a>
        </li>
      </div>
    );
  }
}
