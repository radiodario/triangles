hslToRgb = require('./hslToRgb');
require('./requestAnimationFrame');

module.exports = function(canvas) {
  var N = 50;
  var context = canvas.getContext('2d');
  var stroke = false;
  var fill = true;
  var edge = 0;
  var width = canvas.width;
  var height = canvas.height
  var SQRT2 = Math.sqrt(2);
  var colorCounter = 0;
  var counterAngle = 0;
  var speed = 1000;
  var fg_alpha = 40;
  var bg_alpha = 20;
  var seeds = 5;
  var updateInterval = 20;
  var lastUpdate = 0;
  var lastDraw = 0;
  var drawInterval = 60;
  var waveform = 'triangle'
  var animId = null;
  var monochrome = true;
  var monochromeHue = 0;


  //========= CONTROLS
  var strokeInput = document.querySelector('input[name=stroke]');
  var fillInput = document.querySelector('input[name=fill]');
  var waveTypeInputs = document.querySelectorAll('input[name=wave]');
  var updateInput = document.querySelector('input[name=updateInterval]');
  var drawInput = document.querySelector('input[name=drawInterval]');
  var sizeInput = document.querySelector('input[name=triangleSize]');
  var monochromeInput = document.querySelector('input[name=monochrome]');
  var colorInput = document.querySelector('input[name=color]');
  var speedInput = document.querySelector('input[name=speed]');
  var bg_alphaInput = document.querySelector('input[name=bg_alpha]');
  var fg_alphaInput = document.querySelector('input[name=fg_alpha]');
  var seedsInput = document.querySelector('input[name=seeds]');
  var randomButton = document.querySelector('button#randomize')
  var saveButton = document.querySelector('button#save');
  var hideButton = document.querySelector('button#hide');



  function initializeField () {

    var field = [];
    for (var i = 0; i < N*N; i++) {
      field[i] = 0;
    }
    return field;
  }

  var Field = initializeField();

  var debug = document.querySelector('p');

  return {

    updateInterval: function() {
      return 1000 / updateInterval;
    },


    setup: function() {
      // stop all animations
      cancelAnimationFrame(animId);
      // setup listeners
      canvas.addEventListener('click', this.random.bind(this));

      this.setupControls();
      // calculate the side of the triangles;
      this.setSize();

      this.init();

    },

    init: function() {
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
      var kH = 2 * height / (N * Math.sqrt(2));
      var kW = 2 * width / N;

      edge = Math.max(kH, kW);
    },

    run: function(timestamp) {
      if (timestamp > lastUpdate + (1000/updateInterval)) {
        this.update();
        lastUpdate = timestamp;
      }

      if (timestamp > lastDraw + (1000/drawInterval)) {
        this.draw();
        lastDraw = timestamp;
      }


      animId = requestAnimationFrame(this.run.bind(this));


    },

    setupControlListeners : function() {
      strokeInput.addEventListener('change', function(e) {
        stroke = strokeInput.checked
      });
      fillInput.addEventListener('change', function(e) {
        fill = fillInput.checked
      });

      for (var i = 0; i < waveTypeInputs.length; i++) {
        waveTypeInputs[i].addEventListener('click', function(e) {
          waveform = e.currentTarget.value;
        });
      }
      updateInput.addEventListener('change', function(e) {
        updateInterval = Number(e.currentTarget.value);
      });
      drawInput.addEventListener('change', function(e) {
        drawInterval = Number(e.currentTarget.value);
      });

      var that = this;
      sizeInput.addEventListener('change', function (e) {
        N = Number(e.currentTarget.value);
        that.setSize();
        that.random();
      })
      monochromeInput.addEventListener('change', function (e) {
        monochrome = monochromeInput.checked;
      })
      colorInput.addEventListener('change', function(e) {
        monochromeHue = Number(e.currentTarget.value);
      });
      speedInput.addEventListener('change', function(e) {
        speed = Number(e.currentTarget.value);
      });
      bg_alphaInput.addEventListener('change', function(e) {
        bg_alpha = Number(e.currentTarget.value)
      });
      fg_alphaInput.addEventListener('change', function(e) {
        fg_alpha = Number(e.currentTarget.value)
      });
      seedsInput.addEventListener('click', function(e) {
        seeds = Number(e.currentTarget.value);
      });
      randomButton.addEventListener('click', this.randomize.bind(this));
      saveButton.addEventListener('click', this.saveSnap.bind(this));
      hideButton.addEventListener('click', this.toggleControls.bind(this));
    },

    setupControlValues : function() {
      strokeInput.checked = stroke;
      fillInput.checked = fill;

      for (var i = 0; i < waveTypeInputs.length; i++) {
        var el = waveTypeInputs[i]
        el.checked = el.value == waveform;
      }

      updateInput.value = updateInterval;
      drawInput.value = drawInterval;
      sizeInput.value = N;
      monochromeInput.checked = monochrome;
      colorInput.value = monochromeHue;
      speedInput.value = speed;
      bg_alphaInput.value = bg_alpha;
      fg_alphaInput.value = fg_alpha;
      seedsInput.value = seeds;
    },

    setupControls: function() {
      this.setupControlValues();
      this.setupControlListeners();
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
      var NextField = initializeField();


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
      context.fillStyle = 'rgba(0, 0, 0, ' + bg_alpha/100 +')';
      context.fillRect(0, 0, width, height);


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
      Field = initializeField();
      context.clearRect(0, 0, width, height);
      for (var i = 0; i < seeds; i++) {
        var idx = Math.floor(Math.random() * N * N)

        Field[idx] = 1;
      }
    },


    // set random settings
    randomize : function () {
      N = 2 + Math.floor(Math.random() * 100);
      stroke = (Math.random() >= 0.5);
      if (!stroke) {
        fill = true;
      } else {
        fill = (Math.random() >= 0.5);
      }

      colorCounter = 0;
      counterAngle = 0;
      speed = 1+ Math.floor(Math.random() * 1000);
      fg_alpha = 1 + Math.floor(Math.random() * 100);
      bg_alpha = 1 + Math.floor(Math.random() * 100);;
      seeds = 1 + Math.floor(Math.random() * 10);
      updateInterval = 10 + Math.floor(Math.random() * 100);
      drawInterval = 10 + Math.floor(Math.random() * 100);
      waveform = ['triangle', 'saw', 'sine'][Math.floor(Math.random() * 2)]
      monochrome = (Math.random() >= 0.5);
      monochromeHue = 100 * Math.random();

      this.setupControlValues();
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

      var val = Field[x + (N * y)];

      if (monochrome) {
        var color = hslToRgb(monochromeHue * 0.01, 1, 0.5, fg_alpha / 100);
      } else {
        counterIncrease = Math.PI / speed;
        counterAngle += counterIncrease;
        // sin
        switch (waveform) {
          case 'sine':
            colorCounter = 1 + (Math.sin(counterAngle)/2);
            break;
          case 'triangle':
            colorCounter = Math.abs((counterAngle % 2) - 1);
            break;
          case 'saw':
            colorCounter = Math.abs((counterAngle % 1))
            break;
        }



        var color = hslToRgb(colorCounter, 1, 0.5, fg_alpha / 100);
      }


      if (fill) {
        context.fillStyle = color;
        context.fill();
      }
      if (stroke){
        context.strokeStyle = color
        context.stroke();
      }

    }

  }

}