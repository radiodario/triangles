hslToRgb = require('./hslToRgb');


module.exports = function(canvas) {
  var N = 80;
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
  var waveform = 'triangle'
  
  function initializeField () {
    var field = new Array(N)
    for (var i = 0; i < N; i++) {
      field[i] = new Array(N);
      for (var j = 0; j < N; j++) {
        field[i][j] = 0;
      }
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

      // setup listeners
      canvas.addEventListener('click', this.random.bind(this));

      this.setupControls();


      var kH = 2 * height / (N * Math.sqrt(2));
      var kW = 2 * width / N;

      edge = Math.max(kH, kW);

      this.init();


    },

    init: function() {
      this.random();
    },

    setupControls: function() {
      var strokeInput = document.querySelector('input[name=stroke]');
      strokeInput.checked = stroke;
      strokeInput.addEventListener('change', function(e) {
        stroke = strokeInput.checked
      })
      var fillInput = document.querySelector('input[name=fill]');
      fillInput.checked = fill;
      fillInput.addEventListener('change', function(e) {
        fill = fillInput.checked
      })


      var waveTypeInputs = document.querySelectorAll('input[name=wave]');

      for (var i = 0; i < waveTypeInputs.length; i++) {
        waveTypeInputs[i].addEventListener('click', function(e) {
          waveform = e.currentTarget.value;
        })
      }

      var updateInput = document.querySelector('input[name=updateInterval]')
      updateInput.value = updateInterval;
      updateInput.addEventListener('change', function(e) {
        updateInterval = Number(e.currentTarget.value);
      });

      var speedInput = document.querySelector('input[name=speed]')
      speedInput.value = speed;
      speedInput.addEventListener('change', function(e) {
        speed = Number(e.currentTarget.value);
      });
      
      var bg_alphaInput = document.querySelector('input[name=bg_alpha]')
      bg_alphaInput.value = bg_alpha;
      bg_alphaInput.addEventListener('change', function(e) {
        bg_alpha = Number(e.currentTarget.value)
      });
     
      var fg_alphaInput = document.querySelector('input[name=fg_alpha]')
      fg_alphaInput.value = fg_alpha;
      fg_alphaInput.addEventListener('change', function(e) {
        fg_alpha = Number(e.currentTarget.value)
      });

      var seedsInput = document.querySelector('input[name=seeds]');
      seedsInput.value = seeds;
      seedsInput.addEventListener('click', function(e) {
        seeds = Number(e.currentTarget.value);
      });

      var randomButton = document.querySelector('button#randomize')
      randomButton.addEventListener('click', this.random.bind(this));

      var saveButton = document.querySelector('button#save');
      saveButton.addEventListener('click', this.saveSnap.bind(this));

      var hideButton = document.querySelector('button#hide');
      hideButton.addEventListener('click', this.toggleControls.bind(this));
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
      var x, y, val;
      var NextField = initializeField();


      for (y = 0; y < N; y++) {
        for (x = 0; x < N; x++) {
          LN = 0;
          
          // left guy
          if (x > 0 && Field[x-1][y] > 0) 
            LN++
          // right guy
          if (x < (N-1) && Field[x+1][y] > 0) 
            LN++;

          type = (y % 2 << 1) + x % 2

          if (type == 0 || type == 3) {
            if (y > 0 && Field[x][y-1] > 0) 
              LN++;
          } else {
            if (y < (N-1) && Field[x][y+1] > 0)
              LN++;
          }

          val = NextField[x][y];

          if (val > 0.5) {
            if (LN == 2) {
              NextField[x][y] = val + 0.2;
            } else {
              NextField[x][y] = 0
            }
          } else {
            if (LN == 1) {
              NextField[x][y] = 1;
            } else {
              NextField[x][y] = val - 0.1
            }
          }

        }


      }

      Field = NextField;



    },

    draw: function() {
      context.fillStyle = 'rgba(0, 0, 0, ' + bg_alpha/100 +')';
      debug.innerHTML = 'rgba(0, 0, 0, ' + bg_alpha/100 +')';
      context.fillRect(0, 0, width, height);


      var x, y, 
          baseY, 
          lEdge = edge * SQRT2 / 2;

      var translate = {
        x: 0,//(width - N * edge / 2 ) / 2,
        y: 0//(height - N * edge * SQRT2 / 2) / 2
      }

      for (y = 0; y < N; y++) {
        for (x = 0; x < N; x++) {

          if (Field[x][y] > 0) {
            baseY = y * lEdge
            this.drawTriangle(x, y, lEdge, baseY, translate)




          }
        }
      }




    },


    random : function () {
      Field = initializeField();
      context.clearRect(0, 0, width, height);
      for (var i = 0; i < seeds; i++) {
        var x = Math.floor(Math.random() * N)
        var y = Math.floor(Math.random() * N)

        Field[x][y] = 1;
      }


        
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
      debug.innerHTML = waveform;

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