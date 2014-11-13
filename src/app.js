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

  var startN = 50

  var c = gui.add(tL, 'N').name("Grid Size").min(0).max(500).step(1).listen();

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
  var seeds = gui.add(tL, 'seeds').name("Seeds").min(1).max(25000).step(1).listen();


  var rulePresets = [
    "2/1",
    "2/2",
    "0,1/3,3",
    "1,2/4,6",
    "*2/3",
    "*2,3/3,3",
    "*2,3/4,5",
    "*2,3/4,6",
    "*3,4/4,5",
    "*3,4/4,6",
    "**4,5/4,6",
    "*4,6/4,4"
  ]

  var ruleSelect = gui.add(tL, 'rule', rulePresets).name("Game Rules").listen();

  ruleSelect.onChange(function() {
    tL.parseRule();
  });

  var customRuleField = gui.add(tL, 'rule').name("Custom Rule").listen();

  customRuleField.onFinishChange(function(val) {
    tL.rule = val;
    tL.parseRule();
  })

  gui.add(tL, 'stroke').listen();
  gui.add(tL, 'fill').listen();

  gui.add(tL, 'fg_alpha').name("FG Alpha").min(0).max(100).listen();
  gui.add(tL, 'bg_alpha').name("BG Alpha").min(0).max(100).listen();
  gui.add(tL, 'monochrome').name("Monochrome").listen();
  gui.add(tL, 'monochromeHue').name("Hue").min(0).max(360).listen();
  gui.add(tL, 'cycleHue').name("Cycle Hue").listen();

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
