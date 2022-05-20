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
    
    return (
      <div
        className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark sidebar h-100"
        style={{ width: "280px" }}
      >
        <ul className="nav nav-pills flex-column mb-auto">
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
        </ul>
        <hr />
        <div className="dropup">
          <a
            href="#"
            className="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
            id="dropdownUser1"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{whiteSpace: "pre"}}
          >
            <img
              src={this.props.user.avatarUrl}
              alt=""
              width="32"
              height="32"
              className="rounded-circle me-2"
            />
            <strong>{this.props.user.username} </strong>
          </a>
          <ul
            className="dropdown-menu dropdown-menu-dark text-small shadow"
            aria-labelledby="dropdownUser1"
          >
            <li>
              <a className="dropdown-item" href="/account/?next=/orgatask/">
                Account
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
                Ausloggen
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}
