var triangleLife = require('./triangleLife');
var canvas = document.createElement('canvas');
canvas.width = window.innerWidth + 20;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);


window.onload = function() {
  
  var tL = triangleLife(canvas)
  tL.setup();

  function run(timestamp) {

    tL.update();
    tL.draw();

    requestAnimationFrame(run);

  }

  requestAnimationFrame(run);
  
}

