import "../libraries/d3.v7.min.js";
import {load_nfl_data} from "../libraries/nfl_data.js";

function elo_row(elo, date, season) {
  return {
    'elo': elo,
    'date': date,
    'season': season,
  }
}

function calculate_elos(data, init_elo, k) {
  let current_elos = {};
  let elos = {};
  let current_season = data[0].season;
  let season_extent = d3.extent(data.map(d => d.season));
  let groups = d3.group(data, d => d.season);

  for (let i = season_extent[0]; i <= season_extent[1]; i++) {
    for (const [key, value] of Object.entries(current_elos)) {
      if (elos[key][elos[key].length - 1].date == 'start') {
        elos[key].pop();
        delete current_elos[key];
        continue;
      }
      elos[key].push(elo_row(value, 'end', i - 1));
      current_elos[key] = 0.5 * (value + init_elo);
      elos[key].push(elo_row(current_elos[key], 'start', i));
    }

    for (let game of groups.get(i)) {
      let team1 = game.team1;
      let team2 = game.team2;
      current_elos[team1] ??= init_elo;
      current_elos[team2] ??= init_elo;
      elos[team1] ??= [elo_row(init_elo, 'start', game.season)];
      elos[team2] ??= [elo_row(init_elo, 'start', game.season)];

      let prediction = current_elos[team1]/(current_elos[team1] + current_elos[team2]);
      let result = game.score1 == game.score2 ? 0.5 : game.score1 > game.score2 ? 1 : 0; 
      let elo_points = k * (result - prediction);
      current_elos[team1] += elo_points;
      current_elos[team2] -= elo_points;
      elos[team1].push(elo_row(current_elos[team1], game.date, game.season));
      elos[team2].push(elo_row(current_elos[team2], game.date, game.season));
    }
  }

  return elos;
}

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

const data = await load_nfl_data();
const initElo = 1000;
const kElo = 50;
const elos = calculate_elos(data, initElo, kElo);

const width = 1000;
const height = 600;
const margins = {
  top: 20,
  bottom: 20,
  left: 20,
  right: 20,
}

const seasonExtent = d3.extent(data.map(d => d.season));
const xScale = d3.scaleLinear(seasonExtent, [margins.left, width - margins.right]);
const yScale = d3.scaleLinear([initElo - 700, initElo + 700], [height-margins.bottom, margins.top]);
const seasonScales = makeSeasonScales(elos);

const svg = d3.create('svg')
  .attr('width', width)
  .attr('height', height)
  .attr('preserveAspectRatio', 'none')

const lineGenerator = makeLineGenerator(xScale, yScale, seasonScales);
const polyGenerator = makePolyGenerator(xScale, yScale, seasonScales, initElo);

svg.append('g')
  .selectAll('path')
  .data(Object.values(elos))
  .join('path')
  .attr('d', d => polyGenerator(d))
  .attr('fill', 'lightgray')
  .attr('stroke', 'none')
  .attr('stroke-width', 2)


document.body.prepend(svg.node());
