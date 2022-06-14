"use strict";

import * as Dashboard from "../dashboard.js";
import * as Utils from "../../utils/utils.js";

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
        <Dashboard.DashboardColumn>
          
        </Dashboard.DashboardColumn>
        <div className="w-50 position-fixed bottom-0 end-0 text-end">
          <a onClick={Utils.toggleDebug} className="btn text-white">Toggle DEBUG mode</a>
        </div>
      </Dashboard.Dashboard>
    );
  }
}
