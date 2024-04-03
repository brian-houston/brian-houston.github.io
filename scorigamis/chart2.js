import "../utilities/d3.v7.min.js";
import {Legend} from "../utilities/legend.js";
import {load_nfl_data} from "../utilities/nfl_data.js";
import {makeScorigamiChart} from "../utilities/scorigami_chart.js" 

let data = await load_nfl_data();
let dict = d3.group(data, d => d.strScore);
data = [...dict.values()].map(d => d[0]);
data = data.filter(d => !isNaN(d.scores[0]));

const width = 1000;
const seasonExtent = d3.extent(data.map(d => d.season));
const colorScale = d3.scaleSequential(seasonExtent, 
  d => d3.color(d3.interpolateSpectral(d)).darker(0.2));
const [svg, _] = makeScorigamiChart({width: width, data: data, colorScale: d => colorScale(d.season)});

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

const containerWidth = 130;
const containerHeight = 28;
const containerYOffset = 10;
const dateFormatter = d3.timeFormat('%m-%d-%Y')
svg.select('#scori-squares')
  .selectAll('rect')
  .on('mouseover', function(e, d) {
    const thisElement = d3.select(this);
    thisElement.attr('stroke', 'black');
    let container = svg.append('g')
      .attr('id', d.strScore)

    let cx = parseInt(this.getAttribute('x')) + parseInt(this.getAttribute('width'))/2;
    let cy = parseInt(this.getAttribute('y')) + parseInt(this.getAttribute('height')) + containerYOffset;

    cx = Math.min(Math.max(cx, containerWidth/2 + 1), width - containerWidth/2 - 1);

    container.append('rect')
      .attr('x', cx - containerWidth/2)
      .attr('y', cy)
      .attr('width', containerWidth)
      .attr('height', 28)
      .attr('fill', 'white')
      .attr('stroke', 'black')

    container.append('text')
      .text(dateFormatter(d.date))
      .attr('x', cx)
      .attr('y', cy + 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'hanging')
      .attr('font-family', 'monospace')

    container.append('text')
      .text(`${d.team1} ${d.score1} - ${d.score2} ${d.team2}`)
      .attr('x', cx) 
      .attr('y', cy + 16)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'hanging')
      .attr('font-family', 'monospace')
  })
  .on('mouseout', function(e, d) {
    d3.select(this).attr('stroke', null)
    svg.select(`#${d.strScore}`).remove();
  })

document.body.prepend(svg.node());
