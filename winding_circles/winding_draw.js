function clamp(n, min, max) {
  return Math.max(Math.min(n, max), min);
}

class Edge {
  constructor(p1, p2, height) {
    this.m = (p2.x - p1.x) / (p2.y - p1.y);
    this.b = p1.x - this.m * p1.y;
    this.top = clamp(Math.round(Math.min(p1.y, p2.y)), 0, height);
    this.bottom = clamp(Math.round(Math.max(p1.y, p2.y)), 0, height);
    this.currX = this.b + this.m * (this.top + 0.5);
    this.winding = p1.y > p2.y ? 1 : -1;
  }

  static addToArray(p1, p2, height, arr) {
    let y1 = clamp(Math.round(p1.y), 0, height);
    let y2 = clamp(Math.round(p2.y), 0, height);
    if (y1 == y2) {
      return null;
    }

    arr.push(new Edge(p1, p2, height));
  }

  static cmpX(e1, e2) {
    if (e1.currX < e2.currX) {
      return -1; 
    } else if (e1.currX > e2.currX) {
      return 1;
    }

    return 0
  }

  static cmpY(e1, e2) {
    if (e1.top < e2.top) {
      return -1; 
    } else if (e1.top > e2.top) {
      return 1;
    }

    return Edge.cmpX(e1, e2); 
  }

  increment() {
    this.currX += this.m;
  }

  active(y) {
    return y >= this.top && y < this.bottom 
  }
}

function paintRow(i, n, paint, pixels) {
  for (let j = i * 4; j < (i + n) * 4; j++) {
    pixels[j] = paint[j%4];
  }
}

function getIndex(x, y, width) {
  return x + y * width;
}

function windingDraw(points, pixels, colors, width, height) {
  if (points.length < 3) {
    return;
  }

  let edges = [];
  let prev = points[0];
  for (let i = 1; i < points.length; i++) {
    Edge.addToArray(prev, points[i], height, edges);
    prev = points[i];
  }
  Edge.addToArray(prev, points[0], height, edges);


  if (edges.length < 2) {
    return;
  }

  let y = 0; 
  while (y < height) {
    let active_edges = edges.filter(e => e.active(y));
    active_edges.sort(Edge.cmpX);

    let winding = 0;
    let left_eval = -1;
    let right_eval = -1;
    for (let e of active_edges) {
      if (winding == 0) {
        left_eval = e.currX;
        winding += e.winding;
        e.increment();
        continue;
      } 

      right_eval = e.currX;
      e.increment();
      
      left = clamp(Math.round(left_eval), 0, width);
      right = clamp(Math.round(right_eval), 0, width);
      if (left < right) {
        let colorIndex = Math.min(Math.abs(winding)-1, colors.length-1);
        paintRow(getIndex(left, y, width), right - left, colors[colorIndex], pixels);
      }

      winding += e.winding;
      left_eval = right_eval
    }
    y++;
  }
}
