var triangleLife = require('./triangleLife');
var canvas = document.createElement('canvas');
canvas.width = window.innerWidth + 20;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);


window.onload = function() {
  
  var tL = triangleLife(canvas)
  tL.setup();

  var lastUpdate = 0
  

  function run(timestamp) {

    if (timestamp > lastUpdate + tL.updateInterval()) {
      tL.update();
      lastUpdate = timestamp
    }

    tL.draw();

    requestAnimationFrame(run);

  }

  requestAnimationFrame(run);
  
}

