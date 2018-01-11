import React, { Component } from "react";
import MapGL from "react-map-gl";
import Grid from "./Grid";
import Heatmap from "./Heatmap";
import { csv as requestCSV } from "d3-request";
import ControlRadioSet from "@mapbox/react-control-radio-set";
import ControlSwitch from "@mapbox/react-control-switch";
import ControlRange from "@mapbox/react-control-range";
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
      date: demoDates,
      switch: false,
      year: 2005
    };

    requestCSV(DemoURL, (error, response) => {
      let filterArray = response.filter(
        row => row.Category === this.state.type
      );
      let filterDate = filterArray.filter(
        row => row.Application_Date.substring(6, 10) === String(this.state.year)
      );
      let results = filterDate.map((value, index) => {
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
    let url;

    if (!value) {
      this.setState({ datatype: value, date: demoDates, year: demoDates[0] });
      url = DemoURL;
    } else {
      this.setState({ datatype: value, date: buildDates, year: buildDates[0] });
      url = BuildURL;
    }

    requestCSV(url, (error, response) => {
      let filterArray = response.filter(
        row => row.Category === this.state.type
      );
      let filterDate = filterArray.filter(
        row => row.Application_Date.substring(6, 10) === String(this.state.year)
      );
      let results = filterDate.map((value, index) => {
        return [Number(value.Longitude), Number(value.Latitude)];
      });
      this.setState({ data: results });
    });
  };

  handleRadio = (value, id) => {
    let url;

    if (!this.state.datatype) {
      url = DemoURL;
    } else {
      url = BuildURL;
    }

    requestCSV(url, (error, response) => {
      let filterArray = response.filter(row => row.Category === value);
      let filterDate = filterArray.filter(
        row => row.Application_Date.substring(6, 10) === String(this.state.year)
      );
      let results = filterDate.map((value, index) => {
        return [Number(value.Longitude), Number(value.Latitude)];
      });
      this.setState({ data: results, type: value });
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

  handleSlide = (value) => {
    let url;

    if (!this.state.datatype) {
      url = DemoURL;
    } else {
      url = BuildURL;
    }

    requestCSV(url, (error, response) => {
      let filterArray = response.filter(row => row.Category === this.state.type);
      let filterDate = filterArray.filter(
        row => row.Application_Date.substring(6, 10) === String(value)
      );
      let results = filterDate.map((value, index) => {
        return [Number(value.Longitude), Number(value.Latitude)];
      });
      this.setState({ data: results, year: value });
    });
  } 

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
          className="prose prose--dark"
          style={{ position: "absolute", zIndex: 1, left: 15 }}
        >
          <h1>Creative Destruction</h1>
          <p>{!this.state.year ? "All Dates" : this.state.year}</p>
          <p>
            {!this.state.datatype
              ? "Demolition Permits: " + this.state.data.length
              : "Construction Permits: " + this.state.data.length}
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            left: 15,
            top: 135,
            height: 210,
            width: 125,
            zIndex: 1,
            backgroundColor: "white",
            borderRadius: 10,
            padding: 10
          }}
        >
          <ControlRadioSet
            onChange={this.handleRadio}
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
          <ControlRange
            id="time"
            onChange={this.handleSlide}
            min={this.state.date[0]}
            max={2017}
            step={1}
            value={this.state.year}
          />
        </div>
        <MapGL
          {...viewport}
          onViewportChange={this._onViewportChange.bind(this)}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mslee/cjc82djfg6rki2rojga31oblf"
        >
          {layer}
        </MapGL>
      </div>
    );
  }
}

export default Root;
