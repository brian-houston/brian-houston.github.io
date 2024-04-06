import "../utilities/d3.v7.min.js";

export function makeScorigamiChart({
  width = 1000,
  title = 'NFL Scorigamis',
  xScaleLabel = 'Winning Score',
  yScaleLabel = 'Losing Score',
  data = null,
  colorScale = (d) => 'steelblue',
} = {}) {
  
  if (!data) {
    return d3.create('svg');
  }

  let margins = {
    top: 10,
    bottom: 40,
    left: 10,
    right: 40,
  }
  
  let maxMin = d3.max(data.map(d => d.scores[0]));
  let maxMax = d3.max(data.map(d => d.scores[1]));
  let height = (maxMin+1) * (width-margins.left-margins.right) / (maxMax+1) + margins.top + margins.bottom;
  let paddingInner = 0.1;

  let chartWidth = width - margins.left - margins.right;
  let chartHeight = height - margins.top - margins.bottom;

  const xScale = d3.scaleBand(d3.range(0, maxMax + 1), [margins.left, width - margins.right])
    .paddingInner(paddingInner);

  const yScale = d3.scaleBand(d3.range(0, maxMin + 1), [height - margins.bottom, margins.top])
    .paddingInner(paddingInner);

  let yearExtent = d3.extent(data.map(d => d.season));

  const xAxis = d3.axisBottom(xScale)
    .tickFormat(d => d % 5 == 0 ? d : '')
    .tickSizeOuter(0);

  const yAxis = d3.axisRight(yScale)
    .tickFormat(d => d % 5 == 0 ? d : '')
    .tickSizeOuter(0);

  const svg = d3.create('svg')
    .attr('width', width)
    .attr('height', height);

  svg.append('g')
    .selectAll('line')
    .data(xScale.domain().filter(d => d % 5 == 0))
    .join('line')
    .attr('x1', d => xScale(d) + xScale.bandwidth()/2)
    .attr('y1', height - margins.bottom)
    .attr('x2', d => xScale(d) + xScale.bandwidth()/2)
    .attr('y2', margins.top)
    .attr('stroke', 'lightgray')
    .attr('stroke-dasharray', '2,2');

  svg.append('g')
    .selectAll('line')
    .data(yScale.domain().filter(d => d % 5 == 0 && d != 0))
    .join('line')
    .attr('x1', width - margins.right)
    .attr('y1', d => yScale(d) + yScale.bandwidth()/2)
    .attr('x2', margins.left)
    .attr('y2', d => yScale(d) + yScale.bandwidth()/2)
    .attr('stroke', 'lightgray')
    .attr('stroke-dasharray', '2,2');

  svg.append('g')
    .attr('transform', `translate(0,${height - margins.bottom})`)
    .call(xAxis)
    .attr('font-family', 'monospace');

  svg.append('g')
    .attr('transform', `translate(${width - margins.right}, 0)`)
    .call(yAxis)
    .attr('font-family', 'monospace');

  svg.append('g')
    .attr('id', 'scori-squares')
    .selectAll('rect')

  let titleStartX = margins.left + 25;
  let titleStartY = margins.top + 65;
  svg.append('g')
    .append('text')
    .text(title)
    .attr('id', 'scori-title')
    .attr('x', titleStartX)
    .attr('y', titleStartY)
    .attr('font-size', 40)
    .attr('font-family', 'monospace')

  svg.append('g')
    .append('text')
    .text(xScaleLabel)
    .attr('x', margins.left + chartWidth * 0.5)
    .attr('y', height - 4)
    .attr('font-size', 15)
    .attr('font-family', 'monospace')
    .attr('text-anchor', 'middle')

  svg.append('g')
    .append('text')
    .text(yScaleLabel)
    .attr('transform', 'rotate(90)')
    .attr('x', margins.top + chartHeight * 0.5)
    .attr('y', -width)
    .attr('font-size', 15)
    .attr('font-family', 'monospace')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'hanging')

  function updateScorigamiChart(data, animationDuration = 200) {
    svg.select('#scori-squares')
      .selectAll('rect')
      .data(data, d => d.strScore)
      .join(
        enter => enter.append('rect')
          .attr('width', 0)
          .attr('height', 0)
          .attr('x', d => xScale.bandwidth()/2 + xScale(d.scores[1]))
          .attr('y', d => yScale.bandwidth()/2 + yScale(d.scores[0])),
        update => update,
        exit => exit.transition()
          .duration(animationDuration)
          .attr('width', 0)
          .attr('height', 0)
          .attr('x', d => xScale.bandwidth()/2 + xScale(d.scores[1]))
          .attr('y', d => yScale.bandwidth()/2 + yScale(d.scores[0]))
          .remove(),
      )
      .transition()
      .duration(animationDuration)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('x', d => xScale(d.scores[1]))
      .attr('y', d => yScale(d.scores[0]))
      .attr('fill', d => colorScale(d))
  }

  return [svg, updateScorigamiChart];
}

