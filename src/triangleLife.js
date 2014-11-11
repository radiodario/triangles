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
    seeds: 5,
    updateInterval: 60,
    drawInterval: 60,
    waveform: 'triangle',
    monochrome: true,
    monochromeHue: 0,


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

    update: function() {
      var LN; // live neighbors
      var type; // 0, 1, 2 or 3
      var i, x, y, l, val;
      var NextField = this.initializeField();

      var N = this.N;

      for(i = 0, l = Field.length; i < l; i++) {

        x = i % N;
        y = i / N | 0;

        LN = 0;

        // left guy
        if (x > 0 && Field[i-1] > 0)
          LN++
        // right guy
        if (x < (N-1) && Field[i+1] > 0)
          LN++;

        type = (y % 2 << 1) + x % 2;

        if (type == 0 || type == 3) {
          if (y > 0 && Field[i-N] > 0)
            LN++;
        } else {
          if (y < (N-1) && Field[i+N] > 0)
            LN++;
        }

        val = Field[i];

        // live cell
        if (val > 0) {
          if (LN == 2) {
            val += 0.2;
          } else {
            val = 0;
          }
        } else {
          if (LN == 1) {
            val = 1;
          } else {
            val -= 0.1;
          }
        }

        NextField[i] = val;

      }

      Field = NextField;



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

        if (Field[i] < 0) continue;

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