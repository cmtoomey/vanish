import React, { Component } from "react";
import DeckGL, { ScreenGridLayer } from "deck.gl";

export default class DeckGLOverlay extends Component {
  static get defaultViewport() {
    return {
      longitude: -122.333959,
      latitude: 47.607459,
      zoom: 10,
      maxZoom: 20,
      pitch: 0,
      bearing: 0
    };
  }

  render() {
    const { viewport, cellSize, data } = this.props;

    if (!data) {
      return null;
    }

    const layer = new ScreenGridLayer({
      id: "grid",
      data,
      minColor: [255, 0, 255, 0],
      // maxColor: [255, 0, 129, 255],
      getPosition: d => d,
      cellSizePixels: cellSize
    });

    return <DeckGL {...viewport} layers={[layer]} />;
  }
}
