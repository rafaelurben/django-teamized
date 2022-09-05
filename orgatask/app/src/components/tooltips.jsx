"use strict";

/*
    Tooltip components
*/

export class Tooltip extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip();
  }

  render() {
    return (
      <abbr className={this.props.className} title={this.props.title} data-toggle="tooltip">
        {this.props.children}
      </abbr>
    );
  }
}

export class TooltipIcon extends React.Component {
  constructor(props) {
    super(props);
    this.icon = this.props.icon || "fas fa-info-circle";
  }

  render() {
    return (
      <Tooltip className={this.props.className} title={this.props.title}>
        <i className={"fa-fw " + this.icon}></i>
      </Tooltip>
    );
  }
}
