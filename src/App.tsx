import React, { Component } from "react";
import { Circle } from "./WeatherRadial";
import "./App.css";

class App extends Component {
  render() {
    return (
      <div id="main">
        <h1>Weather Radials / 2017</h1>
        <Circle />
      </div>
    );
  }
}

export default App;
