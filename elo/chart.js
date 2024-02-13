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
  let current_season = data[0].season
  let seasonExtent = d3.extent(data.map(d => d.season))
  let groups = d3.group(data, d => d.season)
  for (let i = seasonExtent[0]; i <= seasonExtent[1]; i++) {
    for (const [key, value] of Object.entries(current_elos)) {
      current_elos[key] = 0.5 * (value + init_elo);
      elos[key].push(elo_row(current_elos[key], 'start', i))
    }

    for (let game of groups.get(i)) {
      let team1 = game.team1;
      let team2 = game.team2;
      current_elos[team1] ??= init_elo;
      current_elos[team2] ??= init_elo;
      elos[team1] ??= [elo_row(init_elo, 'start', game.season)]
      elos[team2] ??= [elo_row(init_elo, 'start', game.season)]

      let prediction = current_elos[team1]/(current_elos[team1] + current_elos[team2]);
      let result = game.score1 == game.score2 ? 0.5 : game.score1 > game.score2 ? 1 : 0; 
      let elo_points = k * (result - prediction);
      current_elos[team1] += elo_points;
      current_elos[team2] -= elo_points;
      elos[team1].push(elo_row(current_elos[team1], game.date, game.season))
      elos[team2].push(elo_row(current_elos[team2], game.date, game.season))
    }
  }
  console.log(elos)
}

let data = await load_nfl_data();
calculate_elos(data, 1000, 50)
