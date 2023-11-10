import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as model from "./model.js";

let colors = [[0, 0, 0, 255]];
let ops = [];

const opsInput = document.getElementById('ops');
const schemeInput = document.getElementById('scheme');
const ncolorsInput = document.getElementById('ncolors');
const downloadButton = document.getElementById('download');
const downloadSizeInput = document.getElementById('download_size');
const downloadEdgesInput = document.getElementById('download_edges');

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

  model.drawOperations(ops, colors, ctx, width, height);
}

function updateOps() {
  let opsText = opsInput.value;
  ops = opsText.split("\n")
    .map(d => d.trim())
    .filter(d => d.slice(0,1) != '#')
    .map(d => d.split(" "))
    .map(d => model.createOperation(...d));

  model.drawOperations(ops, colors, ctx, width, height);
}

async function download() {
  let downloadSizeText = downloadSizeInput.value.trim();
  let size = parseInt(downloadSizeText) || width;
  size = Math.min(size, 8192);

  let downloadEdgesText = downloadEdgesInput.value.trim();
  let edges = parseInt(downloadEdgesText) || 7200;
  edges = Math.min(edges, 1000000);
  
  let osCanvas = new OffscreenCanvas(size, size);
  let osCtx = osCanvas.getContext('2d'); 
  model.drawOperations(ops, colors, osCtx, size, size, edges);

  let blob = await osCanvas.convertToBlob();
  let url = window.URL.createObjectURL(blob);

  let anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = "wc.png";
  anchor.click();

  window.URL.revokeObjectURL(url);
  anchor.remove();
}

opsInput.addEventListener('change', updateOps); 
schemeInput.addEventListener('change', updateColors); 
ncolorsInput.addEventListener('change', updateColors); 
downloadButton.addEventListener("click", download);

opsInput.value = "C 1 100\nC 10 -110\nC 50 -10";
schemeInput.value = "Cool";
ncolorsInput.value = "12";

updateColors();
updateOps();
