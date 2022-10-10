"use strict";

import { errorAlert } from "../../utils/alerts.js";
import * as Dashboard from "../dashboard.js";
import * as ToDo from "../../utils/todo.js";
import * as Navigation from "../../utils/navigation.js";
import * as Cache from "../../utils/cache.js";
import { TooltipIcon, Tooltip } from "../tooltips.js";

class ListViewItem extends React.Component {
  constructor(props) {
    super(props);

    this.markDone = this.markDone.bind(this);
    this.editItem = this.editItem.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
  }

  markDone() {
    ToDo.editToDoListItem(this.props.team.id, this.props.list.id, this.props.item.id, this.props.item.name, this.props.item.description, true).then(Navigation.renderPage);
  }

  editItem() {
    ToDo.editToDoListItemPopup(this.props.team, this.props.list, this.props.item).then(Navigation.renderPage);
  }

  deleteItem() {
    ToDo.deleteToDoListItemPopup(this.props.team, this.props.list, this.props.item).then(Navigation.renderPage);
  }

  render() {
    return (
      <tr>
        <td>
          {this.props.item.done ? (
            <a className="btn btn-success disabled" title="Erledigt">
              <i className="fas fa-fw fa-circle-check"></i>
            </a>
          ) : (
            <a
              className="btn btn-outline-success border-1"
              onClick={this.markDone}
              title="Als erledigt markieren"
            >
              <i className="far fa-fw fa-circle-check"></i>
            </a>
          )}
        </td>
        <td>
          <span>{this.props.item.name}</span>
        </td>
        <td>
          <a
            className="btn btn-outline-dark border-1"
            onClick={this.editItem}
            title="Bearbeiten"
          >
            <i className="fas fa-fw fa-pen-to-square"></i>
          </a>
        </td>
        <td>
          <a
            className="btn btn-outline-danger border-1"
            onClick={this.deleteItem}
            title="Löschen"
          >
            <i className="fas fa-fw fa-trash"></i>
          </a>
        </td>
        <td className="debug-only">{this.props.item.id}</td>
      </tr>
    );
  }
}

class ListView extends React.Component {
  constructor(props) {
    super(props);

    this.createItem = this.createItem.bind(this);
  }

  createItem(e) {
    e.preventDefault();
    let name = document.getElementById("newItemName").value;

    if (name === "") {
      errorAlert("Leeres Feld", "Bitte gib einen Namen ein");
    } else {
      ToDo.createToDoListItem(this.props.team.id, this.props.selectedList.id, name).then(() => {
        Navigation.renderPage();
        document.getElementById("newItemName").value = "";
      });
    }
  }

  render() {
    if (!this.props.selectedList) {
      return (
        <p className="ms-1 mb-0">
          Im ausgewählten Team ist noch keine ToDo-Liste vorhanden.{" "}
          {this.props.isAdmin ? (
            <TooltipIcon
              key="admin"
              title='Du kannst mit den "Liste erstellen"-Knopf eine neue Liste erstellen.'
            ></TooltipIcon>
          ) : (
            <TooltipIcon
              key="noadmin"
              title="Bitte wende dich an einen Admin dieses Teams, um eine neue Liste zu erstellen."
            ></TooltipIcon>
          )}
        </p>
      );
    }

    let items = Object.values(this.props.selectedList.items).map(item => {
      return (
        <ListViewItem
          key={item.id}
          item={item}
          list={this.props.selectedList}
          team={this.props.team}
        />
      );
    });

    return (
      <form onSubmit={this.createItem}>
        <table className="table table-borderless align-middle mb-0">
          <thead>
            <tr>
              <th className="p-0" style={{ width: "1px" }}></th>
              <th className="p-0"></th>
              <th className="p-0" style={{ width: "1px" }}></th>
              <th className="p-0" style={{ width: "1px" }}></th>
              <th className="p-0 debug-only"></th>
            </tr>
          </thead>
          <tbody>
            {items}
            <tr>
              {/* Create item */}
              <td>
                <a className="btn btn-outline-success border-1 disabled">
                  <i className="far fa-fw fa-circle-check"></i>
                </a>
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  id="newItemName"
                  placeholder="Neues Element hinzufügen"
                />
              </td>
              <td colSpan="2">
                <button type="submit" className="btn btn-success" title="Erstellen">
                  <i className="fas fa-fw fa-plus"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    );
  }
}

