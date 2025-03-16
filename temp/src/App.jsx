import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Button, Card, CardContent } from '@mui/material';
import { format } from 'date-fns';

"use client";

function Graph({ request }) {
  const data = request.data;
  const svgRef = useRef(null);
  const legendRef = useRef(null);
  const tooltipRef = useRef(null);

  // Filter data, grouping small values into "Other"
  const k = 1;
  const filteredData = [];
  let otherTime = 0;
  data.forEach((d) => {
    if (d.time >= k) {
      filteredData.push(d);
    } else {
      otherTime += d.time;
    }
  });
  if (otherTime > 0) {
    filteredData.push({ category: "Other", time: otherTime });
  }

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous rendering

    const width = 500,
      height = 500,
      radius = Math.min(width, height) / 2 - 10;
    const pieSvg = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3.pie().value((d) => d.time);

    const arc = d3.arc().innerRadius(0).outerRadius(radius);
    const arcHover = d3.arc().innerRadius(0).outerRadius(radius + 10);

    const color = d3
      .scaleOrdinal()
      .domain(filteredData.map((d) => d.category))
      .range(d3.schemeSet2);

    // Add slices
    const slices = pieSvg
      .selectAll("path")
      .data(pie(filteredData))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data.category))
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("cursor", "button")
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(200).attr("d", arcHover);

        d3.select(tooltipRef.current)
          .style("visibility", "visible")
          .html(`<strong>${d.data.category}</strong>: ${d.data.time} hours`);
      })
      .on("mousemove", function (event) {
        d3.select(tooltipRef.current)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`);
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(200).attr("d", arc);
        d3.select(tooltipRef.current).style("visibility", "hidden");
      });

    const legendSize = 10;
    const legend = d3
      .select(legendRef.current)
      .style("display", "flex")
      .style("flex-direction", "column")
      .style("gap", "5px");

    legend.selectAll("*").remove();

    const legendItem = legend
      .selectAll("div")
      .data(filteredData)
      .enter()
      .append("div")
      .style("display", "flex")
      .style("align-items", "center")
      .style("gap", "10px");

    legendItem
      .append("div")
      .style("width", `${legendSize}px`)
      .style("height", `${legendSize}px`)
      .style("background-color", (d) => color(d.category))
      .style("border-radius", "50%");

    legendItem.append("span").text((d) => d.category);

  }, [request.mode, filteredData]);

  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "start", justifyContent: "start", gap: "20px" }}>
      <svg ref={svgRef} width={500} height={500}></svg>
      <div style={{top: "0px"}} ref={legendRef}></div>
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          background: "white",
          padding: "5px",
          borderRadius: "5px",
          boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.2)",
          visibility: "hidden",
        }}
      ></div>
    </div>
  );
}

export default function App() {

  const browsingHistory = [
    { site: 'gmail.com', category: 'Work', time: '9:00 AM', duration: '45m' },
    { site: 'docs.google.com', category: 'Work', time: '9:45 AM', duration: '30m' },
    { site: 'twitter.com', category: 'Social Media', time: '10:15 AM', duration: '15m' },
    { site: 'github.com', category: 'Work', time: '10:30 AM', duration: '1h 15m' },
    { site: 'youtube.com', category: 'Entertainment', time: '11:45 AM', duration: '25m' },
    { site: 'slack.com', category: 'Work', time: '12:10 PM', duration: '35m' },
  ];
  const modes = ["bar", "string"]
  const history = {
    data: [{
      category: "Programming",
      time: 4
    },
    {
      category: "Mathematics",
      time: 4
    },
    {
      category: "Music",
      time: 1
    },
    {
      category: "Food",
      time: 0.5
    },
    {
      category: "A",
      time: 0.3
    },
    {
      category: "B",
      time: 0.2
    },
    {
      category: "Entertainment",
      time: 2
    }],
    mode: "pie"
  };

  return (
    <div className="flex flex-row justify-between p-6 w-screen h-full py-16 px-32">
      
      {/* Top Summary Cards */}
      <div className="flex flex-col gap-2 w-2/5 justify-center">

        {/* Hero Text */}
        <h1 className="text-2xl font-bold">Productivity Assistant</h1>
        <p className="text-gray-600 mb-6">Track your habits and focus from your most recent session</p>
        <div className="flex flex-col gap-2">
          <Card><CardContent><p className="text-lg font-semibold">Target Session Topic</p><p>MATH3161 W5 Class Test Revision</p></CardContent></Card>
          <Card><CardContent><p className="text-lg font-semibold">Total Session Time</p><p>3h 45m</p></CardContent></Card>
          <Card><CardContent><p className="text-lg font-semibold">Target Task Time</p><p>2h 30m</p></CardContent></Card>
          <Card><CardContent><p className="text-lg font-semibold">Focus Time</p><p>3h 02m</p></CardContent></Card>
        </div>
        </div>

      {/* Graphs */}
      <div className="flex flex-col w-3/5 p-4 gap-2 justify-end items-end">
        <div className=""><Graph request={history}/></div>
      </div>
      
    </div>
  );
};