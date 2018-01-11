/* global window */
import React, { Component } from "react";
import DeckGL, { HexagonLayer } from "deck.gl";

const colorRange = [
  [1, 152, 189, 255],
  [73, 227, 206, 255],
  [216, 254, 181, 255],
  [254, 237, 177, 255],
  [254, 173, 84, 255],
  [209, 55, 78, 255]
];

const elevationScale = { min: 1, max: 50 };

const defaultProps = {
  radius: 175,
  upperPercentile: 100,
  coverage: .9
};

export default class DeckGLOverlay extends Component {
  static get defaultColorRange() {
    return colorRange;
  }

  static get defaultViewport() {
    return {
      longitude: -122.333959,
      latitude: 47.607459,
      zoom: 9,
      minZoom: 5,
      maxZoom: 15,
    };
  }

  constructor(props) {
    super(props);
    this.startAnimationTimer = null;
    this.intervalTimer = null;
    this.state = {
      elevationScale: elevationScale.min
    };

    this._startAnimate = this._startAnimate.bind(this);
    this._animateHeight = this._animateHeight.bind(this);
  }

  componentDidMount() {
    this._animate();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data.length !== this.props.data.length) {
      this._animate();
    }
  }

  componentWillUnmount() {
    this._stopAnimate();
  }

  _animate() {
    this._stopAnimate();

    // wait 1.5 secs to start animation so that all data are loaded
    this.startAnimationTimer = window.setTimeout(this._startAnimate, 1500);
  }

  _startAnimate() {
    this.intervalTimer = window.setInterval(this._animateHeight, 20);
  }

  _stopAnimate() {
    window.clearTimeout(this.startAnimationTimer);
    window.clearTimeout(this.intervalTimer);
  }

  _animateHeight() {
    if (this.state.elevationScale === elevationScale.max) {
      this._stopAnimate();
    } else {
      this.setState({ elevationScale: this.state.elevationScale + 1 });
    }
  }

  render() {
    const { viewport, data, radius, coverage } = this.props;

    if (!data) {
      return null;
    }

    const layers = [
      new HexagonLayer({
        id: "heatmap",
        colorRange,
        coverage,
        data,
        elevationRange: [0, 500],
        elevationScale: this.state.elevationScale,
        // extruded: true,
        getPosition: d => d,    
        opacity: 1,
        radius,
      })
    ];

    return <DeckGL {...viewport} layers={layers} />;
  }
}

DeckGLOverlay.displayName = "DeckGLOverlay";
DeckGLOverlay.defaultProps = defaultProps;
