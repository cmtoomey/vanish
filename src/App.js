import React, { Component } from "react";
import MapGL from "react-map-gl";
import Grid from "./Grid";
import Heatmap from "./Heatmap";
import { csv as requestCSV } from "d3-request";
import ControlRadioSet from "@mapbox/react-control-radio-set";
import ControlSwitch from "@mapbox/react-control-switch";

// Set your mapbox token here
const MAPBOX_TOKEN =
  "pk.eyJ1IjoiY2hyaXN0b29tZXkiLCJhIjoiY2phMnVxc2p4M2NmbTM0cGM4aXpscGtmZyJ9.Pap5yG2c5LwCWAXuQwq7pg";

const DemoURL =
  "https://raw.githubusercontent.com/cmtoomey/DemoData/master/Demo.csv";

// const BuildURL =
//   "https://raw.githubusercontent.com/cmtoomey/DemoData/master/Build.csv";

const demoDates = [];
const buildDates = [];

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        ...Grid.defaultViewport,
        width: 100,
        height: 100
      },
      data: [],
      type: "COMMERCIAL",
      date: [],
      slide: 10,
      switch: false
    };

    requestCSV(DemoURL, (error, response) => {
      let array = response.map((value, index) => {
        return [Number(value.Longitude), Number(value.Latitude)];
      });
      this.setState({ data: array });
    });
  }

  componentDidMount() {
    window.addEventListener("resize", this._resize.bind(this));
    this._resize();
  }

  _resize() {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onViewportChange(viewport) {
    this.setState({
      viewport: { ...this.state.viewport, ...viewport }
    });
  }

  handleChange = (value, id) => {
    this.setState({ type: value });
    requestCSV(DemoURL, (error, response) => {
      let filterArray = response.filter(row => row.Category === value);
      let results = filterArray.map((value, index) => {
        return [Number(value.Longitude), Number(value.Latitude)];
      });
      this.setState({ data: results });
    });
  };

  handleSwitch = (value, id) => {
    this.setState({
      switch: value
    });
    if (!value) {
      this.setState({
        viewport: {
          ...this.state.viewport,
          bearing: 0,
          pitch: 0
        }
      });
    } else {
      this.setState({
        viewport: {
          ...this.state.viewport,
          bearing: 41.25,
          pitch: 35.04,
          zoom: 10
        }
      });
    }
  };

  render() {
    const { viewport, data } = this.state;
    let layer;

    if (!this.state.switch) {
      layer = (
        <Grid
          viewport={this.state.viewport}
          data={data}
          cellSize={25}
          hex={this.state.switch}
        />
      );
    } else {
      layer = <Heatmap viewport={viewport} data={data || []} />;
    }

    return (
      <div>
        <div
          style={{
            position: "absolute",
            left: 15,
            top: 15,
            height: 190,
            width: 125,
            zIndex: 1,
            backgroundColor: "white",
            borderRadius: 10,
            padding: 10
          }}
        >
          <ControlRadioSet
            onChange={this.handleChange}
            id="home"
            value={this.state.type}
            options={[
              {
                label: "Commercial",
                value: "COMMERCIAL"
              },
              {
                label: "Industrial",
                value: "INDUSTRIAL"
              },
              {
                label: "Institutional",
                value: "INSTITUTIONAL"
              },
              {
                label: "Multi-Family",
                value: "MULTIFAMILY"
              },
              {
                label: "Single-Family",
                value: "SINGLE FAMILY / DUPLEX"
              }
            ]}
          />
          <ControlSwitch
            id="activate-hex"
            label="Hex Mode"
            onChange={this.handleSwitch}
            value={this.state.switch}
          />
          <button
            className="btn btn--stroke btn--s"
            onClick={() => {
              console.log("yolo");
            }}
          >
            ANIMATE
          </button>
        </div>
        <MapGL
          {...viewport}
          onViewportChange={this._onViewportChange.bind(this)}
          mapboxApiAccessToken={MAPBOX_TOKEN}
        >
          {layer}
        </MapGL>
      </div>
    );
  }
}

export default Root;