class ListSelectorRow extends React.Component {
  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect() {
    if (!this.props.isSelected) {
      this.props.onSelect(this.props.todolist.id);
    }
  }
  
  getStyle() {
    return {
      borderLeftWidth: "5px",
      borderLeftColor: this.props.todolist.color,
      borderLeftStyle: "solid",
      cursor: "pointer",
      opacity: this.props.isSelected ? 1 : 0.75,
      fontWeight: this.props.isSelected ? "bold" : "normal",
    };
  }

  render() {
    return (
      <div
        className="ps-2 py-1 mb-1 dm-invert dm-invert-children"
        style={this.getStyle()}
        onClick={this.handleSelect}
      >
        <span className="d-inline-block w-100">{this.props.todolist.name}</span>
      </div>
    );
  }
}

class ListSelector extends React.Component {
  constructor(props) {
    super(props);

    this.createList = this.createList.bind(this);
  }

  createList() {
    ToDo.createToDoListPopup(this.props.team).then((todolist) => {
      this.props.onListSelect(todolist.id);
    });
  }

  render() {
    let listview = [];
    if (Cache.getCurrentTeamData()._state.todolists._initial) {
      listview = [
        <p key="loading">Laden...</p>
      ];
    } else if (Object.keys(this.props.todolists).length === 0) {
      // Don't show a message if there are no lists, because the ListDetails component will show a message
    } else {
      listview = Object.values(this.props.todolists).map(lst => {
        return (
          <ListSelectorRow
            key={lst.id}
            todolist={lst}
            onSelect={this.props.onListSelect}
            isSelected={this.props.selectedListId === lst.id}
          />
        );
      });
    }

    let content = [];
    if (listview.length > 0) {
      content.push(
        <div key="todolistselect" id="todolistselect" className="mb-2">
          {listview}
        </div>
      );
    }

    if (this.props.isAdmin) {
      content.push(
        <button
          key="create"
          className="btn btn-outline-success"
          onClick={this.createList}
        >
          Liste erstellen
        </button>
      );
    } else {
      content.push(
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

    return content;
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
            <TooltipIcon key="admin" title='Du kannst mit den "Liste erstellen"-Knopf weiter oben eine neue Liste erstellen.'></TooltipIcon>
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
          className="btn btn-outline-dark me-2"
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
    // if (Cache.getCurrentTeamData()._state.todolists._initial) {
    //   Cache.refreshTeamCacheCategory(this.props.team.id, "members");
    // }

    let selectedList = Cache.getCurrentTeamData().todolists[this.state.selectedListId];

    return (
      <Dashboard.Page
        title="ToDo [Beta]"
        subtitle="Behalte den Überblick über die Aufgaben deines Teams"
      >
        <Dashboard.Column sizes={{ lg: 4 }}>
          <Dashboard.Tile
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
          </Dashboard.Tile>
          <Dashboard.Tile title="Listendetails">
            <ListInfo
              team={this.props.team}
              selectedListId={this.state.selectedListId}
              selectedList={selectedList}
              onListSelect={this.handleListSelect.bind(this)}
              isAdmin={this.props.isAdmin}
            />
          </Dashboard.Tile>
        </Dashboard.Column>
        <Dashboard.Column sizes={{ lg: 8 }}>
          <Dashboard.Tile title="ToDo-Liste">
            <ListView
              team={this.props.team}
              selectedListId={this.state.selectedListId}
              selectedList={selectedList}
              isAdmin={this.props.isAdmin}
            />
          </Dashboard.Tile>
        </Dashboard.Column>
      </Dashboard.Page>
    );
  }
}
