"use strict";

import * as Dashboard from "../dashboard.js";
import * as Utils from "../../utils/utils.js";
import * as Settings from "../../utils/settings.js";
import * as Navigation from "../../utils/navigation.js";

export default class Page_Home extends React.Component {
  constructor(props) {
    super(props);
  }

  applyAppearance(evt) {
    let val = evt.target.value;
    let darkmode = val === "dark" ? true : val === "light" ? false : null;
    Settings.editSettings({ darkmode }).then(Navigation.renderPage);
  }

  render() {
    return (
      <Dashboard.Page
        title="Startseite"
        subtitle={`Hallo ${this.props.user.first_name}`}
      >
        <Dashboard.Column sizes={{ lg: 8 }}>
          <Dashboard.Tile title="Willkommen">
            <p className="ms-1 mb-1">
              <span>Verwende die Menuleiste (rechts) und die Seitenleiste (links), um zu navigieren.</span>
              <span className="d-md-none" aria-hidden="true">
                <br />
                <b>Hinweis</b>: Diese Seite wurde zwar auch für mobile Geräte optimiert, funktioniert aber besser auf grösseren Geräten.
              </span>
              <a onClick={Utils.toggleDebug} style={{opacity: 0}} className="ms-1" aria-hidden="true">
                DEBUG
              </a>
            </p>
          </Dashboard.Tile>
          <Dashboard.Tile title="Einstellungen">
            <div className="mb-2 ms-1">
                <label htmlFor="appearance" className="form-label">Erscheinungsbild</label>
                <div className="btn-group form-control px-2" role="group">
                  <input type="radio" className="btn-check" name="appearance" value="dark" id="appearance_dark" onChange={this.applyAppearance} checked={this.props.settings.darkmode === true} />
                  <label className="btn btn-outline-primary" htmlFor="appearance_dark">Dunkel</label>

                  <input type="radio" className="btn-check" name="appearance" value="auto" id="appearance_auto" onChange={this.applyAppearance} checked={this.props.settings.darkmode === null}/>
                  <label className="btn btn-outline-primary" htmlFor="appearance_auto">Automatisch</label>

                  <input type="radio" className="btn-check" name="appearance" value="light" id="appearance_light" onChange={this.applyAppearance} checked={this.props.settings.darkmode === false} />
                  <label className="btn btn-outline-primary" htmlFor="appearance_light">Hell</label>
                </div>
                <div className="form-text">Bei "Automatisch" wird das Erscheinungsbild automatisch dem des Systems oder Browsers angepasst.</div>
            </div>

          </Dashboard.Tile>
        </Dashboard.Column>
        <Dashboard.Column sizes={{ lg: 4 }}>
          <Dashboard.Tile title="Neuste Updates" help="Neue Funktionen, Bugfixes und Änderungen">
            <div className="ms-1 mt-1">
              <h6>
                <b>20. Oktober 2022</b>
              </h6>
              <ul className="small">
                <li>Kalender und To-do-Listen aktualisiert</li>
              </ul>
              <h6>
                <b>18. Oktober 2022</b>
              </h6>
              <ul className="small">
                <li>Verbesserungen bei To-do-Listen</li>
                <li>Diverse Fehlerbehebungen und Korrekturen</li>
              </ul>
              <h6>
                <b>12. Oktober 2022</b>
              </h6>
              <ul className="small">
                <li>Kalender-Kacheln umsortiert</li>
                <li>Diverse Fehlerbehebungen & Verbesserungen</li>
              </ul>
              <h6>
                <b>11. Oktober 2022</b>
              </h6>
              <ul className="small">
                <li>Diverse Fehlerbehebungen</li>
              </ul>
              <h6>
                <b>10. Oktober 2022</b>
              </h6>
              <ul className="small">
                <li>Verbesserungen im Arbeitszeit-Dashboard</li>
              </ul>
              <h6>
                <b>9. Oktober 2022</b>
              </h6>
              <ul className="small">
                <li>Statistik für Arbeitszeit hinzugefügt</li>
              </ul>
              <h6>
                <b>15. September 2022</b>
              </h6>
              <ul className="small">
                <li>Einstellung für Erscheinungsbild hinzugefügt</li>
              </ul>
              <h6>
                <b>11. September 2022</b>
              </h6>
              <ul className="small">
                <li>To-do-Listen sind nun in der Beta</li>
                <li>Diverse Fehlerbehebungen</li>
              </ul>
              <h6>
                <b>10. September 2022</b>
              </h6>
              <ul className="small">
                <li>Duplizieren-Knopf zu Kalenderereignissen hinzugefügt</li>
                <li>Startseite &amp; In-App-Startseite hinzugefügt</li>
              </ul>
              <h6>
                <b>5. September 2022</b>
              </h6>
              <ul className="small mb-1">
                <li>Besseres Abonnier-Erlebnis bei Kalendern</li>
                <li>Kalender-Features sind nun aus der Beta</li>
              </ul>
            </div>
          </Dashboard.Tile>
        </Dashboard.Column>
      </Dashboard.Page>
    );
  }
}
