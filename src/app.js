var triangleLife = require('./triangleLife');
var canvas = document.createElement('canvas');
var tL = null;
var animId = null;
var lastUpdate = 0


var setup = function() {
  canvas.width = window.innerWidth + 20;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  tL = triangleLife(canvas)
  tL.setup();
  
  window.onresize = tL.resize.bind(tL)
}


window.onload = setup
