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
  if (!(`interpolate${scheme}` in d3)) {
    scheme = "Rainbow";
  }

  let ncolorsText = ncolorsInput.value;
  let ncolors = parseInt(ncolorsText) || 2; 

  colors = [];
  for (let i = 0; i < ncolors; i++) {
    let c = d3[`interpolate${scheme}`](i/(ncolors-1))
    c = d3.color(c);
    c = [c.r, c.g, c.b, 255];
    colors.push(c);
  }

  model.drawCircles(ops, colors, ctx, width, height);
  console.log(colors);
}

function updateOps() {
  let opsText = opsInput.value;
  ops = opsText.split("\n")
    .map(d => d.trim())
    .map(d => d.split(" "))
    .map(d => d.map(dd => parseInt(dd) || 0))
    .map(d => model.createCircle(d[0] || 0, d[1] || 0));

  model.drawCircles(ops, colors, ctx, width, height);
  console.log(ops);
}

opsInput.addEventListener('change', updateOps); 
schemeInput.addEventListener('change', updateColors); 
ncolorsInput.addEventListener('change', updateColors); 
