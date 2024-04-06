import "../utilities/d3.v7.min.js";
import {Legend} from "../utilities/legend.js";
import {loadNFLData} from "../utilities/nfl_data.js";
import {makeScorigamiChart} from "../utilities/scorigami_chart.js" 

let data = await loadNFLData();
let dict = d3.group(data, d => d.strScore);
data = [...dict.values()].map(d => d[0]);
data = data.filter(d => !isNaN(d.scores[0]));

const width = 1000;
const seasonExtent = d3.extent(data.map(d => d.season));
const colorScale = d3.scaleSequential(seasonExtent, 
  d => d3.color(d3.interpolateSpectral(d)).darker(0.2));
const [svg, updateChart] = makeScorigamiChart({width: width, data: data, colorScale: d => colorScale(d.season)});

const colorLegend = Legend(colorScale,
  {
    title: 'Season',
    tickFormat: "d",
    width: 340
  });

const titleElement = svg.select('#scori-title');
svg.append(() => colorLegend.node())
  .attr('x', titleElement.attr('x'))
  .attr('y', parseInt(titleElement.attr('y')) + 30)
  .attr('font-family', 'monospace')
  .select('g')
  .attr('font-family', 'monospace');

document.body.prepend(svg.node());

let year = seasonExtent[0];
setInterval(() => {
  if (year <= seasonExtent[1]) {
    svg.select('#scori-title')
      .text(`NFL Scorigamis - ${year}`);
  }

  let anim_data = data.filter(d => d.season <= year);
  updateChart(anim_data);
  year++;

  if (year > seasonExtent[1] + 15) {
    year = seasonExtent[0] - 1;
  }
}, 220)
