import * as d3 from "d3";

export function WeatherRadial(
  element: d3.Selection<HTMLElement, {}, HTMLElement, any>,
  city: string,
  data: WeatherData[]
) {
  const svg = element.append("svg");
  svg
    .attr("viewBox", "0 0 1000 1000")
    .attr("width", 700)
    .attr("height", 700);

  const originX = 500;
  const originY = 500;
  const outerCircleRadius = 400;

  const barWidth = 3;
  const barOriginX = originX + outerCircleRadius * Math.sin(0);
  const barOriginY = originY - outerCircleRadius * Math.cos(0);

  const allTemps = data.reduce(
    (p, n) => [...p, n.tmin, n.tmax],
    [] as number[]
  );

  const extent = d3.extent(allTemps) as [number, number];

  const dayScale = d3
    .scaleTime()
    .domain([new Date("Jan 1, 2017"), new Date("Dec 31, 2017")])
    .range([0, 360]);

  const tempScaleInvert = d3
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

  const tempScale = d3
    .scaleLinear()
    .domain([-40, 40])
    .range([0, outerCircleRadius]);

  const circles = svg
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

  const formatNumber = d3.format("-");
  const xAxis = d3
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

  const colors = d3.scaleSequential(d3.interpolateSpectral).domain([35, 0]);

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
    .attr(
      "transform",
      d => `rotate(${dayScale(d.date) + 180},${originX},${originY})`
    );

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
    .attr("fill", "rgba(120, 150, 251, 0.275)")
    .attr("r", d => rainScale(d.prcp))
    .attr(
      "transform",
      d => `rotate(${dayScale(d.date) + 180},${originX},${originY})`
    );
}

export type WeatherData = {
  date: Date;
  name: string;
  prcp: number;
  tavg: number;
  tmax: number;
  tmin: number;
};

const timeParse = d3.timeParse("%Y-%m-%d");
export const ETLWeatherData = (wd: any): WeatherData => ({
  name: wd.NAME,
  tavg: +wd.TAVG,
  tmax: +wd.TMAX,
  tmin: +wd.TMIN,
  prcp: +wd.PRCP,
  date: timeParse(wd.DATE) as Date
});
