import hslToRgb from './hslToRgb';

var dat = require('dat.gui');
    
interface ILifeRuleSettings {
  env: {
    l: number;
    h: number;
  };
  fer: {
    l: number;
    h: number;
  };
}

export interface ISettings {
  N: number,
  stroke: boolean,
  fill: boolean,
  speed: number,
  fg_alpha: number,
  bg_alpha: number,
  seeds: number,
  updateInterval: number,
  drawInterval: number,
  waveform: 'triangle' | 'sine' | 'saw',
  monochrome: boolean,
  monochromeHue: number,
  cycleHue: boolean,
  rule : string,
}

export default function (canvas: HTMLCanvasElement) {
  const SQRT2 = Math.sqrt(2);
  const context = canvas.getContext('2d');
  let edge = 0;
  let width = canvas.width;
  let height = canvas.height
  let colorCounter = 0;
  let counterAngle = 0;
  let counterIncrease = 0;
  let lastUpdate = 0;
  let lastDraw = 0;
  let animId: ReturnType<typeof requestAnimationFrame> = null;

  var Field: any[];

  return {
    settings: {
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
      cycleHue: false,
      rule : "2/1",
    } as ISettings,

    setup: function() {
      // stop all animations
      cancelAnimationFrame(animId);
      // setup listeners
      canvas.addEventListener('click', () => this.random());

      this.setSize();

      this.init();

    },

    initializeField: function() {
      var field = [];
      var allCells = this.settings.N * this.settings.N;
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
      var kH = 2 * height / (this.settings.N * Math.sqrt(2));
      var kW = 2 * width / this.settings.N;

      edge = Math.max(kH, kW);
    },

    run: function(timestamp: number) {
      if (timestamp > lastUpdate + (1000/this.settings.updateInterval)) {
        this.update();
        lastUpdate = timestamp;
      }

      if (timestamp > lastDraw + (1000/this.settings.drawInterval)) {
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

    toggleControls : function(e: { currentTarget: { innerHTML: string; }; }) {
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

    computeLiveNeighbours: function(i: number) {
      var N = this.settings.N;
      var x = i % N;
      var y = i / N | 0;
      var LN = 0;

      /*
      Each cell has 12 touching neighbors. There are two
      types of cells, E and O cells.
      */
      // var type = (y % 2 << 1) + x % 2;
      var type = (x + y) % 2;
      var i: number;
      var l, nList, nb;

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

    neighbourAt: function(x: number, y: number, neighbour: number[]) {
      var N = this.settings.N;
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
      var i, x, y, l: number, val;
      var NextField = this.initializeField();

      var N = this.settings.N;

      for(i = 0, l = Field.length; i < l; i++) {

        LN = this.computeLiveNeighbours(i);

        val = Field[i];

        NextField[i] = this.computeNextStateOfCell(i, LN);

      }

      Field = NextField;


    },


    computeNextStateOfCell : function(i: number, LN: number) {
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

      var results = ruleExp.exec(this.settings.rule);

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
        this.settings.rule = "2/1";
      } else {
        var settings: ILifeRuleSettings = {
          env: {
            l: 0,
            h: 0,
          },
          fer: {
            l: 0,
            h: 0,
          }
        };

        // environment
        var env = results[1];
        if (env.length >= 3) {
          var envp = env.split(',');
          settings.env.l = +envp[0];
          settings.env.h = +envp[1];
        } else {
          settings.env.l = +env;
          settings.env.h = +env;
        }

        // fertility
        var fer = results[2];
        if (fer.length >= 3) {
          var ferp = fer.split(',');
          settings.fer.l = +ferp[0];
          settings.fer.h = +ferp[1];
        } else {
          settings.fer.l = +fer;
          settings.fer.h = +fer;
        }


      }
      console.log("Parsed Rule:", this.settings.rule, "into", settings);
      this.lifeSettings = settings;

    },

    draw: function() {
      context.fillStyle = 'rgba(0, 0, 0, ' + this.settings.bg_alpha/100 +')';
      context.fillRect(0, 0, width, height);

      var N = this.settings.N;
      var x, y, i, l: number,
          baseY,
          lEdge = edge * Math.cos(Math.PI/6);

      var translate = {
        x: 0,//(width - N * edge / 2 ) / 2,
        y: 0//(height - N * edge * SQRT2 / 2) / 2
      }



      if (this.settings.cycleHue)
          this.settings.monochromeHue = (this.settings.monochromeHue + (360/this.speed)) % 360;

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
      var N = this.settings.N;
      for (var i = 0; i < this.settings.seeds; i++) {
        var idx = Math.floor(Math.random() * N * N)
        Field[idx] = 1;
      }
    },

    loadSettings: function(settings: ISettings)
    {
      this.settings = settings;

      this.setSize();
      this.random();
    },

    // set random settings
    randomize : function () {
      const coinflip = () => (Math.random() > .5);
      var settings: ISettings = {
        N: 2 + Math.floor(Math.random() * 100),
        stroke: coinflip(),
        fill: coinflip(),
        speed : 1 + Math.floor(Math.random() * 1000),
        fg_alpha : 1 + Math.floor(Math.random() * 100),
        bg_alpha : 1 + Math.floor(Math.random() * 100),
        seeds : 1 + Math.floor(Math.random() * 10),
        updateInterval : 10 + Math.floor(Math.random() * 100),
        drawInterval : 10 + Math.floor(Math.random() * 100),
        waveform : ['triangle', 'saw', 'sine'][Math.floor(Math.random() * 2)] as "triangle" | "sine" | "saw",
        monochrome : coinflip(),
        monochromeHue : 100 * Math.random(),
        cycleHue: coinflip(), 
        rule: this.settings.rule,
      }
      
      if (!settings.stroke) {
        settings.fill = true;
      } 
      this.colorCounter = 0;
      this.counterAngle = 0;
      this.settings = settings;

      this.setSize();
      this.random();
    },

    drawTriangle: function(x: number, y: number, lEdge: any, baseY: any, translate: { x: number; y: any; }) {
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

    setColors: function(x: any, y: any) {

      // var val = Field[x + (N * y)];
      var speed = 1001 - this.speed;

      if (this.settings.monochrome) {

        var color = hslToRgb(this.settings.monochromeHue/360, 1, 0.5, this.settings.fg_alpha / 100);
      } else {

        counterIncrease = Math.PI / speed;
        counterAngle += counterIncrease;
        // sin
        switch (this.settings.waveform) {
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



        var color = hslToRgb(colorCounter, 1, 0.5, this.settings.fg_alpha / 100);
      }


      if (this.settings.fill) {
        context.fillStyle = color;
        context.fill();
      }
      if (this.settings.stroke){
        context.strokeStyle = color
        context.stroke();
      }

    }

  }

}