import "../libraries/d3.v7.min.js";

export function makeRangeSelector(scale, width, height, margins, onDrag) {
  const svg = d3.create('svg')
    .attr('width', width)
    .attr('height', height)

  svg.append('g')
    .attr('transform', `translate(${0}, ${height-margins.bottom})`)
    .call(d3.axisBottom(scale))

  makeRangeSliders(svg, scale, margins.top, onDrag) 

  return svg;
}

function makeRangeSliders(svg, scale, initY, onDrag) {
  const range = scale.range()
  function sliderDragStart() {
    
  }

  function sliderDrag(event) {
    d3.select(this)
      .raise()
      .attr("x", Math.max(range[0], Math.min(range[1], event.x)))

    let output = [
      d3.select('#slider0').attr('x'),
      d3.select('#slider1').attr('x')
    ].map(d => scale.invert(d));
    
    output = d3.sort(output, d3.ascending);
    onDrag(output);
  }

  function sliderDragEnd() {

  }

  const drag = d3.drag()
    .on('start', sliderDragStart)
    .on('drag', sliderDrag)
    .on('end', sliderDragEnd)

  for (let i = 0; i < 2; i++) {
    svg.append('rect')
      .attr('id', `slider${i}`)
      .attr('transform', 'translate(-10, 0)')
      .attr('width', 20)
      .attr('height', 20)
      .attr('x', range[i])
      .attr('y', initY)
      .call(drag)
  }
}

