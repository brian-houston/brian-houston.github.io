import "../utilities/d3.v7.min.js";
let dataURL = "https://gist.githubusercontent.com/brian-houston/7ffd597a65fb095304d893b6a407f11c/raw/d928e02a6f81d4d405b1a2fc04df4f9c51f4e9d2/gme_nft.json";
let data = await d3.json(dataURL);
data.x = data.x.map(d => new Date(d));
d3.blur(data.y, 50);
data = d3.zip(data.x, data.y);
data = data.map(d => {
  return {
    date: d[0],
    volume: d[1]
  };
});

let dateExtent = [data[0].date, data.slice(-1)[0].date];
let volumeExtent = d3.extent(data.map(d => d.volume));

let width = 800;
let height = 600;

let margins = {
  top: 60,
  bottom: 60,
  left: 60,
  right: 20,
}

let chartWidth = width - margins.left - margins.right;
let chartHeight = height - margins.top - margins.bottom;

let xScale = d3.scaleTime(dateExtent, [margins.left, width - margins.right]);
let yScale = d3.scaleLog(volumeExtent, [height - margins.bottom, margins.top]).nice();

let xAxis = d3.axisBottom(xScale)
  .tickFormat(d3.timeFormat('%b%y'))
  .tickSizeOuter(0);

let yAxis = d3.axisLeft(yScale)
  .ticks(7, d3.format('.1r'))
  .tickSizeOuter(0);

let svg = d3.create('svg')
  .attr('width', width)
  .attr('height', height);

svg.append('g')
  .call(xAxis)
  .attr('transform', `translate(0,${height - margins.bottom})`)
  .attr('font-family', 'monospace')
  .selectAll('.tick')
  .append('line')
  .attr('x1', 0)
  .attr('y1', 0)
  .attr('x2', 0)
  .attr('y2', -height + margins.top + margins.bottom)
  .attr('stroke', 'lightgray')
  .attr('stroke-dasharray', '2,2');

svg.append('g')
  .call(yAxis)
  .attr('transform', `translate(${margins.left}, 0)`)
  .attr('font-family', 'monospace')
  .selectAll('.tick')
  .filter(function() {return d3.select(this).select('text').text() != '';})
  .filter((d, i) => i != 0)
  .append('line')
  .attr('x1', 0)
  .attr('y1', 0)
  .attr('x2', width - margins.left - margins.right)
  .attr('y2', 0)
  .attr('stroke', 'lightgray')
  .attr('stroke-dasharray', '2,2');

svg.append('path')
  .datum(data)
  .attr('d', d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.volume))
  )
  .attr('stroke', 'steelblue')
  .attr('fill', 'none')
  .attr('stroke-width', 3);

svg.append('g')
  .append('text')
  .text('Date')
  .attr('x', margins.left + 0.5 * chartWidth)
  .attr('y', height - 20)
  .attr('font-family', 'monospace')
  .attr('font-size', 14)
  .attr('text-anchor', 'middle')

svg.append('g')
  .append('text')
  .text('Rolling Avg Volume (Ethereum/Day)')
  .attr('transform', 'rotate(-90)')
  .attr('x', - margins.top - 0.5 * chartHeight)
  .attr('y', 10)
  .attr('font-size', 14)
  .attr('font-family', 'monospace')
  .attr('text-anchor', 'middle')
  .attr('dominant-baseline', 'hanging')

svg.append('g')
  .append('text')
  .text('Decline of Gamestop\'s NFT Marketplace')
  .attr('x', margins.left + 0.5 * chartWidth)
  .attr('y', 34)
  .attr('font-family', 'monospace')
  .attr('font-size', 24)
  .attr('text-anchor', 'middle')

document.body.prepend(svg.node());

