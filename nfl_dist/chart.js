
import "../utilities/d3.v7.min.js";
import {Legend} from "../utilities/legend.js";
import {load_nfl_data} from "../utilities/nfl_data.js";
import {makeScorigamiChart} from "../utilities/scorigami_chart.js" 

let data = await load_nfl_data();

const colorScale = d3.scaleSequentialLog([1, 30], t => d3.color(d3.interpolateGnBu(t)).darker(0.2));
const [svg, updateChart] = makeScorigamiChart({data: data, colorScale: d => colorScale(d.count)});

const colorLegend = Legend(colorScale,
  {
    title: 'Frequency',
    tickFormat: "d",
    width: 340,
    ticks: 6,
    tickValues: [1, 5, 10, 20, 30]
  });

const titleElement = svg.select('#scori-title');
svg.append(() => colorLegend.node())
  .attr('x', titleElement.attr('x'))
  .attr('y', parseInt(titleElement.attr('y')) + 30)
  .attr('font-family', 'monospace')
  .select('g')
    .attr('font-family', 'monospace')

document.body.prepend(svg.node());

let seasonExtent = d3.extent(data.map(d => d.season));
let year = seasonExtent[0] - 10;
setInterval(() => {
  svg.select('#scori-title')
    .text(`NFL Score Distribution ${year}-${year+9}`);

  let anim_data = data.filter(d => d.season >= year && d.season < year + 10);
  let anim_groups = d3.group(anim_data, d => d.strScore);
  let count_data = [...anim_groups.values()].map(d => {
    return {
      count: d.length,
      scores: d[0].scores,
      strScore: d[0].strScore
    }
  })
  updateChart(count_data);
  year++;

  if (year > seasonExtent[1]) {
    year = seasonExtent[0] - 10;
  }
}, 220)

