"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function Chart({ request }: { request: { data: { category: string; time: number }[]; mode: "bar" | "pie" } }) {
  const data = request.data;
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Filter data, grouping small values into "Other"
  const k = 1;
  const filteredData: { category: string; time: number }[] = [];
  let otherTime = 0;
  data.forEach(d => {
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

    if (request.mode === "bar") {
      const width = 500,
        height = 300,
        margin = { top: 20, right: 30, bottom: 50, left: 40 };

      const xScale = d3
        .scaleBand()
        .domain(filteredData.map(d => d.category))
        .range([margin.left, width - margin.right])
        .padding(0.2);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(filteredData, d => d.time) || 0])
        .nice()
        .range([height - margin.bottom, margin.top]);

      svg
        .selectAll(".bar")
        .data(filteredData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.category) as number)
        .attr("y", d => yScale(d.time))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - margin.bottom - yScale(d.time))
        .attr("fill", d => (d.category === "Other" ? "gray" : "steelblue"));

      svg
        .append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

      svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(yScale));
    } 
    if (request.mode === "pie") {
      const width = 500, height = 300, radius = Math.min(width, height) / 2 - 10;
      const pieSvg = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);

      const pie = d3.pie<{ category: string; time: number }>()
        .value(d => d.time);

      const arc = d3.arc<d3.PieArcDatum<{ category: string; time: number }>>()
        .innerRadius(0)
        .outerRadius(radius);

      const color = d3.scaleOrdinal<string>()
        .domain(filteredData.map(d => d.category))
        .range(d3.schemeSet2);

      // Draw pie slices
      pieSvg.selectAll("path")
        .data(pie(filteredData))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.category) as string)
        .attr("stroke", "white")
        .style("stroke-width", "2px");

      // Add labels
      pieSvg.selectAll("text")
        .data(pie(filteredData))
        .enter()
        .append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "black")
        .text(d => d.data.category);
    }
  }, [request.mode, filteredData]); // Runs when mode or data changes

  return (
    <svg ref={svgRef} width={500} height={300}></svg>
  );
};
