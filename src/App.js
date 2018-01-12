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
  "http://raw.githubusercontent.com/cmtoomey/DemoData/master/Current1.csv";

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
      hex: false
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
          zoom: 10.75,
          transitionDuration: 1000,
          transitionInterpolator: new FlyToInterpolator()
        }
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
          zoom: 10.75,
          transitionDuration: 1000,
          transitionInterpolator: new FlyToInterpolator()
        }
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
          zoom: 10.75,
          transitionDuration: 1000,
          transitionInterpolator: new FlyToInterpolator()
        }
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
        <button className="btn bg-lighten25" onClick={this.animate}>
          {" "}
          Animate{" "}
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
            height: 220,
            width: 310,
            zIndex: 1,
            backgroundColor: "#666",
            opacity: 0.25,
            borderRadius: 3,
            padding: 15,
            borderColor: "white",
            borderStyle: "solid",
            borderWidth: 1
          }}
        />
        <div
          className="prose prose--dark"
          style={{
            position: "absolute",
            left: 15,
            top: 15,
            height: 220,
            width: 310,
            zIndex: 1,
            padding: 15
          }}
        >
          <h2> Creative Destruction </h2>
          <h4>
            {this.state.datatype === "demo"
              ? this.state.data.length + " activities"
              : this.state.datatype === "build"
                ? this.state.data.length + " activities"
                : this.state.data.length + " activities "}
          </h4>
          <span
            style={{
              display: "inline-flex",
              paddingBottom: 10,
              paddingTop: 5,
              width: "100%"
            }}
          >
            <ControlSelect
              id="data"
              onChange={value => {
                this.toggle(value);
              }}
              themeControlSelect="bg-lighten25"
              value={this.state.datatype}
              options={[
                {
                  label: "Demolition Permits",
                  value: "demo"
                },
                {
                  label: "Building Permits",
                  value: "build"
                },
                {
                  label: "Actual Construction",
                  value: "actual"
                }
              ]}
            />
            <span
              style={{
                width: 10
              }}
            />
            {animateB}
          </span>
        </div>
        <ReactMapGL
          {...viewport}
          onViewportChange={this._onViewportChange.bind(this)}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mslee/cjc82djfg6rki2rojga31oblf"
        >
          {layer}
        </ReactMapGL>
      </div>
    );
  }
}

export default Root;
