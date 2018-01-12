/* global window */
import React, { Component } from "react";
import DeckGL, { HexagonLayer } from "deck.gl";

const LIGHT_SETTINGS = {
  lightsPosition: [-122.490263, 47.602755, 1000],
  ambientRatio: 0.75,
  diffuseRatio: 0.4,
  specularRatio: 0.2,
  lightsStrength: [0.8, 0.0],
  numberOfLights: 1
};

const colorRange = [
  [169, 217, 194, 255],
  [129, 203, 170, 255],
  [98, 173, 141, 255],
  [95, 153, 126, 255],
  [28, 132, 98, 255]
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
      longitude: -122.40462851623948,
      latitude: 47.62465150615343,
      zoom: 10.74,
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
        lightSettings: LIGHT_SETTINGS,
        elevationRange: [0, 300],
        elevationScale: this.state.elevationScale,
        extruded: true,
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
