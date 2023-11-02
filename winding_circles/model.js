export function createCircle(radius, frequency) {
  return {
    type: "circle",
    radius: radius,
    frequency: frequency
  }
}

export function createLine(magnitude, frequency) { 
  return {
    type: "line",
    magnitude: magnitude,
    frequency: frequency
  }
}

function processOperation(op, mtx, t) {
  if (op.type == 'circle') {
    mtx.rotateSelf(t * op.frequency)
    mtx.translateSelf(op.radius)
  } else if (op.type == 'line') {
    let factor = 1 + op.magnitude *  Math.sin(Math.PI * t / 180 * op.frequency);
    mtx.scaleSelf(factor);
  }
}

export function createOperation(...args) {
  if (args[0] == 'C') {
    return createCircle(parseInt(args[1]) || 0, parseInt(args[2]) || 0);
  } else if (args[0] == 'L') {
    return createLine(parseFloat(args[1]) || 0, parseInt(args[2]) || 0);
  }

  return createCircle(0, 0);
}

export function drawCircles(ops, colors, ctx, width, height) {
  if (ops.length == 0) {
    return;
  }

  ctx.fillStyle = "white";
  ctx.rect(0, 0, width, height);
  ctx.fill();
  let pts = [];
  let maxDistSq = 0;
  for (let t = 0; t < 360; t += 0.1) {
    let mtx = new DOMMatrix();
    for (let op of ops) {
      processOperation(op, mtx, t);
    }

    let pt = new DOMPoint(0, 0);
    pt = pt.matrixTransform(mtx);
    let distSq = pt.x * pt.x + pt.y * pt.y;
    if (distSq > maxDistSq) {
      maxDistSq = distSq;
    }
    pts.push(pt)
  }

  let maxDist = Math.sqrt(maxDistSq);
  if (maxDist < 1) { return; }
  let factor = Math.min(width, height) / maxDist / 2;

  // scale to fit canvas
  // and translate to center
  let mtx = new DOMMatrix();
  mtx.translateSelf(width/2, height/2);
  mtx.scaleSelf(factor);

  pts = pts.map(p => p.matrixTransform(mtx));

  let pixels = ctx.getImageData(0, 0, width, height);
  windingDraw(pts, pixels.data, colors, width, height);
  ctx.putImageData(pixels, 0, 0);
} 
