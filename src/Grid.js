import React, { Component } from "react";
import DeckGL, { ScreenGridLayer } from "deck.gl";

export default class DeckGLOverlay extends Component {
  static get defaultViewport() {
    return {
      longitude: -122.40462851623948,
      latitude: 47.62465150615343,
      zoom: 11.07,
      maxZoom: 20,
      pitch: 0,
      bearing: 0
    };
  }

  render() {
    const { viewport, cellSize, data, type } = this.props;
    let minColor, maxColor;

    if (!data) {
      return null;
    }

    if (type === "demo") {
      minColor = [255, 255, 255, 0];
      maxColor = [0, 0, 0, 255];
    } else {
      minColor = [230, 230, 230, 0];
      maxColor = [149, 114, 178, 255];
    }

    const layer = new ScreenGridLayer({
      id: "grid",
      data,
      minColor: minColor,
      maxColor: maxColor,
      getPosition: d => d,
      cellSizePixels: cellSize
    });

    return <DeckGL {...viewport} layers={[layer]} />;
  }
}
