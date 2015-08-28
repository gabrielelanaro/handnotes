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


  // if(typeof G_vmlCanvasManager != 'undefined') {
  //   this.canvas = G_vmlCanvasManager.initElement(this.canvas);
  // }
  this.context = this.canvas.getContext("2d");

  var stage = new createjs.Stage(this.canvas);
  this.stage = stage;
	// this.stage.autoClear = false;
	this.stage.enableDOMEvents(true);
	createjs.Touch.enable(stage);
	createjs.Ticker.setFPS(24);

  drawingCanvas = stage.addChild(new createjs.Shape());
  drawingCanvas.cache(0, 0, canvasWidth, canvasHeight);

  var color = "#df4b26", stroke = 2;

	stage.addEventListener("stagemousedown",
    function(e) {
      if (!e.primary) { return; }
    	oldPt = new createjs.Point(stage.mouseX, stage.mouseY);
    	oldMidPt = oldPt.clone();
    	stage.addEventListener("stagemousemove", handleMouseMove);
  });

  var erase = false;

  function handleMouseMove(event) {
  	if (!event.primary) { return; }
    	var midPt = new createjs.Point(oldPt.x + stage.mouseX >> 1, oldPt.y + stage.mouseY >> 1);
      console.log(erase);

      drawingCanvas
        .graphics
        .clear()
        .setStrokeStyle(stroke, 'round', 'round')
        .beginStroke(color)
        .moveTo(midPt.x, midPt.y)
        .curveTo(oldPt.x, oldPt.y, oldMidPt.x, oldMidPt.y);

      drawingCanvas.updateCache(erase ? "destination-out" : "source-over");
      drawingCanvas.graphics.clear();

    	oldPt.x = stage.mouseX;
    	oldPt.y = stage.mouseY;

    	oldMidPt.x = midPt.x;
    	oldMidPt.y = midPt.y;

      stage.update();
    }


    stage.addEventListener("stagemouseup",
      function (event) {
      	if (!event.primary) { return; }
      	stage.removeEventListener("stagemousemove", handleMouseMove);
      });

  var backgroundBitmap = null;
  this.setEraser = function(state) {
    erase = state;
    stroke = erase ? 20 : 2;
  };

  this.setBackgroundImage = function(image) {
    if (image == null) {
      drawingCanvas
        .graphics
        .clear()
        .beginFill("rgba(0, 0, 0, 0)")
        .drawRect(0, 0, canvasWidth, canvasHeight);

      drawingCanvas.updateCache('copy');
      stage.update();
    }
    else {
      drawingCanvas
        .graphics
        .clear()
        .beginBitmapFill(image)
        .drawRect(0, 0, canvasWidth, canvasHeight);

      drawingCanvas.updateCache('copy');
      stage.update();
    };
  };
}

function pngDataToImage(input) {
  var src = "data:image/png;base64," + input;
  var image = new Image();

  image.src = src;
  return image;
}
