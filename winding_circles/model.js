import {windingDraw} from "./winding_draw.js";

function createCircle(frequency, radius, phase) {
  return {
    type: "circle",
    frequency: frequency,
    radius: radius,
    phase: phase,
  }
}

function createScale(frequency, midpoint, magnitude, phase) {
  return {
    type: "scale",
    frequency: frequency,
    magnitude: magnitude,
    midpoint: midpoint,
    phase: phase,
  }
}

function createRotation(frequency, midpoint, magnitude, phase) {
  return {
    type: "rotation",
    frequency: frequency,
    magnitude: magnitude,
    midpoint: midpoint,
    phase: phase,
  }
}

function processOperation(op, mtx, t) {
  if (op.type == 'circle') {
    mtx.rotateSelf(t * op.frequency + op.phase * 360 / op.frequency)
    mtx.translateSelf(op.radius)
  } else if (op.type == 'scale') {
    let factor = op.midpoint + op.magnitude *  Math.sin(Math.PI * t / 180 * op.frequency + 2*Math.PI * op.phase / op.frequency);
    mtx.scaleSelf(factor);
  } else if (op.type == 'rotation') {
    mtx.rotateSelf(op.midpoint + op.magnitude * Math.sin(Math.PI * t / 180 * op.frequency + 2*Math.PI * op.phase / op.frequency));
  }
}

export function createOperation(...args) {
  if (args.length == 0) {
    return null; 
  }

  args[0] = args[0].toUpperCase();
  
  if (args[0] == 'C') {
    return createCircle(parseInt(args[1]) || 0, parseInt(args[2]) || 0, parseFloat(args[3]) || 0);
  } else if (args[0] == 'S') {
    return createScale(parseInt(args[1]) || 0, parseFloat(args[2]) || 0, parseFloat(args[3]) || 0, parseFloat(args[4]) || 0);
  } else if (args[0] == 'R') {
    return createRotation(parseInt(args[1]) || 0, parseFloat(args[2]) || 0, parseFloat(args[3]) || 0, parseFloat(args[4]) || 0);
  }

  return null;
}

export function drawOperations(ops, colors, ctx, width, height) {
  ctx.fillStyle = "white";
  ctx.rect(0, 0, width, height);
  ctx.fill();

  ops = ops.filter(d => d != null);

  if (ops.length == 0) {
    return;
  }

  let pts = [];
  let maxDistSq = 0;
  for (let t = 0; t < 360; t += 0.05) {
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
