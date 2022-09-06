"use strict";

import * as Dashboard from "../dashboard.js";
import * as ToDo from "../../utils/todo.js";
import * as Navigation from "../../utils/navigation.js";
import * as Cache from "../../utils/cache.js";
import { TooltipIcon, Tooltip } from "../tooltips.js";

class ListSelector extends React.Component {
  constructor(props) {
    super(props);
    this.handleListSelect = this.handleListSelect.bind(this);

    this.createList = this.createList.bind(this);
  }

  handleListSelect(event) {
    this.props.onListSelect(event.target.value);
  }

  createList() {
    ToDo.createToDoListPopup(this.props.team).then((todolist) => {
      this.props.onListSelect(todolist.id);
    });
  }

  render() {
    let listSelectOptions = [];
    if (Cache.getCurrentTeamData()._state.todolists._initial) {
      listSelectOptions.push(
        <option key="0" value="0">
          Laden...
        </option>
      );
    } else if (Object.keys(this.props.todolists).length === 0) {
      listSelectOptions.push(
        <option key="0" value="0">
          Keine Listen vorhanden
        </option>
      );
    } else {
      listSelectOptions = Object.entries(this.props.todolists).map(
        ([lsId, lst]) => (
          <option key={lsId} value={lsId}>
            {lst.name}
          </option>
        )
      );
    }

    let buttons = [];
    if (this.props.isAdmin) {
      buttons.push(
        <button
          key="create"
          className="btn btn-outline-success"
          onClick={this.createList}
        >
          Liste erstellen
        </button>
      );
    } else {
      buttons.push(
        <Tooltip
          key="noadmin"
          title="Diese Aktion steht nur Admins zur Verfügung"
        >
          <button className="btn btn-outline-dark disabled">
            Liste Erstellen
          </button>
        </Tooltip>
      );
    }

    let todolist = this.props.selectedList;

    return [
      <select
        key="select"
        id="list-selector-list-select"
        className="form-select mb-2"
        onInput={this.handleListSelect}
        disabled={todolist === undefined}
        value={this.props.selectedListId || "0"}
      >
        {listSelectOptions}
      </select>,
      buttons,
    ];
  }
}

class ListInfo extends React.Component {
  constructor(props) {
    super(props);

    this.editList = this.editList.bind(this);
    this.deleteList = this.deleteList.bind(this);
  }

  editList() {
    ToDo.editToDoListPopup(this.props.team, this.props.selectedList).then(
      Navigation.renderPage
    );
  }

  deleteList() {
    ToDo.deleteToDoListPopup(
      this.props.team,
      this.props.selectedList
    ).then(() => {
      this.props.onListSelect(null);
    });
  }

  render() {
    let todolist = this.props.selectedList;
    if (todolist === undefined) {
      return (
        <p className="ms-1 mb-0">
          Im ausgewählten Team ist noch keine ToDo-Liste vorhanden.{" "}
          {this.props.isAdmin ? (
            <TooltipIcon key="admin" title='Du kannst mit den "Neu erstellen"-Knopf weiter oben eine neue Liste erstellen.'></TooltipIcon>
          ) : (
            <TooltipIcon key="noadmin" title="Bitte wende dich an einen Admin dieses Teams, um eine neue Liste zu erstellen."></TooltipIcon>
          )}
        </p>
      );
    }

    let listPanelButtons = [];
    if (this.props.isAdmin) {
      listPanelButtons.push(
        <button
          key="edit"
          className="btn btn-outline-dark mx-2"
          onClick={this.editList}
        >
          Bearbeiten
        </button>
      );
      listPanelButtons.push(
        <button
          key="delete"
          className="btn btn-outline-danger"
          onClick={this.deleteList}
        >
          Löschen
        </button>
      );
    } else {
      listPanelButtons.push(
        <Tooltip
          key="noadmin"
          title="Diese Aktionen stehen nur Admins zur Verfügung"
        >
          <button className="btn btn-outline-dark disabled">
            Bearbeiten/Löschen
          </button>
        </Tooltip>
      );
    }

    return [
      <table key="table" className="table table-borderless mb-2">
        <tbody>
          <tr>
            <th>Name:</th>
            <td>{todolist.name}</td>
          </tr>
          <tr>
            <th>Beschreibung:</th>
            <td style={{ whiteSpace: "pre" }}>{todolist.description}</td>
          </tr>
          <tr>
            <th>Farbe:</th>
            <td>
              <i
                style={{ color: todolist.color }}
                className="fas fa-circle small dm-invert"
              ></i>
            </td>
          </tr>
          <tr className="debug-only">
            <th>ID:</th>
            <td>{todolist.id}</td>
          </tr>
        </tbody>
      </table>,
      listPanelButtons,
    ];
  }
}

export default class Page_ToDo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedListId: null,
    };
  }

  handleListSelect(listId) {
    this.setState({ selectedListId: listId });
  }

  ensureValidListId() {
    const isValid = this.props.todolists.hasOwnProperty(
      this.state.selectedListId
    );
    const listIds = Object.keys(this.props.todolists);
    const hasList = listIds.length > 0;

    if (!isValid && hasList) {
      // If the current todolist is invalid and there are todolists, select the first one.
      this.setState({ selectedListId: listIds[0] });
    } else if (!isValid && this.state.selectedListId !== null) {
      // If the current todolist is set but there are no todolists, select null.
      this.setState({ selectedListId: null });
    }
  }

  componentDidMount() {
    this.ensureValidListId();
  }

  componentDidUpdate(prevProps, prevState) {
    this.ensureValidListId();
  }

  render() {
    if (Cache.getCurrentTeamData()._state.todolists._initial) {
      Cache.refreshTeamCacheCategory(this.props.team.id, "todolists");
    }
    if (Cache.getCurrentTeamData()._state.todolists._initial) {
      Cache.refreshTeamCacheCategory(this.props.team.id, "members");
    }

    let selectedList = Cache.getCurrentTeamData().todolists[this.state.selectedListId];

    return (
      <Dashboard.Dashboard
        title="ToDo"
        subtitle="(w.i.p) Behalte den Überblick über die Aufgaben deines Teams"
      >
        <Dashboard.DashboardColumn sizes={{ lg: 4 }}>
          <Dashboard.DashboardTile
            title="ToDo-Listen"
            help="Wechsle zwischen den ToDo-Listen deines Teams oder erstelle eine neue."
          >
            <ListSelector
              team={this.props.team}
              selectedListId={this.state.selectedListId}
              selectedList={selectedList}
              todolists={this.props.todolists}
              onListSelect={this.handleListSelect.bind(this)}
              isAdmin={this.props.isAdmin}
            />
          </Dashboard.DashboardTile>
          <Dashboard.DashboardTile title="Listendetails">
            <ListInfo
              team={this.props.team}
              selectedListId={this.state.selectedListId}
              selectedList={selectedList}
              isAdmin={this.props.isAdmin}
            />
          </Dashboard.DashboardTile>
        </Dashboard.DashboardColumn>
        <Dashboard.DashboardColumn sizes={{ lg: 8 }}>
          <Dashboard.DashboardTile title="ToDo-Liste"></Dashboard.DashboardTile>
        </Dashboard.DashboardColumn>
      </Dashboard.Dashboard>
    );
  }
}
