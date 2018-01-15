import React, { Component } from "react";
import ReactMapGL, { FlyToInterpolator } from "react-map-gl";
import Grid from "./Grid";
import Heatmap from "./Heatmap";
import { csv as requestCSV } from "d3-request";
import "rc-slider/assets/index.css";
import ControlSelect from "@mapbox/react-control-select";
import buildDates from "./buildDates";
import demoDates from "./demoDates";

// Set your mapbox token here
const MAPBOX_TOKEN =
  "pk.eyJ1IjoiY2hyaXN0b29tZXkiLCJhIjoiY2phMnVxc2p4M2NmbTM0cGM4aXpscGtmZyJ9.Pap5yG2c5LwCWAXuQwq7pg";

const DemoURL =
  "https://raw.githubusercontent.com/cmtoomey/DemoData/master/Demo1.csv";

const BuildURL =
  "https://raw.githubusercontent.com/cmtoomey/DemoData/master/Build1.csv";

const CurrentURL =
  "https://raw.githubusercontent.com/cmtoomey/DemoData/master/Current1.csv";

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        ...Grid.defaultViewport,
        width: 100,
        height: 100
      },
      date: demoDates,
      datatype: "demo",
      data: [],
      hex: false,
      year: 2000
    };

    this.request(DemoURL, "demo");
  }

  request = (url, type) => {
    requestCSV(url, (error, response) => {
      let results = response.map(value => {
        return [Number(value.Longitude), Number(value.Latitude)];
      });
      if (type === "actual") {
        this.setState({
          hex: true,
          data: results,
          datatype: type
        });
      } else if (type === "demo") {
        this.setState({
          hex: false,
          data: results,
          datatype: type,
          date: demoDates
        });
      } else {
        this.setState({
          hex: false,
          data: results,
          datatype: type,
          date: buildDates
        });
      }
    });
  };

  toggle = value => {
    let url;
    if (value === "demo") {
      url = DemoURL;
      this.setState({
        viewport: {
          ...this.state.viewport,
          longitude: -122.40462851623948,
          latitude: 47.62465150615343,
          bearing: 0,
          pitch: 0,
          zoom: 11.07,
          transitionDuration: 1000,
          transitionInterpolator: new FlyToInterpolator()
        },
        year: ""
      });
    } else if (value === "build") {
      url = BuildURL;
      this.setState({
        viewport: {
          ...this.state.viewport,
          longitude: -122.40462851623948,
          latitude: 47.62465150615343,
          bearing: 0,
          pitch: 0,
          zoom: 11.07,
          transitionDuration: 1000,
          transitionInterpolator: new FlyToInterpolator()
        },
        year: ""
      });
    } else {
      url = CurrentURL;
      this.setState({
        viewport: {
          ...this.state.viewport,
          latitude: 47.65116530660421,
          longitude: -122.36586473598015,
          bearing: 41.25,
          pitch: 35.04,
          zoom: 10.9,
          transitionDuration: 1000,
          transitionInterpolator: new FlyToInterpolator()
        },
        year: ""
      });
    }
    this.request(url, value);
  };

  animate = () => {
    let url;
    if (this.state.date.length === 13) {
      url = DemoURL;
    } else {
      url = BuildURL;
    }
    requestCSV(url, (error, response) => {
      for (let i = 0; i < this.state.date.length; i++) {
        setTimeout(() => {
          this.setState({ year: String(this.state.date[i]) });
          let filteredData = response.filter(
            row => row.Year === String(this.state.date[i])
          );
          let results = filteredData.map(value => {
            return [Number(value.Longitude), Number(value.Latitude)];
          });
          this.setState({ data: results });
        }, 300 * (i + 1));
      }
    });
  };

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
      viewport: {
        ...this.state.viewport,
        ...viewport
      }
    });
  }

  render() {
    const { viewport, data } = this.state;
    let layer, animateB;

    if (!this.state.hex) {
      layer = (
        <Grid
          viewport={this.state.viewport}
          data={data}
          cellSize={25}
          hex={this.state.hex}
          type={this.state.datatype}
        />
      );
    } else {
      layer = <Heatmap viewport={viewport} data={data} />;
    }

    if (this.state.datatype === "actual") {
      animateB = (
        <button disabled className="btn">
          Animate
        </button>
      );
    } else {
      animateB = (
        <button
          className="txt-fancy"
          style={{
            color: "black",
            borderStyle: "solid",
            borderWidth: 2,
            borderColor: "black",
            paddingLeft: 15,
            paddingRight: 15,
            borderRadius: 8
          }}
          onClick={this.animate}
        >
          Animate
        </button>
      );
    }

    return (
      <div>
        <div
          style={{
            position: "absolute",
            left: 15,
            top: 15,
            height: 320,
            width: 325,
            zIndex: 1,
            backgroundColor: "#666",
            opacity: .75,
            borderRadius: 3,
            padding: 15
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 15,
            top: 15,
            height: 220,
            width: 310,
            zIndex: 1,
            paddingLeft: 15,
            paddingTop: 15
          }}
        >
          <div
            className="txt-fancy txt-h2-mm"
            style={{ color: "black", paddingBottom: 8 }}
          >
            CREATIVE DESTRUCTION
          </div>
          <span
            style={{
              display: "inline-flex",
              paddingBottom: 5,
              paddingTop: 5,
              width: "100%",
              textAlign: "center"
            }}
          >
            <div
              className="txt-fancy"
              style={{
                position: "relative",
                color: "black",
                width: "70%",
                fontSize: 18,
                textAlign: "left"
              }}
            >
              {this.state.datatype === "demo"
                ? this.state.data.length + " activities"
                : this.state.datatype === "build"
                  ? this.state.data.length + " activities"
                  : this.state.data.length + " activities "}
            </div>
            <div
              className="txt-fancy"
              style={{
                position: "relative",
                color: "black",
                width: "30%",
                fontSize: 18
              }}
            >
              {this.state.year}
            </div>
          </span>
          <span
            style={{
              display: "inline-flex",
              paddingBottom: 8,
              paddingTop: 5,
              width: "100%"
            }}
          >
            <ControlSelect
              id="data"
              onChange={value => {
                this.toggle(value);
              }}
              themeControlSelect="round-bold border border--2 color-black bg-transparent txt-fancy"
              value={this.state.datatype}
              options={[
                {
                  label: "Demolitions",
                  value: "demo"
                },
                {
                  label: "New Construction",
                  value: "build"
                },
                {
                  label: "Active Construction",
                  value: "actual"
                }
              ]}
            />
            <span
              style={{
                paddingLeft: 8,
                paddingRight: 8
              }}
            />
            {animateB}
          </span>
          <div style={{height: 20}}/>
          <svg
            width="300"
            height="300"
            viewBox="0 0 120 120"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="" y="0" width="6" height="6" />
            <rect x="0" y="15" width="6" fill="rgb(149, 114, 178)" height="6" />
            <rect x="0" y="30" width="6" fill="rgb(28, 132, 98)" height="6" />
            <text x="10" y="5" className="txt-fancy" font-size="6" fill="black">Demolitions</text>
            <text x="10" y="20" className="txt-fancy" font-size="6" fill="black">New Construction</text>
            <text x="10" y="35" className="txt-fancy" font-size="6" fill="black">Active Construction</text>
          </svg>
            </div>
        <ReactMapGL
          {...viewport}
          onViewportChange={this._onViewportChange.bind(this)}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          //These are the progressive map styles
          // mapStyle="mapbox://styles/mapbox/light-v9"
          // mapStyle="mapbox://styles/mapbox/dark-v9"
          // mapStyle="mapbox://styles/mslee/cjc82djfg6rki2rojga31oblf"
          mapStyle="mapbox://styles/mslee/cjcche7xf094x2rmmsl9f3bsn"
        >
          {layer}
        </ReactMapGL>
      </div>
    );
  }
}

export default Root;
