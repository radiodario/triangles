hslToRgb = require('./hslToRgb');


module.exports = function(canvas) {
  var N = 80;
  var context = canvas.getContext('2d');
  
  var edge = 0;
  var width = canvas.width;
  var height = canvas.height
  var SQRT2 = Math.sqrt(2);


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


  return {

    setup: function() {

      // setup listener
      canvas.addEventListener('click', this.random.bind(this));

      

      var kH = 2 * height / (N * Math.sqrt(2));
      var kW = 2 * width / N;

      edge = Math.max(kH, kW);

      this.init();


    },

    init: function() {
      this.random();
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
      // 
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
      context.clearRect(0, 0, width, height)
      howMany = Math.random() * 10
      for (var i = 0; i < howMany; i++) {
        var x = Math.floor(Math.random() * N)
        var y = Math.floor(Math.random() * N)

        console.log(x, y)
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
      
      var color = hslToRgb(255 * Math.random(), 1, 0.1);

      context.fillStyle = color
      context.fill();

    }

  }

}