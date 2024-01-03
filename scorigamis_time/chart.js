import "../libraries/d3.v7.min.js";
import {load_nfl_data} from "../libraries/nfl_data.js";

let data = await load_nfl_data();
let dict = d3.group(data, d => d.strScore);
let scorigamis = [...dict.values()].map(d => d[0]);

let scorigami_dict = d3.group(scorigamis, d => d.season);
let all_dict = d3.group(data, d => d.season);
data = [...all_dict.values()].map(d => {
  return {
    'season': d[0].season,
    'games': d.length,
    'scorigamis': scorigami_dict.get(d[0].season).length || 0,
  }
});

let data_lookup = data.reduce((acc, d) => {
  acc[d.season] = d;
  return acc;
}, {});

data.forEach(d => {
  d.perGame = d.scorigamis/d.games;
})

let yearExtent = d3.extent(data.map(d => d.season));

let margins = {
  top: 60,
  bottom: 80,
  left: 80,
  right: 0,
}

let chartSpacing = 20;

let width = 1000;
let height = 1000;
let chartWidth = width - margins.left - margins.right;
let chartHeight = (height - margins.top - margins.bottom - 2 * chartSpacing) / 3;

let xScale = d3.scaleLinear(yearExtent, [0, chartWidth]);

let xAxis = d3.axisBottom(xScale)
  .tickFormat(d3.format('d'))
  .tickSizeOuter(0);

const svg = d3.create('svg')
  .attr('width', width)
  .attr('height', height)
  .attr('overflow', 'visible');


function drawChart(i, varName, label, color = 'steelblue') {
  let yOffset = margins.top + i * (chartHeight + chartSpacing);

  let yScale = d3.scaleLinear([0, d3.max(data.map(d=>d[varName]))], [chartHeight, 0]);
  let yAxis = d3.axisLeft(yScale)
    .ticks(5)
    .tickSizeOuter(0);

  let chart = svg.append('g')
    .attr('transform', `translate(${margins.left}, ${yOffset})`)

  chart.append('g')
    .attr('transform', `translate(0, ${chartHeight})`)
    .call(xAxis)
    .attr('font-family', 'monospace')
    .selectAll('.tick')
    .append('line')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', 0)
    .attr('y2', -chartHeight)
    .attr('stroke', 'lightgray')
    .attr('stroke-dasharray', '2,2');

  chart.append('g')
    .call(yAxis)
    .call(g => g.select('path').remove())
    .call(g => g.select('.tick:first-of-type').remove())
    .selectAll('.tick')
    .call(g => g.select('line').remove())
    .attr('font-family', 'monospace')
    .append('line')
    .attr('x1', -8)
    .attr('y1', 0)
    .attr('x2', chartWidth)
    .attr('y2', 0)
    .attr('stroke', 'lightgray')
    .attr('stroke-dasharray', '2,2');
  
  chart.append('path')
    .datum(data)
    .attr('d', d3.line()
      .x(d => xScale(d.season))
      .y(d => yScale(d[varName]))
    )
    .attr('stroke', color)
    .attr('fill', 'none')
    .attr('stroke-width', 4);

  chart.append('g')
    .attr('transform', 'rotate(-90)')
    .append('text')
    .text(label)
    .attr('x', -chartHeight/2)
    .attr('y', -45)
    .attr('font-family', 'monospace')
    .attr('font-size', 18)
    .attr('text-anchor', 'middle')

  return yScale;
}

let chartData = ['scorigamis', 'games', 'perGame'];
let chartLabels = ['Scorigamis', 'Games', 'Scorigami Rate'];
let chartColors = ['steelblue', 'green', 'firebrick'];

let yScales = [0, 1, 2].map(d => drawChart(d, chartData[d], chartLabels[d], chartColors[d]));

svg.append('g')
  .append('text')
  .text('Season')
  .attr('x', margins.left + chartWidth/2)
  .attr('y', height - 30)
  .attr('font-family', 'monospace')
  .attr('font-size', 18)
  .attr('text-anchor', 'middle')

svg.append('g')
  .attr('id', 'tooltip')
  .attr('font-family', 'monospace')

svg.append('rect')
  .attr('x', margins.left)
  .attr('y', margins.top)
  .attr('width', chartWidth)
  .attr('height', height - margins.top - margins.bottom)
  .attr('opacity', 0)
  .on('mousemove', function(e) {
    let chartX = e.offsetX - margins.left;
    let season = Math.round(xScale.invert(chartX));

    let x = xScale(season) + margins.left;
    let yTop = d => margins.top + d * (chartSpacing + chartHeight);

    let lineTop = margins.top/2;
    svg.select('#tooltip')
      .selectAll('line')
      .data([0, 1, 2], d => d)
      .join('line')
        .attr('x1', x)
        .attr('y1', d => d == 0 ? lineTop : yTop(d))
        .attr('x2', x)
        .attr('y2', d => yTop(d) + chartHeight)
        .attr('stroke', 'black')

    svg.select('#tooltip')
      .selectAll('circle')
      .data([0, 1, 2], d => d)
      .join('circle')
        .attr('cx', x)
        .attr('cy', d => yScales[d](data_lookup[season][chartData[d]]) + yTop(d))
        .attr('r', 6)
        .attr('fill', d => 'darkgray')

    let textBoxWidth = 50;
    let textBoxHeight = 20;
    svg.select('#tooltip')
      .selectAll('.yearRect')
      .data([0], d => d)
      .join('rect')
      .attr('class', 'yearRect')
      .attr('x', x - textBoxWidth/2)
      .attr('y', lineTop - textBoxHeight)
      .attr('width', textBoxWidth)
      .attr('height', textBoxHeight)
      .attr('fill', 'white')
      .attr('stroke', 'black')
    svg.select('#tooltip')
      .selectAll('.yearText')
      .data([0], d => d)
      .join('text')
      .attr('class', 'yearText')
      .attr('x', x)
      .attr('y', lineTop - textBoxHeight + 5)
      .text(season)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'hanging')

    let dataOffsetY = 8;
    let floatFormat = d3.format('0.3f');
    svg.select('#tooltip')
      .selectAll('.dataRect')
      .data([0,1,2], d => d)
      .join('rect')
      .attr('class', 'dataRect')
      .attr('x', x - textBoxWidth/2)
      .attr('y', d => yScales[d](data_lookup[season][chartData[d]]) + yTop(d) - textBoxHeight - dataOffsetY)
      .attr('width', textBoxWidth)
      .attr('height', textBoxHeight)
      .attr('fill', 'white')
      .attr('stroke', 'black')
    svg.select('#tooltip')
      .selectAll('.dataText')
      .data([0,1,2], d => d)
      .join('text')
      .attr('class', 'dataText')
      .attr('x', x)
      .attr('y', d => yScales[d](data_lookup[season][chartData[d]]) + yTop(d) - textBoxHeight + 5 - dataOffsetY)
      .text(d => {
        let v = data_lookup[season][chartData[d]];
        return d == 2 ? floatFormat(v) : v;
      })
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'hanging')
  })
  .on('mouseleave', function() {
    svg.selectAll('#tooltip > line').remove();
    svg.selectAll('#tooltip > circle').remove();
    svg.selectAll('#tooltip > rect').remove();
    svg.selectAll('#tooltip > text').remove();
  })

document.body.prepend(svg.node());
