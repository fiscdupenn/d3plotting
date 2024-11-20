import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as ss from "simple-statistics"; // Install with `npm install simple-statistics`

const ScatterPlot = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch the data.json file
    fetch("/data.json")
      .then((response) => response.json())
      .then((jsonData) => {
        setData(jsonData);
      });
  }, []);

  useEffect(() => {
    if (data.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };

    // Clear previous chart
    svg.selectAll("*").remove();

    // Set up scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.x))
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.y))
      .range([height - margin.bottom, margin.top]);

    // Add axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    // Add scatter points
    svg
      .selectAll(".point")
      .data(data)
      .join("circle")
      .attr("class", "point")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 4)
      .style("fill", "steelblue")
      .on("mouseover", (event, d) => {
        svg
          .append("text")
          .attr("id", "tooltip")
          .attr("x", xScale(d.x) + 5)
          .attr("y", yScale(d.y) - 10)
          .text(`(${d.x}, ${d.y})`);
      })
      .on("mouseout", () => {
        svg.select("#tooltip").remove();
      });

    // Calculate regression line
    const regression = ss.linearRegression(data.map((d) => [d.x, d.y]));
    const regressionLine = ss.linearRegressionLine(regression);

    // Line points
    const linePoints = [
      { x: d3.min(data, (d) => d.x), y: regressionLine(d3.min(data, (d) => d.x)) },
      { x: d3.max(data, (d) => d.x), y: regressionLine(d3.max(data, (d) => d.x)) },
    ];

    // Add regression line
    svg
      .append("line")
      .attr("x1", xScale(linePoints[0].x))
      .attr("y1", yScale(linePoints[0].y))
      .attr("x2", xScale(linePoints[1].x))
      .attr("y2", yScale(linePoints[1].y))
      .attr("stroke", "red")
      .attr("stroke-width", 2);

    // Confidence interval (example as ±10% around the line)
    svg
      .append("path")
      .datum(data)
      .attr(
        "d",
        d3
          .area()
          .x((d) => xScale(d.x))
          .y0((d) => yScale(regressionLine(d.x) * 0.9)) // Lower bound
          .y1((d) => yScale(regressionLine(d.x) * 1.1)) // Upper bound
      )
      .style("fill", "lightcoral")
      .style("opacity", 0.2);
  }, [data]);

  return <svg ref={svgRef} width={800} height={400}></svg>;
};

export default ScatterPlot;
