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

  cancelAnimationFrame(animId);
  animId = requestAnimationFrame(run);
}


function run(timestamp) {

  if (timestamp > lastUpdate + tL.updateInterval()) {
    tL.update();
    lastUpdate = timestamp
  }

  tL.draw();

  animId = requestAnimationFrame(run);

}




window.onload = setup
window.onresize = setup