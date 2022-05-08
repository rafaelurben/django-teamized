"use strict";

/*
    This component is made to be reused. It represents a part of the dashboard.
*/

export class Dashboard extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let content = [];

    if (this.props.hasOwnProperty("title")) {
      content.push(
        <h4 key="title" className="dashboard-title mt-3 ms-3 text-bold">{this.props.title}</h4>
      );
    }
    if (this.props.hasOwnProperty("subtitle")) {
      content.push(
        <h5 key="subtitle" className="dashboard-subtitle mt-2 ms-3">{this.props.subtitle}</h5>
      )
    }
    if (this.props.hasOwnProperty("text")) {
      content.push(
        <p key="text" className="dashboard-text mt-2 ms-3">
          {this.props.text}
        </p>
      );
    }
    content.push(this.props.children)

    return (
      <div className="container-fluid p-0">
        {content}
      </div>
    );
  }
}

export class DashboardColumn extends React.Component {
  constructor(props) {
    super(props);

    let sizes = props.sizes || {};

    this.colClass = `col-${props.size}`;
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
    return (
      <div className="dashboard-tile row border border-dark rounded rounded-5 p-2 m-3 overflow-scroll">
        {this.props.children}
      </div>
    );
  }
}
