"use strict";

/**
 * Home page component
 */

import { CHANGELOG } from "../../data/changelog.js";
import { getDateString } from "../../utils/datetime.js";
import * as Dashboard from "../dashboard.js";
import * as Utils from "../../utils/utils.js";
import * as Settings from "../../utils/settings.js";
import * as Navigation from "../../utils/navigation.js";

export default class Page_Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = { expandChangelog: false };
  }

  applyAppearance(evt) {
    let val = evt.target.value;
    let darkmode = val === "dark" ? true : val === "light" ? false : null;
    Settings.editSettings({ darkmode }).then(Navigation.renderPage);
  }

  render() {
    let changelogitems = this.state.expandChangelog ? CHANGELOG : CHANGELOG.slice(0, 5);

    return (
      <Dashboard.Page
        title="Startseite"
        subtitle={`Hallo ${this.props.user.first_name}`}
        loading={this.props.settings === undefined}
      >
        <Dashboard.Column sizes={{ lg: 8 }}>
          <Dashboard.Tile title="Willkommen">
            <p className="ms-1 mb-1">
              <span>
                Verwende die Menuleiste (rechts) und die Seitenleiste (links),
                um zu navigieren.
              </span>
              <span className="d-md-none" aria-hidden="true">
                <br />
                <b>Hinweis</b>: Diese Seite wurde zwar auch für mobile Geräte
                optimiert, funktioniert aber besser auf grösseren Geräten.
              </span>
              <a
                onClick={Utils.toggleDebug}
                style={{ opacity: 0 }}
                className="ms-1"
                aria-hidden="true"
              >
                DEBUG
              </a>
            </p>
          </Dashboard.Tile>
          <Dashboard.Tile title="Einstellungen">
            <div className="mb-2 ms-1">
              <label htmlFor="appearance" className="form-label">
                Erscheinungsbild
              </label>
              <div className="btn-group form-control px-2" role="group">
                <input
                  type="radio"
                  className="btn-check"
                  name="appearance"
                  value="dark"
                  id="appearance_dark"
                  onChange={this.applyAppearance}
                  checked={this.props.settings.darkmode === true}
                />
                <label
                  className="btn btn-outline-primary"
                  htmlFor="appearance_dark"
                >
                  Dunkel
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="appearance"
                  value="auto"
                  id="appearance_auto"
                  onChange={this.applyAppearance}
                  checked={this.props.settings.darkmode === null}
                />
                <label
                  className="btn btn-outline-primary"
                  htmlFor="appearance_auto"
                >
                  Automatisch
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="appearance"
                  value="light"
                  id="appearance_light"
                  onChange={this.applyAppearance}
                  checked={this.props.settings.darkmode === false}
                />
                <label
                  className="btn btn-outline-primary"
                  htmlFor="appearance_light"
                >
                  Hell
                </label>
              </div>
              <div className="form-text">
                Bei "Automatisch" wird das Erscheinungsbild automatisch dem des
                Systems oder Browsers angepasst.
              </div>
            </div>
          </Dashboard.Tile>
        </Dashboard.Column>
        <Dashboard.Column sizes={{ lg: 4 }}>
          <Dashboard.Tile
            title="Neuste Updates"
            help="Neue Funktionen, Bugfixes und Änderungen"
          >
            <div className="m-1">
              {changelogitems.map((item, i) => [
                <h6 key={i + "header"}>
                  <b>{getDateString(new Date(item.date))}</b>
                </h6>,
                <ul key={i + "list"} className="small">
                  {item.changes.map((change, j) => (
                    <li key={j}>{change}</li>
                  ))}
                </ul>,
              ])}
              {this.state.expandChangelog ? (
                <a
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => this.setState({ expandChangelog: false })}
                  style={{ marginTop: "-0.75rem" }}
                >
                  Weniger anzeigen
                </a>
              ) : (
                <a
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => this.setState({ expandChangelog: true })}
                  style={{ marginTop: "-0.75rem" }}
                >
                  Mehr anzeigen
                </a>
              )}
            </div>
          </Dashboard.Tile>
        </Dashboard.Column>
      </Dashboard.Page>
    );
  }
}

