import React from "react";
import * as d3 from "d3";
import dayjs from "dayjs";

type WeatherData = {
  date: Date;
  name: string;
  prcp: number;
  tavg: number;
  tmax: number;
  tmin: number;
};

const ETLWeatherData = (wd: any): WeatherData => ({
  name: wd.NAME,
  tavg: +wd.TAVG,
  tmax: +wd.TMAX,
  tmin: +wd.TMIN,
  prcp: +wd.PRCP,
  date: dayjs(wd.DATE).toDate()
});

export class Circle extends React.Component {
  async componentDidMount() {
    [
      ["San Francisco", "sf_weather_2017.csv"],
      ["Austin", "austin_2017.csv"],
      ["Los Angeles", "los_angeles_2017.csv"],
      ["Seattle", "seattle_2017.csv"],
      ["New York City", "nyc_2017.csv"],
      ["Cleveland", "cleveland_2017.csv"]
    ].forEach(async ([label, csvFile]) =>
      CircleRender(label, (await d3.csv(csvFile)).map(ETLWeatherData))
    );
  }
  render() {
    return <div id="weather-radials" />;
  }
}

function CircleRender(city: string, data: WeatherData[]) {
  let svg = d3.select("#weather-radials").append("svg");

  svg
    .attr("viewBox", "0 0 1000 1000")
    .attr("width", 700)
    .attr("height", 700);

  let originX = 500;
  let originY = 500;
  let outerCircleRadius = 400;

  let barWidth = 3;
  let barOriginX = originX + outerCircleRadius * Math.sin(0);
  let barOriginY = originY - outerCircleRadius * Math.cos(0);

  const allTemps = data.reduce(
    (p, n) => [...p, n.tmin, n.tmax],
    [] as number[]
  );

  let extent = d3.extent(allTemps) as [number, number];

  let dayScale = d3
    .scaleLinear()
    .domain([0, 365])
    .range([0, 360]);

  let tempScaleInvert = d3
    .scaleLinear()
    .domain([-40, 40])
    .range([outerCircleRadius, 0]);

  const monthScale = d3
    .scaleLinear()
    .domain([0, 12])
    .range([0, 360]);

  const MONTHS = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC"
  ];

  svg
    .append("text")
    .text(city.toUpperCase())
    .attr("transform", `translate(${originX},${originY})`)
    .attr("text-anchor", "middle")
    .attr("font-size", "3.5rem")
    .attr("fill", "#6f6f6f")
    .attr("y", "0.75rem");

  const monthLabels = svg
    .selectAll("g.month-label")
    .data(MONTHS)
    .enter()
    .append("g")
    .classed("month-label", true);

  monthLabels
    .append("line")
    .attr("stroke", "black")
    .attr("x1", 0)
    .attr("x2", 0)
    .attr("y2", 20);

  monthLabels
    .attr(
      "transform",
      (d, i) =>
        `rotate(${monthScale(
          i
        )},${originX},${originY}) translate(${originX},${barOriginY - 35})`
    )
    .append("text")
    .attr("fill", "black")
    .attr("x", 10)
    .attr("y", 10)
    .text(function(d) {
      return d.toUpperCase();
    });

  let tempScale = d3
    .scaleLinear()
    .domain([-40, 40])
    .range([0, outerCircleRadius]);

  let circles = svg
    .selectAll(".circle-ticks")
    .data(tempScale.ticks(7))
    .enter()
    .append("circle")
    .classed("circle-ticks", true)
    .attr("r", function(d) {
      return tempScale(d);
    })
    .style("fill", "none")
    .attr("cy", originY)
    .attr("cx", originX)
    .style("stroke", "black")
    .style("stroke-dasharray", "2,2")
    .style("stroke-width", ".5px");

  svg.selectAll(".circle-ticks:nth-of-type(2)").remove();

  let formatNumber = d3.format("-");
  let xAxis = d3
    .axisLeft(tempScaleInvert)
    .ticks(5)
    .tickFormat(d => formatNumber(d) + " °C");

  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(${barOriginX},${barOriginY})`)
    .call(xAxis as any);

  svg.select(".domain").remove();
  svg.selectAll(".tick line").remove();
  svg
    .selectAll(".tick")
    .insert("rect", ":first-child")
    .attr("width", "43")
    .attr("height", "10")
    .attr("fill", "#FFF")
    .attr("transform", "translate(-20,-5)");

  svg
    .selectAll(".tick text")
    .style("text-anchor", "middle")
    .attr("transform", "translate(10,0)")
    .style("padding-right", 30);

  svg.selectAll(".tick:first-of-type").remove();

  //const invertExtent = extent.reverse();
  const colors = d3.scaleSequential(d3.interpolateSpectral).domain([35, 5]);

  const rainScale = d3
    .scaleLinear()
    .range([0, 100])
    .domain([0, 100]);

  const tempBar = svg
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", barOriginX - barWidth / 2)
    .attr("width", barWidth)
    .attr("data-temp", d => d.tmax)
    .attr("data-date", d => d.date.toString())
    .attr("height", d => tempScale(d.tmax) - tempScale(d.tmin))
    .attr("fill", d => colors((d.tmax + d.tmin) / 2))
    .attr("stroke", "none")
    .attr("y", d => originY + tempScale(d.tmin))
    .attr('transform',(d,i)=>`rotate(${dayScale(i) + 180},${originX},${originY})`);

  const rainDrops = svg
    .selectAll(".rain")
    .data(data)
    .enter()
    .append("circle")
    .attr(
      "cy",
      d =>
        (tempScale(d.tmax) - tempScale(d.tmin)) / 2 +
        (originY + tempScale(d.tmin))
    )
    .attr("cx", barOriginX - barWidth / 2)
    .attr("fill", "rgba(120, 150, 251, 0.35)")
    .attr("r", d => rainScale(d.prcp))
    .attr('transform',(d,i)=>`rotate(${dayScale(i) + 180},${originX},${originY})`);


}
