function clamp(v, min, max) {
  return Math.min(max, Math.max(v, min));
}

export class Map {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.array = new Array(width * height).fill(0);
  }

  at(x, y) {
    x = clamp(x, 0, this.width - 1);
    y = clamp(y, 0, this.height - 1);
    return this.array[x + y * this.width];
  }

  get(x, y) {
    return this.array[x + y * this.width];
  }

  set(x, y, v) {
    this.array[x + y * this.width] = v;
  }

  toggle(x, y) {
    this.set(x, y, 1 - this.at(x, y));
  }

  togglePixel(cx, cy, cwidth, cheight) {
    let x = Math.floor(this.width * cx/cwidth);
    let y = Math.floor(this.height * cy/cheight);
    this.toggle(x, y);
  }

  divide() {
    let map = new Map(this.width * 2, this.height * 2);
    for (let x = 0; x < this.width * 2; x++) {
      for (let y = 0; y < this.height * 2; y++) {
        let x2 = Math.floor(x/2);
        let y2 = Math.floor(y/2);
        map.set(x, y, this.get(x2, y2));
      }
    }
    return map;
  }

  getImageData() {
    let img = new ImageData(this.width, this.height);
    for (let i = 0; i < this.width * this.height; i+=1) {
      let j = 4 * i;
      if (this.array[i] == 0) {
        img.data[j] = 0;
        img.data[j + 1] = 0;
        img.data[j + 2] = 255;
        img.data[j + 3] = 255;
      } else {
        img.data[j] = 0;
        img.data[j + 1] = 255;
        img.data[j + 2] = 0;
        img.data[j + 3] = 255;
      }
    }
    return img;
  }

  getSumNeighbors(x, y) {
    let v = this.get(x, y);
    let xsum = (this.at(x - 1, y) != v) + (this.at(x + 1, y) != v);
    let ysum = (this.at(x, y - 1) != v) + (this.at(x, y + 1) != v);
    return xsum + ysum;
  }

  spread(v, probs) {
    let narray = this.array.map(d => d); 
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.get(x, y) != v) {
          let sum = this.getSumNeighbors(x, y);
          if (Math.random() < probs[sum]) {
            narray[x + y * this.width] = 1 - this.get(x, y);
          }
        }
      }
    }
    this.array = narray;
  }

  randomize(prob) {
    for (let i = 0; i < this.array.length; i++) {
      if (Math.random() < prob) {
        this.array[i] = 1;
      } else {
        this.array[i] = 0;
      }
    }
  }

  getQuarterNeighborSum(qx, qy) {
    // quarter cell (qx, qy) is inside cell (x, y)
    let x = Math.floor(qx/2);
    let y = Math.floor(qy/2);

    // cells (nx, y) and (x, ny) border quarter cell (qx, qy)
    let nx = x + 2 * (qx % 2) - 1;
    let ny = y + 2 * (qy % 2) - 1;

    return this.at(nx, y) + this.at(x, ny);
  }
}

export function makeFractalMap(map, probs) {
  let map2 = map.divide(); 

  for (let y = 0; y < map2.height; y++) {
    for (let x = 0; x < map2.width; x++) {
      let v = map2.get(x, y);
      let sum = map.getQuarterNeighborSum(x, y);
      let prob = probs[v][sum];
      if (Math.random() < prob) {
        map2.toggle(x, y);
      }
    }
  }

  return map2;
}
