"use strict";

import { IconTooltip } from "./tooltips.js";

/*
    These components create the basic dashboard layout (and style).
*/

export class Page extends React.Component {
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

export class Column extends React.Component {
  constructor(props) {
    super(props);

    let size = props.size || 12;
    let sizes = props.sizes || {};

    this.className = `dashboard-column d-flex flex-column col-${size}`;
    for (let breakpoint of Object.keys(sizes)) {
      this.className += ` col-${breakpoint}-${sizes[breakpoint]}`;
    }
    if (this.props.hasOwnProperty("grow")) {
      this.className += " flex-grow-1";
    }
    if (this.props.hasOwnProperty("className")) {
      this.className += ` ${this.props.className}`;
    }
  }

  render() {
    return (
      <div className={this.className}>
        {this.props.children}
      </div>
    );
  }
}

export class Row extends React.Component {
  constructor(props) {
    super(props);

    this.className = `dashboard-row row w-100 g-0`;
    if (this.props.hasOwnProperty("grow")) {
      this.className += " flex-grow-1";
    }
    if (this.props.hasOwnProperty("className")) {
      this.className += ` ${this.props.className}`;
    }
  }

  render() {
    return (
      <div className={this.className}>
        {this.props.children}
      </div>
    );
  }
}

export class Tile extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let header = [];

    if (this.props.hasOwnProperty("title")) {
      header.push(
        <h5 key="title" className="dashboard-tile-title pt-2 text-bold"  style={{flexBasis: 0}}>
          {this.props.title}
          {this.props.help ? <IconTooltip className="ms-2 small" title={this.props.help} /> : null}
        </h5>
      );
    }
    if (this.props.hasOwnProperty("title")) {
      header.push(
        <hr key="hr" className="m-0"/>
      );
    }

    this.className = "dashboard-tile row border border-dark rounded rounded-5 mx-2 mb-3 mt-0 flex-column";
    if (this.props.hasOwnProperty("grow")) {
      this.className += " flex-grow-1";
    }
    if (this.props.hasOwnProperty("className")) {
      this.className += ` ${this.props.className}`;
    }

    return (
      <div className={this.className}>
        {header}
        <div className="p-2 w-100 overflow-auto flex-grow-1">
          {this.props.children}
        </div>
      </div>
    );
  }
}
