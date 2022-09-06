"use strict";

/*
    This component is used to render the sidebar.
    Most of it is inspired or copied from https://getbootstrap.com/docs/5.1/examples/sidebars/
*/

export default class AppSidebar extends React.Component {
  constructor(props) {
    super(props);
    this.getLinkClass = this.getLinkClass.bind(this);
    this.selectPage = this.selectPage.bind(this);
  }

  // Note: Calling this function with the page parameter returns a new function
  // that will be called when an event fires.
  selectPage = (page) => (e) => {
    this.props.onPageSelect(page);
  };

  getLinkClass(page) {
    if (page === this.props.page) {
      return "nav-link active";
    } else {
      return "nav-link text-white";
    }
  }

  render() {
    let adminPages = null;
    if (this.props.isAdmin) {
      adminPages = [
        <hr className="my-1" key="hr-admin" />,
        <li key="page-admin">
          <a
            href="#"
            className={this.getLinkClass("adminhome")+" text-decoration-line-through"} // TODO: Implement
            onClick={this.selectPage("adminhome")}
          >
            <i className="fas fa-fw fa-key" />
            Admin
          </a>
        </li>,
      ];
    }

    return (
      <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark sidebar h-100">
        <ul className="nav nav-pills flex-column mb-auto flex-nowrap overflow-auto">
          <li>
            <a
              href="#"
              className={this.getLinkClass("home")}
              onClick={this.selectPage("home")}
            >
              <i className="fas fa-fw fa-home" />
              Startseite
            </a>
          </li>
          <li>
            <a
              href="#"
              className={this.getLinkClass("teamlist")}
              onClick={this.selectPage("teamlist")}
            >
              <i className="fas fa-fw fa-user-group" />
              Teams
            </a>
          </li>
          <hr className="my-1" />
          <li>
            <a
              href="#"
              className={this.getLinkClass("teammanage")}
              onClick={this.selectPage("teammanage")}
            >
              <i className="fas fa-fw fa-users-viewfinder" />
              Team
            </a>
          </li>
          <li>
            <a
              href="#"
              className={this.getLinkClass("workingtime")}
              onClick={this.selectPage("workingtime")}
            >
              <i className="fas fa-fw fa-business-time" />
              Arbeitszeit
            </a>
          </li>
          <li>
            <a
              href="#"
              className={this.getLinkClass("calendars")}
              onClick={this.selectPage("calendars")}
            >
              <i className="fas fa-fw fa-calendar-days" />
              Kalender
            </a>
          </li>
          <li>
            <a
              href="#"
              className={this.getLinkClass("todo")}
              onClick={this.selectPage("todo")}
            >
              <i className="fas fa-fw fa-tasks" />
              ToDo
            </a>
          </li>
          {adminPages}
        </ul>
        <hr />
        <div className="dropup">
          <a
            href="#"
            className="d-flex align-items-center text-white text-decoration-none dropdown-toggle me-2"
            id="dropdownUser1"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <img
              src={this.props.user.avatar_url}
              alt=""
              width="32"
              height="32"
              className="rounded-circle me-2"
            />
            <strong className="me-2">{this.props.user.username}</strong>
          </a>
          <ul
            className="dropdown-menu dropdown-menu-dark text-small shadow"
            aria-labelledby="dropdownUser1"
          >
            <li>
              <a className="dropdown-item" href="/account/?next=/orgatask/app/">
                <i className="me-2 fas fa-fw fa-user"></i>
                Account
              </a>
            </li>
            <li>
              <a
                className="dropdown-item"
                href="https://de.gravatar.com/"
                target="_blank"
              >
                <i className="me-2 fas fa-fw fa-arrow-up-right-from-square"></i>
                Avatar
              </a>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <a
                className="dropdown-item"
                href="/account/logout?next=/orgatask/"
              >
                <i className="me-2 fas fa-fw fa-arrow-right-from-bracket"></i>
                Ausloggen
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}
