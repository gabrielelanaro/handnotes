Sketch = function () {
  that = this;
  var canvasWidth = 800, canvasHeight = 800;
  var canvasDiv = $('#sketch')
                   .width(canvasWidth)
                   .height(canvasHeight);

  this.canvas = document.createElement('canvas');

  this.canvas.setAttribute('width', canvasWidth);
  this.canvas.setAttribute('height', canvasHeight);
  this.canvas.setAttribute('id', 'canvas');
  canvasDiv.append(this.canvas);
  if(typeof G_vmlCanvasManager != 'undefined') {
    this.canvas = G_vmlCanvasManager.initElement(this.canvas);
  }
  this.context = this.canvas.getContext("2d");

  var clickX = new Array();
  var clickY = new Array();
  var clickDrag = new Array();
  var paint;

  function addClick (x, y, dragging) {
    clickX.push(x);
    clickY.push(y);
    clickDrag.push(dragging);
  }
  this.addClick = addClick.bind(this);

  $('#canvas').mousedown( function(e) {
    var mouseX = e.pageX - this.offsetLeft;
    var mouseY = e.pageY - this.offsetTop;

    paint = true;
    that.addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
    that.redraw();
  });

  $('#canvas').mousemove( function(e) {
    var mouseX = e.pageX - this.offsetLeft;
    var mouseY = e.pageY - this.offsetTop;

    if (paint)
      that.addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);

    that.redraw();
  });

  $('#canvas').mouseup( function (e) {
    paint = false;
  });

  this.checkpoint = null;

  this.redraw = function () {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height); // Clears the canvas
    if (this.checkpoint != null) {
      this.context.drawImage(this.checkpoint, 0, 0);
    }

    this.context.strokeStyle = "#df4b26";
    this.context.lineJoin = "round";
    this.context.lineWidth = 2;
    for(var i=0; i < clickX.length; i++) {
      this.context.beginPath();
      if(clickDrag[i] && i){
        this.context.moveTo(clickX[i-1], clickY[i-1]);
       }else{
         this.context.moveTo(clickX[i]-1, clickY[i]);
       }
       this.context.lineTo(clickX[i], clickY[i]);
       this.context.closePath();
       this.context.stroke();
    }
  };

  this.resetc = function () {
    clickX = new Array();
    clickY = new Array();
    clickDrag = new Array();
  };

}

function pngDataToImage(input) {
  var src = "data:image/png;base64," + input;
  var image = new Image();

  image.src = src;
  return image;
}
