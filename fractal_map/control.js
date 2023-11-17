import {Map, makeFractalMap} from "./model.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;
ctx.imageSmoothingEnabled = false;
ctx.rect(0,0,width,height);
ctx.fill();

let map = new Map(4, 4);
map.randomize(0.5);
for (let i = 0; i < 9; i++) {
  map = makeFractalMap(map, [[0, 0.2, .6], [.3, 0.2, 0]]);
}



canvas.addEventListener("click", function(event) {
  map.togglePixel(event.offsetX, event.offsetY, width, height);
  let img = map.getImageData();
  let bitmap = createImageBitmap(img).then(function(bitmap) {
    ctx.drawImage(bitmap, 0, 0, width, height);
  });
})

document.body.onkeyup = function(event) {
  if (event.key == ' ') {
    map = map.divide();
  }

  if (event.key == '0') {
    map.spread(0, [0, 0.2, 0.5, 0.8, 1]);
    let img = map.getImageData();
    let bitmap = createImageBitmap(img).then(function(bitmap) {
      ctx.drawImage(bitmap, 0, 0, width, height);
    });
  }

  if (event.key == '1') {
    map.spread(1, [0, 0.1, 0.2, 0.3, 1]);
    let img = map.getImageData();
    let bitmap = createImageBitmap(img).then(function(bitmap) {
      ctx.drawImage(bitmap, 0, 0, width, height);
    });
  }
}
