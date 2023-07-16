import * as dat from "dat.gui";
import triangleLife, { ISettings } from "./triangleLife";
var canvas = document.createElement("canvas");
var tL: ReturnType<typeof triangleLife> = null;
var animId = null;
var lastUpdate = 0;

var setup = function () {
  canvas.width = window.innerWidth + 20;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  tL = triangleLife(canvas);

  saver.tryLoadSettings(tL);

  var gui = new dat.GUI();

  var startN = 50;

  var c = gui.add(tL.settings, "N").name("Grid Size").min(0).max(500).step(1).listen();

  c.onChange(function (val) {
    tL.setSize();
    tL.random();
  });

  c.onFinishChange(function (val) {
    tL.setSize();
    tL.random();
  });

  gui.add(tL.settings, "drawInterval").name("Draw Speed").min(1).max(120).listen();
  gui.add(tL.settings, "updateInterval").name("Update Speed").min(1).max(120).listen();
  var seeds = gui
    .add(tL.settings, "seeds")
    .name("Seeds")
    .min(1)
    .max(25000)
    .step(1)
    .listen();

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
    "*4,6/4,4",
  ];

  var ruleSelect = gui.add(tL.settings, "rule", rulePresets).name("Game Rules").listen();

  ruleSelect.onChange(function () {
    tL.parseRule();
  });

  var customRuleField = gui.add(tL.settings, "rule").name("Custom Rule").listen();

  customRuleField.onFinishChange(function (val) {
    tL.settings.rule = val;
    tL.parseRule();
  });

  gui.add(tL.settings, "stroke").listen();
  gui.add(tL.settings, "fill").listen();

  gui.add(tL.settings, "fg_alpha").name("FG Alpha").min(0).max(100).listen();
  gui.add(tL.settings, "bg_alpha").name("BG Alpha").min(0).max(100).listen();
  gui.add(tL.settings, "monochrome").name("Monochrome").listen();
  gui.add(tL.settings, "monochromeHue").name("Hue").min(0).max(360).listen();
  gui.add(tL.settings, "cycleHue").name("Cycle Hue").listen();

  gui.add(tL.settings, "speed").name("Colour Speed").min(1).max(1000).listen();
  gui
    .add(tL.settings, "waveform", ["sin", "cos", "triangle", "saw"])
    .name("Colour Waveform")
    .listen();

  gui.add(tL, "randomize").name("Randomize!");

  gui.add(tL, "saveSnap").name("Save Snap");
  
  gui.add(saver, "saveSettings").name("Save Settings");

  var title = document.querySelector(".title.show") as HTMLElement;

  var fade = 1;
  var speed = 0.01;

  var fadeOut = function () {
    fade -= speed;
    title.style.opacity = "" + fade;
    if (fade >= 0) {
      requestAnimationFrame(fadeOut);
    } else {
      title.style.display = "none";
    }
  };

  tL.setup();

  setTimeout(fadeOut, 5000);

  window.onresize = tL.resize.bind(tL);
};

var saver = {
  saveSettings() {
    const url = new URL(location.toString().replace(location.search, ""));
    var settingsJSON = JSON.stringify(tL.settings);
    var params = new URLSearchParams();
    params.set("s", encodeURIComponent(settingsJSON));

    url.searchParams.set("s", encodeURIComponent(settingsJSON));
    window.open(url, "_blank");
  },
  tryLoadSettings(tL: ReturnType<typeof triangleLife>) {
    var params = new URLSearchParams(window.location.search);
    var encodedSettings = params.get("s");
    try {
      var settings: ISettings | null = JSON.parse(decodeURIComponent(encodedSettings));
      console.log("loaded settings:", settings);
      if (settings != null) {
        tL.loadSettings(settings);
      }
    } catch (e) {
      console.error("couldn't load settings", e);
    }
  },
};


export default setup;
