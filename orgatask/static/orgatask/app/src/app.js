'use strict';

class OrgaTask_AppMenubar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  render() {
    return (
      <div className="btn-group border rounded border-secondary" role="group" aria-label="Team list">
        <li className="nav-item border-secondary border-end">
          <a className="nav-link ms-1 me-1" data-page="teamlist" href="#">
            <i className="fas fa-list"></i>
          </a>
        </li>
        <select id="teamswitcher" className="form-select bg-dark text-white-50 border-dark" aria-label="Team switcher">
          <option selected>Loading...</option>
        </select>
        <li className="nav-item border-secondary border-start">
          <a className="nav-link ms-1 me-1" data-page="settings" href="#">
            <i className="fas fa-user-cog"></i>
          </a>
        </li>
      </div>
    );
  }
}

import * as Teams from './orgatask_modules/teams.js';
import * as PageLoader from './orgatask_modules/page-loader.js';

window.orgatask = {};

$("document").ready(async function () {
  PageLoader.importFromURL();
  await Teams.loadTeams();
  PageLoader.exportToURL();
  PageLoader.loadPage();
})

// let appmenubar_container = document.querySelector('#orgatask_appmenubar');
// let reactelem = ReactDOM.render(<OrgaTask_AppMenubar />, appmenubar_container);
// console.log(reactelem);
