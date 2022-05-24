"use strict";

/*
    Utility components
*/

export class HoverInfo extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <abbr title={this.props.title}>
        <i className="fas fa-fw fa-info-circle"></i>
      </abbr>
    );
  }
}
