"use strict";

/*
    This component is made to be reused. It represents a part of the dashboard.
*/

export class Dashboard extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let header = [];

    if (this.props.hasOwnProperty("title")) {
      header.push(
        <h4 key="title" className="dashboard-title mt-3 mx-3 text-bold">{this.props.title}</h4>
      );
    }
    if (this.props.hasOwnProperty("subtitle")) {
      header.push(
        <h5 key="subtitle" className="dashboard-subtitle mt-2 mx-3">{this.props.subtitle}</h5>
      )
    }
    if (this.props.hasOwnProperty("text")) {
      header.push(
        <p key="text" className="dashboard-text mt-2 mx-3">
          {this.props.text}
        </p>
      );
    }

    return (
      <div className="dashboard container-fluid p-0">
        {header}
        <div className="dashboard-row row w-100 g-0 ms-0 px-2 pt-2">
            {this.props.children}
        </div>
      </div>
    );
  }
}

export class DashboardColumn extends React.Component {
  constructor(props) {
    super(props);

    let size = props.size || 12;
    let sizes = props.sizes || {};

    this.colClass = `dashboard-column col-${size}`;
    for (let breakpoint of Object.keys(sizes)) {
      this.colClass += ` col-${breakpoint}-${sizes[breakpoint]}`;
    }
  }

  render() {
    return (
      <div className={this.colClass}>
        {this.props.children}
      </div>
    );
  }
}

export class DashboardTile extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let header = [];

    if (this.props.hasOwnProperty("title")) {
      header.push(
        <h5 key="title" className="dashboard-tile-title pt-2 text-bold">
          {this.props.title}
        </h5>
      );
    }
    if (this.props.hasOwnProperty("title")) {
      header.push(
        <hr key="hr" className="m-0"/>
      );
    }

    return (
      <div className="dashboard-tile row border border-dark rounded rounded-5 mx-2 mb-3 mt-0">
        {header}
        <div className="p-2 w-100 overflow-scroll">
          {this.props.children}
        </div>
      </div>
    );
  }
}
