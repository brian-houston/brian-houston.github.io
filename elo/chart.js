import '../utilities/d3.v7.min.js';
import {loadNflData} from '../utilities/nfl_data.js';
import {calcEloData} from './calc_elo.js'
import {makeRangeSelector} from '../utilities/range_selector.js'

function makeSeasonScales(date) {
  let seasonScales = {};
  let seasonGroups = d3.group(data, d => d.season);

  for (const i of seasonGroups.keys()) {
    let games = seasonGroups.get(i);
    let firstDate = new Date(games[0].date);
    // move scale start back 7 days so there is space for preseason elo
    firstDate.setDate(firstDate.getDate() - 7);
    let lastDate = games[games.length - 1].date;
    seasonScales[i] = d3.scaleLinear([firstDate, lastDate], [0, 1]);
  }

  return seasonScales;
}

function makeLineGenerator(xScale, yScale, seasonScales) {
  return d3.line()
    .defined(d => d.date != 'end')
    .x(d => xScale(d.season + (d.date == 'start' ? 0 : seasonScales[d.season](d.date))))
    .y(d => yScale(d.elo));
}

function makePolyGenerator(xScale, yScale, seasonScales, initElo) {
  return function(d) {
    let path = d3.path();

    for (const game of d) {
      if (game.date == 'start') {
        path.moveTo(xScale(game.season), yScale(game.elo));
      } else if (game.date == 'end') {
        path.lineTo(xScale(game.season + 1), yScale(game.elo));
        path.lineTo(xScale(game.season + 1), yScale(initElo));
        path.lineTo(xScale(game.season), yScale(initElo));
        path.closePath();
      } else {
        path.lineTo(xScale(game.season + seasonScales[game.season](game.date)), yScale(game.elo));
      }
    }

    return path.toString();
  }
}

const data = await loadNflData();
const initElo = 1000;
const kElo = 50;
const [elos, activeTeams, highs, lows] = calcEloData(data, initElo, kElo);

const width = 1000;
const height = 600;
const margins = {
  top: 20,
  bottom: 20,
  left: 40,
  right: 20,
}

const seasonExtent = d3.extent(data.map(d => d.season));
const xScale = d3.scaleLinear([seasonExtent[0], seasonExtent[1] + 1], [margins.left, width - margins.right]);
const yScale = d3.scaleLinear([initElo - 700, initElo + 700], [height-margins.bottom, margins.top]);
const seasonScales = makeSeasonScales(elos);

const svg = d3.create('svg')
  .attr('width', width)
  .attr('height', height)

const lineGenerator = makeLineGenerator(xScale, yScale, seasonScales);
const polyGenerator = makePolyGenerator(xScale, yScale, seasonScales, initElo);

// chart area
svg.append('svg')
  .attr('preserveAspectRatio', 'none')
  .attr('viewBox', `${margins.left} 0 ${width - margins.left - margins.right} ${height}`)
  .attr('x', margins.left)
  .attr('id', 'chartArea')
  .attr('width', width - margins.left - margins.right)

//outline of elo histories
svg.select('#chartArea')
  .append('g')
  .attr('id', 'outlines')
  .selectAll('path')
  .data([highs, lows])
  .join('path')
  .attr('d', d => polyGenerator(d))
  .attr('fill', 'lightgray')
  .attr('stroke', 'none')
  .attr('stroke-width', 2)

// paths of elo histories
// 1 path per team
// data formatted as [[team1, elos1], [team2, elos2], ...]
svg.select('#chartArea')
  .append('g')
  .attr('id', 'paths')
  .selectAll('path')
  .data(activeTeams.map(d => [d, elos[d]])) 
  .join('path')
  .attr('d', d => lineGenerator(d[1]))
  .attr('class', d => d[0])
  .attr('fill', 'none')
  .attr('stroke', 'steelblue')
  .attr('vector-effect', 'non-scaling-stroke')
  .attr('stroke-width', 2)
  .attr('visibility', 'hidden')

// x-axis
svg.append('g')
  .attr('id', 'gx')
  .attr('transform', `translate(0, ${height - margins.bottom})`)
  .call(d3.axisBottom(xScale))

// y-axis
svg.append('g')
  .attr('id', 'gy')
  .attr('transform', `translate(${margins.left}, 0)`)
  .call(d3.axisLeft(yScale))

// add teams to drop down menu
d3.select('#teams')
  .selectAll('option')
  .data(d3.sort(activeTeams, d3.ascending))
  .join('option')
  .text(d => d)

const teamSelectInput = document.getElementById('teams');

let selectedTeam = 'CAR';
teamSelectInput.addEventListener('change', (e) => {
  d3.selectAll(`.${selectedTeam}`)
    .attr('visibility', 'hidden');
  selectedTeam = e.target.value;
  d3.selectAll(`.${selectedTeam}`)
    .attr('visibility', 'visible');
})

function rsOnDrag(domain) {
  const range = domain.map(d => xScale(d))
  d3.select('#chartArea')
    .attr('viewBox', `${range[0]} 0 ${range[1] - range[0]} ${height}`)
  const xScaleNew = d3.scaleLinear(domain, xScale.range());
  d3.select('#gx')
    .transition()
    .duration(1)
    .call(d3.axisBottom(xScaleNew));
    
}

const rsHeight = 70;
const rsMargins = {
  top: 20,
  bottom: 20,
};

// scale for selecting season range to display
const rs = makeRangeSelector(xScale, width, rsHeight, rsMargins, rsOnDrag);

document.body.prepend(rs.node());
document.body.prepend(svg.node());

// make default option visible
d3.selectAll(`.${selectedTeam}`)
  .attr('visibility', 'visible');
d3.selectAll('#teams option')
  .filter(d => d == selectedTeam)
  .attr('selected', '')

