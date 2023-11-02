import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as model from "./model.js";

let colors = [[0, 0, 0, 255]];
let ops = [];

const opsInput = document.getElementById('ops');
const schemeInput = document.getElementById('scheme');
const ncolorsInput = document.getElementById('ncolors');

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;

function updateColors() {
  let schemeText = schemeInput.value;
  let scheme = schemeText.trim();
  let reverse = false;
  if (scheme.slice(-1) == 'R') {
    reverse = true;
    scheme = scheme.slice(0, -1);
  }
  if (!(`interpolate${scheme}` in d3)) {
    scheme = "Rainbow";
  }

  let ncolorsText = ncolorsInput.value;
  let ncolors = parseInt(ncolorsText) || 2; 

  colors = [];
  for (let i = 0; i < ncolors; i++) {
    let t = reverse ? 1 - i/(ncolors-1) : i/(ncolors-1);
    let c = d3[`interpolate${scheme}`](t);
    c = d3.color(c);
    c = [c.r, c.g, c.b, 255];
    colors.push(c);
  }

  model.drawCircles(ops, colors, ctx, width, height);
}

function updateOps() {
  let opsText = opsInput.value;
  ops = opsText.split("\n")
    .map(d => d.trim())
    .map(d => d.split(" "))
    .map(d => model.createOperation(...d));

  console.log(ops);
  model.drawCircles(ops, colors, ctx, width, height);
}

opsInput.addEventListener('change', updateOps); 
schemeInput.addEventListener('change', updateColors); 
ncolorsInput.addEventListener('change', updateColors); 

opsInput.value = "100 1\n-110 10\n-10 50";
schemeInput.value = "Cool";
ncolorsInput.value = "12";

updateColors();
updateOps();
