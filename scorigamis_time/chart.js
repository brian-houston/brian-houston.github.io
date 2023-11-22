import "../libraries/d3.v7.min.js";
import {Legend} from "../libraries/legend.js"; let dataURL = "https://gist.githubusercontent.com/brian-houston/d13e40b76d06097e91e424ac56b81310/raw/660f88528c5ce513e572b2bc20105562009af159/538_nfl.csv";
let dataURL2 = "https://raw.githubusercontent.com/nflverse/nfldata/master/data/games.csv";

let data = await d3.csv(dataURL);
let data2 = await d3.csv(dataURL2);

data.forEach(d => {
  d.season = parseInt(d.season);
  d.decade = d.season - d.season % 10;
  d.score1 = parseInt(d.score1);
  d.score2 = parseInt(d.score2);
  d.scores = [d.score1, d.score2].sort(d3.ascending);
  d.strScore = 'S' + d.scores.join('to');
});

data2.forEach(d => {
  d.season = parseInt(d.season);
  d.decade = d.season - d.season % 10;
  d.team1 = d.away_team;
  d.team2 = d.home_team;
  d.date = d.gameday;
  d.score1 = parseInt(d.away_score);
  d.score2 = parseInt(d.home_score);
  d.scores = [d.score1, d.score2].sort(d3.ascending);
  d.strScore = 'S' + d.scores.join('to');
});

data2 = data2.filter(d => d.season >= 2023 && !isNaN(d.score1));

data = d3.merge([data, data2])

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

data.forEach(d => {
  d.perGame = d.scorigamis/d.games;
})

let yearExtent = d3.extent(data.map(d => d.season));

let margins = {
  top: 10,
  bottom: 80,
  left: 80,
  right: 0,
}

let chartSpacing = 20;

let width = 1000;
let height = 1000;
let chartWidth = width - margins.left - margins.right;
let chartHeight = (height - margins.top - margins.bottom - 2 * chartSpacing) / 3;

let xScale = d3.scaleSequential(yearExtent, [0, chartWidth]);
let xAxis = d3.axisBottom(xScale)
  .tickFormat(d3.format('d'))
  .tickSizeOuter(0);

const svg = d3.create('svg')
  .attr('width', width)
  .attr('height', height);

function drawChart(i, varName, label, color = 'steelblue') {
  let yOffset = margins.top + i * (chartHeight + chartSpacing);

  let yScale = d3.scaleSequential([0, d3.max(data.map(d=>d[varName]))], [chartHeight, 0]);
  let yAxis = d3.axisLeft(yScale)
    .ticks(5)
    .tickSizeOuter(0);

  let chart = svg.append('g')
    .attr('transform', `translate(${margins.left}, ${yOffset})`);

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
}

drawChart(0, 'scorigamis', 'Scorigamis', 'steelblue');
drawChart(1, 'games', 'Games', 'green');
drawChart(2, 'perGame', 'Scorigami Rate', 'firebrick');

svg.append('g')
  .append('text')
  .text('Season')
  .attr('x', margins.left + chartWidth/2)
  .attr('y', height - 30)
  .attr('font-family', 'monospace')
  .attr('font-size', 18)
  .attr('text-anchor', 'middle')

document.body.prepend(svg.node());
