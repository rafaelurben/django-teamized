"use strict";

/*
    Utility components
*/

export class HoverInfo extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip();
  }

  render() {
    return (
      <abbr title={this.props.title} data-toggle="tooltip">
        <i className="fas fa-fw fa-info-circle"></i>
      </abbr>
    );
  }
}
