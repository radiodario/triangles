var triangleLife = require('./triangleLife');
var canvas = document.createElement('canvas');
var tL = null;
var animId = null;
var lastUpdate = 0;

var dat = require('dat.gui');



var setup = function() {
  canvas.width = window.innerWidth + 20;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  tL = triangleLife(canvas)

  var gui = new dat.GUI();


  var c = gui.add(tL, 'N').name("Grid Size").min(0).max(100).step(1).listen();

  c.onChange(function(val) {
    tL.setSize();
    tL.random();
  });

  c.onFinishChange(function(val) {
    tL.setSize();
    tL.random();
  })

  gui.add(tL, 'drawInterval').name("Draw Speed").min(1).max(120).listen();
  gui.add(tL, 'updateInterval').name("Update Speed").min(1).max(120).listen();
  gui.add(tL, 'seeds').name("Seeds").min(1).max(10).step(1).listen();

  gui.add(tL, 'stroke').listen();
  gui.add(tL, 'fill').listen();

  gui.add(tL, 'monochrome').name("Monochrome").listen();
  gui.add(tL, 'monochromeHue').name("Hue").min(0).max(360).listen();
  gui.add(tL, 'fg_alpha').name("FG Alpha").min(0).max(100).listen();
  gui.add(tL, 'bg_alpha').name("BG Alpha").min(0).max(100).listen();

  gui.add(tL, 'speed').name("Colour Speed").min(1).max(1000).listen();
  gui.add(tL, 'waveform', ['sin', 'cos', 'triangle', 'saw']).name("Colour Waveform").listen();

  gui.add(tL, 'randomize').name("Randomize!");

  gui.add(tL, 'saveSnap').name("Save Snap");


  var title = document.querySelector('.title.show');

  var fade = 1;
  var speed = 0.01;


  var fadeOut = function() {
    fade -= speed;
    title.style.opacity = fade;
    if (fade >= 0) {
      requestAnimationFrame(fadeOut);
    } else {
      title.style.display = "none";
    }
  };

  tL.setup();

  setTimeout(fadeOut, 5000);

  window.onresize = tL.resize.bind(tL)
}


window.onload = setup
