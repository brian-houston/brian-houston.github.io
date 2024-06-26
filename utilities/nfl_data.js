const dataURL1 = "https://gist.githubusercontent.com/brian-houston/d13e40b76d06097e91e424ac56b81310/raw/660f88528c5ce513e572b2bc20105562009af159/538_nfl.csv";
const dataURL2 = "https://raw.githubusercontent.com/nflverse/nfldata/master/data/games.csv";

const teamCorrections = {
  'OAK': 'LV',
  'WAS': 'WSH',
  'LA': 'LAR',
}

export async function loadNflData() {
  let data = await Promise.all([d3.csv(dataURL1), d3.csv(dataURL2)]);

  data[0].forEach(d => {
    d.season = parseInt(d.season);
    d.decade = d.season - d.season % 10;
    d.score1 = parseInt(d.score1);
    d.score2 = parseInt(d.score2);
    d.scores = [d.score1, d.score2].sort(d3.ascending);
    d.strScore = 'S' + d.scores.join('to');
  });

  data[1].forEach(d => {
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

  data[1] = data[1].filter(d => d.season >= 2023 && !isNaN(d.score1));
  data = data.flat() 
  data = data.map(d => {
    return {
      season: d.season,
      decade: d.decade,
      date: new Date(d.date),
      team1: d.team1 in teamCorrections ? teamCorrections[d.team1] : d.team1,
      team2: d.team2 in teamCorrections ? teamCorrections[d.team2] : d.team2,
      score1: d.score1,
      score2: d.score2,
      scores: d.scores,
      strScore: d.strScore,
    };
  })
  return data
}
