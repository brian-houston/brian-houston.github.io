import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function createCircle(radius, frequency) {
  return {
    type: "circle",
    radius: radius,
    frequency: frequency
  }
}

function processOperation(op, mtx, t) {
  if (op.type == 'circle') {
    mtx.rotateSelf(t * op.frequency)
    mtx.translateSelf(op.radius)
  } 
}

function addOperation(arr, ...args) {
  let op = null;
  if (args[0] == 'circle') {
    op = createCircle(args[1], args[2]);
  } 

  if (op) {
    arr.push(op);
  }
}

export function drawCircles(ops, colors, ctx, width, height) {
  ctx.fillStyle = "white";
  ctx.rect(0, 0, width, height);
  ctx.fill();
  let pts = [];
  for (let t = 0; t < 360; t += 0.1) {
    let mtx = new DOMMatrix();
    mtx.translateSelf(width/2, height/2);
    for (let op of ops) {
      processOperation(op, mtx, t);
    }

    let pt = new DOMPoint(0, 0);
    pt = pt.matrixTransform(mtx);
    pts.push(pt)
  }

  let pixels = ctx.getImageData(0, 0, width, height);
  windingDraw(pts, pixels.data, colors, width, height);
  ctx.putImageData(pixels, 0, 0);
} 
