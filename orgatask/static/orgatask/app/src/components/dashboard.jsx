"use strict";

/*
    This component is made to be reused. It represents a part of the dashboard.
*/

export class DashboardContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="container-fluid p-0">
        {this.props.children}
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
