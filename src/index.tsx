import "./index.css";
import { WeatherRadial, ETLWeatherData } from "./WeatherRadial";
import * as d3 from "d3";

[
  ["San Francisco", "sf_weather_2017.csv"],
  ["Austin", "austin_2017.csv"],
  ["Los Angeles", "los_angeles_2017.csv"],
  ["Seattle", "seattle_2017.csv"],
  ["New York City", "nyc_2017.csv"],
  ["Cleveland", "cleveland_2017.csv"]
].forEach(async ([label, csvFile]) =>
  WeatherRadial(
    d3.select("body"),
    label,
    (await d3.csv(csvFile)).map(ETLWeatherData)
  )
);
