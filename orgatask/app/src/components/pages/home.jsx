"use strict";

import * as Dashboard from "../dashboard.js";
import * as Utils from "../../utils/utils.js";

export default class Page_Home extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Dashboard.Dashboard
        title="Startseite"
        subtitle={`Hallo ${this.props.user.first_name}`}
      >
        <Dashboard.DashboardColumn sizes={{ lg: 8 }}>
          <Dashboard.DashboardTile title="Willkommen">
            <p className="ms-1">
              Verwende die Menuleiste (links) und die Seitenleiste (rechts), um zu navigieren.
            </p>
          </Dashboard.DashboardTile>
        </Dashboard.DashboardColumn>
        <Dashboard.DashboardColumn sizes={{ lg: 4 }}>
          <Dashboard.DashboardTile title="Neuste Updates" help="Neue Funktionen, Bugfixes und Änderungen">
            <div className="ms-1 mt-1">
              <h6>
                <b>10. September 2022</b>
              </h6>
              <ul className="small">
                <li>Startseite &amp; In-App-Startseite hinzugefügt</li>
              </ul>
              <h6>
                <b>5. September 2022</b>
              </h6>
              <ul className="small">
                <li>Besseres Abonnier-Erlebnis bei Kalendern</li>
                <li>Kalender-Features sind nun aus der Beta</li>
              </ul>
            </div>
          </Dashboard.DashboardTile>
        </Dashboard.DashboardColumn>

        <div className="w-50 position-fixed bottom-0 end-0 text-end">
          <a onClick={Utils.toggleDebug} className="btn text-white">
            Toggle DEBUG mode
          </a>
        </div>
      </Dashboard.Dashboard>
    );
  }
}
