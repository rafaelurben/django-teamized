"use strict";

import * as Dashboard from "../dashboard.js";

export default class Page_Home extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Dashboard.Dashboard
        title={`Hallo ${this.props.user.first_name}`}
        subtitle="Verwende die Menu- und Seitenleiste, um zu navigieren."
      >
        <Dashboard.DashboardColumn size="12">
          
        </Dashboard.DashboardColumn>
      </Dashboard.Dashboard>
    );
  }
}
