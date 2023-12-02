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

data = d3.merge([data, data2])

let dict = d3.group(data, d => d.strScore);
data = [...dict.values()].map(d => d[0]);
data = data.filter(d => !isNaN(d.scores[0]));
let yearExtent = d3.extent(data.map(d => d.season));

let margins = {
  top: 10,
  bottom: 40,
  left: 10,
  right: 40,
}

let width = 1000;
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

const colorScale = d3.scaleSequential(yearExtent, t => d3.color(d3.interpolateSpectral(t)).darker(0.2));

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


let titleStartX = margins.left + 25;
let titleStartY = margins.top + 65;
svg.append('g')
  .append('text')
  .text('NFL Scorigamis')
  .attr('id', 'title')
  .attr('x', titleStartX)
  .attr('y', titleStartY)
  .attr('font-size', 40)
  .attr('font-family', 'monospace')

svg.append('g')
  .append('text')
  .text('Winning Score')
  .attr('x', margins.left + chartWidth * 0.5)
  .attr('y', height - 4)
  .attr('font-size', 15)
  .attr('font-family', 'monospace')
  .attr('text-anchor', 'middle')

svg.append('g')
  .append('text')
  .text('Losing Score')
  .attr('transform', 'rotate(90)')
  .attr('x', margins.top + chartHeight * 0.5)
  .attr('y', -width)
  .attr('font-size', 15)
  .attr('font-family', 'monospace')
  .attr('text-anchor', 'middle')
  .attr('dominant-baseline', 'hanging')

const colorLegend = Legend(colorScale,
  {
    title: 'Season',
    tickFormat: "d",
    width: 340
  });

svg.append(() => colorLegend.node())
  .attr('x', titleStartX)
  .attr('y', titleStartY + 30)
  .attr('font-family', 'monospace')
  .select('g')
    .attr('font-family', 'monospace')

document.body.prepend(svg.node());

const boxes = svg.append('g');

function drawBoxes(data) {
  boxes.selectAll('rect')
    .data(data, d => d.strScore)
    .join(
      enter => enter.append('rect')
        .attr('width', 0)
        .attr('height', 0)
        .attr('x', d => xScale.bandwidth()/2 + xScale(d.scores[1]))
        .attr('y', d => yScale.bandwidth()/2 + yScale(d.scores[0])),
      update => update,
      exit => exit.transition()
        .duration(200)
        .attr('width', 0)
        .attr('height', 0)
        .attr('x', d => xScale.bandwidth()/2 + xScale(d.scores[1]))
        .attr('y', d => yScale.bandwidth()/2 + yScale(d.scores[0]))
        .remove(),
    )
    .transition()
    .duration(200)
    .attr('width', xScale.bandwidth())
    .attr('height', yScale.bandwidth())
    .attr('x', d => xScale(d.scores[1]))
    .attr('y', d => yScale(d.scores[0]))
    .attr('fill', d => colorScale(d.season))
}

let year = yearExtent[0];
setInterval(() => {
  if (year <= yearExtent[1]) {
    svg.select('#title')
      .text(`NFL Scorigamis - ${year}`);
  }

  let anim_data = data.filter(d => d.season <= year);
  drawBoxes(anim_data);
  year++;

  if (year > yearExtent[1] + 15) {
    year = yearExtent[0] - 1;
  }
}, 220)
