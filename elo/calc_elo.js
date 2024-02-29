function makeEloRow(elo, date, season) {
  return {
    'elo': elo,
    'date': date,
    'season': season,
  }
}

function updateHighLow(highs, lows, currentElos, date, season) {
  const minElo = d3.min(Object.values(currentElos));
  const maxElo = d3.max(Object.values(currentElos));

  // update high/low if elo changes
  // reduces bumpiness
  if (date == 'end' || lows[lows.length - 1].elo != minElo) {
    lows.push(makeEloRow(minElo, date, season));
  }

  if (date == 'end' || highs[highs.length - 1].elo != maxElo) {
    highs.push(makeEloRow(maxElo, date, season));
  }
}

export function calcEloData(data, initElo, k) {
  let currentElos = {};
  let elos = {};
  let seasonExtent = d3.extent(data.map(d => d.season));
  let groups = d3.group(data, d => d.season);

  let lowRow = makeEloRow(initElo, 'start', seasonExtent[0]);
  let highRow = lowRow;
  let lows = [lowRow];
  let highs = [highRow];

  for (let i = seasonExtent[0]; i <= seasonExtent[1]; i++) {
    for (const [key, value] of Object.entries(currentElos)) {
      if (elos[key][elos[key].length - 1].date == 'start') {
        elos[key].pop();
        delete currentElos[key];
        continue;
      }
      elos[key].push(makeEloRow(value, 'end', i - 1));
      currentElos[key] = 0.5 * (value + initElo);
      elos[key].push(makeEloRow(currentElos[key], 'start', i));
    }
    
    // skip first year
    if (i > seasonExtent[0]) {
      updateHighLow(highs, lows, currentElos, 'start', i);
    }

    for (let j = 0; j < groups.get(i).length; j++) {
      const game = groups.get(i)[j];
      const team1 = game.team1;
      const team2 = game.team2;
      currentElos[team1] ??= initElo;
      currentElos[team2] ??= initElo;
      elos[team1] ??= [makeEloRow(initElo, 'start', game.season)];
      elos[team2] ??= [makeEloRow(initElo, 'start', game.season)];

      const prediction = currentElos[team1]/(currentElos[team1] + currentElos[team2]);
      const result = game.score1 == game.score2 ? 0.5 : game.score1 > game.score2 ? 1 : 0; 
      const eloChange = k * (result - prediction);
      currentElos[team1] += eloChange;
      currentElos[team2] -= eloChange;

      const newElo1 = makeEloRow(currentElos[team1], game.date, game.season);
      const newElo2 = makeEloRow(currentElos[team2], game.date, game.season);
      elos[team1].push(newElo1);
      elos[team2].push(newElo2);

      if (j + 1 < groups.get(i).length && groups.get(i)[j + 1].date.getTime() != game.date.getTime()) {
        updateHighLow(highs, lows, currentElos, game.date, game.season);
      }
    }

    updateHighLow(highs, lows, currentElos, 'end', i);
  }

  // add 'end' to remaining team histories
  for (const [key, value] of Object.entries(currentElos)) {
    elos[key].push(makeEloRow(value, 'end', seasonExtent[1]));
  }

  const activeTeams = Object.keys(currentElos);
  return [elos, activeTeams, highs, lows];
}
