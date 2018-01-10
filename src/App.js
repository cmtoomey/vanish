import React, { Component } from "react";
import MapGL from "react-map-gl";
import Grid from "./Grid";
import Heatmap from "./Heatmap";
import { csv as requestCSV } from "d3-request";
import ControlRadioSet from "@mapbox/react-control-radio-set";
import ControlSwitch from "@mapbox/react-control-switch";
import buildDates from "./buildDates";
import demoDates from "./demoDates";

// Set your mapbox token here
const MAPBOX_TOKEN =
  "pk.eyJ1IjoiY2hyaXN0b29tZXkiLCJhIjoiY2phMnVxc2p4M2NmbTM0cGM4aXpscGtmZyJ9.Pap5yG2c5LwCWAXuQwq7pg";

const DemoURL =
  "https://raw.githubusercontent.com/cmtoomey/DemoData/master/Demo.csv";

const BuildURL =
  "https://raw.githubusercontent.com/cmtoomey/DemoData/master/Build.csv";

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
      datatype: false,
      date: [],
      slide: 10,
      switch: false
    };

    requestCSV(DemoURL, (error, response) => {
      let filterArray = response.filter(
        row => row.Category === this.state.type
      );
      let results = filterArray.map((value, index) => {
        return [Number(value.Longitude), Number(value.Latitude)];
      });
      this.setState({ data: results });
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

  handleDataToggle = (value, id) => {
    this.setState({ datatype: value });
    let url;
    if (!value) {
      url = DemoURL;
    } else {
      url = BuildURL;
    }
    requestCSV(url, (error, response) => {
      let filterArray = response.filter(
        row => row.Category === this.state.type
      );
      let results = filterArray.map((value, index) => {
        return [Number(value.Longitude), Number(value.Latitude)];
      });
      this.setState({ data: results });
    });
  };

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

  animate = () => {
    let url, dates;
    if (!this.state.datatype) {
      url = DemoURL;
      dates = demoDates;
    } else {
      url = BuildURL;
      dates = buildDates;
    }
    requestCSV(url, (error, response) => {
      let filterArray = response.filter(
        row => row.Category === this.state.type
      );
      for (let i = 0; i < dates.length; i++) {
        setTimeout(() => {
          let filterDates = filterArray.filter(row => row.Application_Date.substr(6) === dates[i]);
          let results = filterDates.map(value => {
            return [Number(value.Longitude), Number(value.Latitude)]
          });
          this.setState({data: results});
        }, 100 * i)
      }
    });
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
            height: 210,
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
            id="switch-data"
            label="Toggle Data"
            onChange={this.handleDataToggle}
            value={this.state.datatype}
          />
          <ControlSwitch
            id="activate-hex"
            label="Hex Mode"
            onChange={this.handleSwitch}
            value={this.state.switch}
          />
          <button className="btn btn--stroke btn--s" onClick={this.animate}>
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
