"use strict";

/*
    Utility components
*/

export class HoverInfo extends React.Component {
  constructor(props) {
    super(props);
    this.icon = this.props.icon || "fas fa-info-circle";
  }

  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip();
  }

  render() {
    return (
      <abbr className={this.props.className} title={this.props.title} data-toggle="tooltip">
        <i className={"fa-fw "+this.props.icon}></i>
      </abbr>
    );
  }
}
