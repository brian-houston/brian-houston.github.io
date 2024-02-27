import "../libraries/d3.v7.min.js";

export function makeRangeSelector(callback, scale, width, height, margins) {
  const svg = d3.create('svg')
    .attr('width', width)
    .attr('height', height)

  svg.append('g')
    .attr('transform', `translate(${0}, ${height-margins.bottom})`)
    .call(d3.axisBottom(scale))

  return svg;
}
