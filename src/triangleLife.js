hslToRgb = require('./hslToRgb');

var dat = require('dat.gui');


module.exports = function(canvas) {
  var context = canvas.getContext('2d');
  var edge = 0;
  var width = canvas.width;
  var height = canvas.height
  var SQRT2 = Math.sqrt(2);
  var colorCounter = 0;
  var counterAngle = 0;
  var lastUpdate = 0;
  var lastDraw = 0;
  var animId = null;

  var rule = "2/1";

  var Field;

  var debug = document.querySelector('p');

  return {

    // settings
    N: 50,
    stroke: false,
    fill: true,
    speed: 1000,
    fg_alpha: 40,
    bg_alpha: 20,
    seeds: 50*50/2,
    updateInterval: 60,
    drawInterval: 60,
    waveform: 'triangle',
    monochrome: true,
    monochromeHue: 0,
    rule : "2/1",

    setup: function() {
      // stop all animations
      cancelAnimationFrame(animId);
      // setup listeners
      canvas.addEventListener('click', this.random.bind(this));

      this.setSize();

      this.init();

    },

    initializeField: function() {
      var field = [];
      var allCells = this.N*this.N;
      for (var i = 0; i < allCells; i++) {
        field[i] = 0;
      }
      return field;
    },

    init: function() {
      this.parseRule();
      Field = this.initializeField()
      this.random();
      animId = requestAnimationFrame(this.run.bind(this));
    },


    resize : function() {
      width = canvas.width = window.innerWidth + 20;
      height = canvas.height = window.innerHeight;

      this.setSize();
    },

    setSize: function() {
      // triangle height and width
      var kH = 2 * height / (this.N * Math.sqrt(2));
      var kW = 2 * width / this.N;

      edge = Math.max(kH, kW);
    },

    run: function(timestamp) {
      if (timestamp > lastUpdate + (1000/this.updateInterval)) {
        this.update();
        lastUpdate = timestamp;
      }

      if (timestamp > lastDraw + (1000/this.drawInterval)) {
        this.draw();
        lastDraw = timestamp;
      }

      animId = requestAnimationFrame(this.run.bind(this));
    },

    saveSnap : function() {
      var imgURI = canvas.toDataURL('image/png');
      window.open(imgURI);
      console.log('opening', imgURI)
    },

    toggleControls : function(e) {
      var t = document.querySelector('.title');
      if (t.classList.contains('hide')) {
        t.classList.remove('hide')
        t.classList.add('show')
        e.currentTarget.innerHTML = 'Hide'
      } else {
        t.classList.add('hide')
        t.classList.remove('show')
        e.currentTarget.innerHTML = 'Controls'
      }
    },

    neighbours : {
        'O' : [
          [-1, -2],
          [-1, -1],
          [-1,  0],
          [-1,  1],
          [-1,  2],
          [ 0, -2],
          [ 0, -1],
          [ 0,  1],
          [ 0,  2],
          [ 1, -1],
          [ 1,  0],
          [ 1,  1]
        ],
        'E' : [
          [-1, -1],
          [-1,  0],
          [-1,  1],
          [0,  -2],
          [0,  -1],
          [0,   1],
          [0,   2],
          [1,  -2],
          [1,  -1],
          [1,   0],
          [1,   1],
          [1,   2]
        ]
    },

    computeLiveNeighbours: function(i) {
      var N = this.N;
      var x = i % N;
      var y = i / N | 0;
      var LN = 0;

      /*
      Each cell has 12 touching neighbors. There are two
      types of cells, E and O cells.
      */
      // var type = (y % 2 << 1) + x % 2;
      var type = (x + y) % 2;
      var i, l, nList, nb;

      // Even Cell
      if (type === 1) {
        nList = this.neighbours.E;
      }
      // Odd Cell
      else {
        nList = this.neighbours.O;
      }
      for (i = 0, l = nList.length; i < l; i++) {
        var nb = this.neighbourAt(x, y, nList[i]);
        LN += nb;
      }

      return LN;


    },

    neighbourAt: function(x, y, neighbour) {
      var N = this.N;
      var dx = x + neighbour[1];
      var dy = y + neighbour[0];
      // wrap around
      if (dx >= N) dx = dx % N;
      if (dx < 0) dx = N + dx;
      if (dy >= N) dy = dy % N;
      if (dy < 0) dy = N + dy;

      var index = dx + (dy * N);


      return Field[dx + (dy * N)] || 0;

    },


    update: function() {
      var LN = 0; // live neighbors
      var type; // 0, 1, 2 or 3
      var i, x, y, l, val;
      var NextField = this.initializeField();

      var N = this.N;

      for(i = 0, l = Field.length; i < l; i++) {

        LN = this.computeLiveNeighbours(i);

        val = Field[i];

        NextField[i] = this.computeNextStateOfCell(i, LN);

      }

      Field = NextField;


    },


    computeNextStateOfCell : function(i, LN) {
      var val = Field[i];

      if (val > 0) {
          if (LN >= this.lifeSettings.env.l && LN <= this.lifeSettings.env.h) {
            val = 1;
          } else {
            val = 0;
          }
        } else {
          if (LN >= this.lifeSettings.fer.l && LN <= this.lifeSettings.fer.h) {
            val = 1;
          } else {
            val = 0;
          }
        }
      return val;
    },


    parseRule : function() {
      var ruleExp = /(\d+|\d+,\d+)\/(\d+|\d+,\d+)$/i;

      var results = ruleExp.exec(this.rule);

      if (!results || results.length !== 3) {
        var settings = {
          env: {
            l: 2,
            h: 2
          },
          fer: {
            l: 1,
            h: 1
          },
        }
        this.rule = "2/1";
      } else {
        var settings = {
          env: {},
          fer: {}
        };

        // environment
        var env = results[1];
        if (env.length >= 3) {
          env = env.split(',');
          settings.env.l = +env[0];
          settings.env.h = +env[1];
        } else {
          settings.env.l = +env;
          settings.env.h = +env;
        }

        // fertility
        var fer = results[2];
        if (fer.length >= 3) {
          fer = fer.split(',');
          settings.fer.l = +fer[0];
          settings.fer.h = +fer[1];
        } else {
          settings.fer.l = +fer;
          settings.fer.h = +fer;
        }


      }
      console.log("Parsed Rule:", this.rule, "into", settings);
      this.lifeSettings = settings;

    },

    draw: function() {
      context.fillStyle = 'rgba(0, 0, 0, ' + this.bg_alpha/100 +')';
      context.fillRect(0, 0, width, height);

      var N = this.N;
      var x, y, i, l,
          baseY,
          lEdge = edge * Math.cos(Math.PI/6);

      var translate = {
        x: 0,//(width - N * edge / 2 ) / 2,
        y: 0//(height - N * edge * SQRT2 / 2) / 2
      }

      for(i = 0, l = Field.length; i < l; i++) {

        if (Field[i] <= 0) continue;

        x = i % N;
        y = i / N | 0;

        baseY = y * lEdge
        this.drawTriangle(x, y, lEdge, baseY, translate)

      }

    },

    // Set random seeds
    random : function () {
      Field = this.initializeField();
      context.clearRect(0, 0, width, height);
      var N = this.N;
      for (var i = 0; i < this.seeds; i++) {
        var idx = Math.floor(Math.random() * N * N)

        Field[idx] = 1;
      }
    },


    // set random settings
    randomize : function () {
      this.N = 2 + Math.floor(Math.random() * 100);
      this.stroke = (Math.random() >= 0.5);
      if (!this.stroke) {
        this.fill = true;
      } else {
        this.fill = (Math.random() >= 0.5);
      }

      this.colorCounter = 0;
      this.counterAngle = 0;
      this.speed = 1+ Math.floor(Math.random() * 1000);
      this.fg_alpha = 1 + Math.floor(Math.random() * 100);
      this.bg_alpha = 1 + Math.floor(Math.random() * 100);;
      this.seeds = 1 + Math.floor(Math.random() * 10);
      this.updateInterval = 10 + Math.floor(Math.random() * 100);
      this.drawInterval = 10 + Math.floor(Math.random() * 100);
      this.waveform = ['triangle', 'saw', 'sine'][Math.floor(Math.random() * 2)]
      this.monochrome = (Math.random() >= 0.5);
      this.monochromeHue = 100 * Math.random();

      this.setSize();
      this.random();
    },

    drawTriangle: function(x, y, lEdge, baseY, translate) {
      context.beginPath();

      var type = (y%2 << 1) + x%2 ;

      switch (type) {
        case 0:
          context.moveTo( ((x+0) * edge/2) + translate.x, baseY + translate.y);
          context.lineTo( ((x+2) * edge/2) + translate.x, baseY + translate.y);
          context.lineTo( ((x+1) * edge/2) + translate.x, baseY + lEdge + translate.y);
          break;
        case 1:
          context.moveTo( ((x+1) * edge/2) + translate.x, baseY + translate.y);
          context.lineTo( ((x+2) * edge/2) + translate.x, baseY + lEdge + translate.y);
          context.lineTo( ((x+0) * edge/2) + translate.x, baseY + lEdge + translate.y);
          break;
        case 2:
          context.moveTo( ((x+1) * edge/2) + translate.x, baseY + translate.y);
          context.lineTo( ((x+2) * edge/2) + translate.x, baseY + translate.y + lEdge);
          context.lineTo( ((x+0) * edge/2) + translate.x, baseY + translate.y + lEdge);
          break;
        case 3:
          context.moveTo( ((x+0) * edge/2) + translate.x, baseY + translate.y);
          context.lineTo( ((x+2) * edge/2) + translate.x, baseY + translate.y);
          context.lineTo( ((x+1) * edge/2) + translate.x, baseY + translate.y + lEdge);
          break;
      }


      context.closePath();

      this.setColors(x, y);

    },

    setColors: function(x, y) {

      // var val = Field[x + (N * y)];

      if (this.monochrome) {
        var color = hslToRgb(this.monochromeHue/360, 1, 0.5, this.fg_alpha / 100);
      } else {

        var speed = 1001 - this.speed;

        counterIncrease = Math.PI / speed;
        counterAngle += counterIncrease;
        // sin
        switch (this.waveform) {
          case 'sin':
            colorCounter = 1 + (Math.sin(counterAngle)/2);
            break;
          case 'cos' :
            colorCounter = 1 + (Math.cos(counterAngle)/2);
            break;
          case 'triangle':
            colorCounter = Math.abs((counterAngle % 2) - 1);
            break;
          case 'saw':
            colorCounter = Math.abs((counterAngle % 1))
            break;
        }



        var color = hslToRgb(colorCounter, 1, 0.5, this.fg_alpha / 100);
      }


      if (this.fill) {
        context.fillStyle = color;
        context.fill();
      }
      if (this.stroke){
        context.strokeStyle = color
        context.stroke();
      }

    }

  }

}