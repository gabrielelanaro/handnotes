function Sketch () {
  that = this;
  var canvasWidth = 1024, canvasHeight = 1400;
  var canvasDiv = $('#sketch');

  this.width = canvasWidth;
  this.height = canvasHeight;

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

  var drawingCanvas = stage.addChild(new createjs.Shape());
  var uiCanvas = stage.addChild(new createjs.Shape());
  drawingCanvas.cache(0, 0, canvasWidth, canvasHeight);


  this.tools = new Object();
  this.tools[Sketch.PEN] = new PenTool(stage, drawingCanvas, uiCanvas);
  this.tools[Sketch.ERASER] = new EraserTool(stage, drawingCanvas, uiCanvas);


  var backgroundBitmap = null;

  this.activateTool = function(toolNum) {
    if (this.currentTool == undefined) {
      this.currentTool = toolNum;
    }

    this.tools[this.currentTool].deactivate();

    this.currentTool = toolNum;
    this.tools[toolNum].activate();
  };

  this.activateTool(Sketch.PEN);

  this.setEraser = function(state) {
    this.activateTool(Sketch.ERASER);
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

Sketch.PEN = 0;
Sketch.ERASER = 1;

function PenTool (stage, outputLayer, uiLayer) {
  var that = this;

  this.stroke = 2;
  this.color = 'black';

  this.activate = function () {
    stage.addEventListener("stagemousedown", this.handleMouseDown);
    stage.addEventListener("stagemouseup", this.handleMouseUp);
  };

  this.deactivate = function () {
    console.log("deactivating pen");
    stage.removeEventListener("stagemousedown", this.handleMouseDown);
    stage.removeEventListener("stagemousemove", this.handleMouseMove);
    stage.removeEventListener("stagemouseup", this.handleMouseUp);
  };

  this.prepLineStyle = function (layer) {
    layer
      .graphics
      .clear()
      .setStrokeStyle(this.stroke, 'round', 'round')
      .beginStroke(this.color);
  };

  this.processPath = function (path) {
    var processedPath = [];
    for (var i = 0;  i < path.length; i++) {
      var point = path[i].clone();

      if ((i >= 3) && ((path.length - i) >= 3)) {
          point.x = (path[i-2].x +
                     path[i-1].x +
                     path[i].x +
                     path[i+1].x +
                     path[i+2].x) / 5;
          point.y = (path[i-2].y +
                     path[i-1].y +
                     path[i].y +
                     path[i+1].y +
                     path[i+2].y) / 5;

      }

      processedPath.push(point);
    }
    return processedPath;
  };

  this.drawPath = function (path, layer) {
    for (var i = 1;  i < path.length; i++) {
      var dstPoint = path[i];
      var srcPoint = path[i-1];

      var midPoint = new createjs.Point(srcPoint.x + dstPoint.x >> 1,
                                        srcPoint.y + dstPoint.y >> 1);

      layer
        .graphics
        .moveTo(srcPoint.x, srcPoint.y)
        .curveTo(midPoint.x, midPoint.y, dstPoint.x, dstPoint.y);
    }

  };

  this.handleMouseDown = function (e) {
      console.log('Mouse down');
      if (!e.primary) { return; }
      that.currentPath = [new createjs.Point(stage.mouseX, stage.mouseY)];
    	stage.addEventListener("stagemousemove", that.handleMouseMove);

  };

  this.handleMouseMove = function (e) {
      console.log('Mouse down');
    if (!e.primary) { return; }
      that.currentPath.push(new createjs.Point(stage.mouseX, stage.mouseY));

      // Processing the path for better display
      var processedPath = that.processPath(that.currentPath);

      // Setting line style properties
      that.prepLineStyle(uiLayer);

      // Drawing the path on ui layer only
      that.drawPath(processedPath, uiLayer);
      stage.update();
  };

  this.handleMouseUp = function (event) {
    	if (!event.primary) { return; }
      var processedPath = that.processPath(that.currentPath);
      that.prepLineStyle(outputLayer);
      that.drawPath(processedPath, outputLayer);

      outputLayer.updateCache("source-over");

      uiLayer.graphics.clear();
      // outputLayer.updateCache(erase ? "destination-out" : "source-over");

      stage.update();
    	stage.removeEventListener("stagemousemove", that.handleMouseMove);
  };

}

function EraserTool (stage, outputLayer, uiLayer) {
  var that = this;
  this.stroke = 40;

  this.activate = function () {
    stage.addEventListener("stagemousedown", this.handleMouseDown);
    stage.addEventListener("stagemouseup", this.handleMouseUp);
  };

  this.deactivate = function () {
    stage.removeEventListener("stagemousedown", this.handleMouseDown);
    stage.removeEventListener("stagemousemove", this.handleMouseMove);
    stage.removeEventListener("stagemouseup", this.handleMouseUp);
  };

  this.handleMouseDown = function (e) {
      if (!e.primary) { return; }
      that.oldPoint = new createjs.Point(stage.mouseX, stage.mouseY);
    	stage.addEventListener("stagemousemove", that.handleMouseMove);

  };

  this.handleMouseMove = function (e) {
      if (!e.primary) { return; }
      console.log("erasing");
      var newPoint = new createjs.Point(stage.mouseX, stage.mouseY);

      uiLayer
        .graphics
        .clear()
        .beginStroke('black')
        .drawCircle(newPoint.x, newPoint.y, that.stroke/2);

      outputLayer
       .graphics
       .clear()
       .setStrokeStyle(that.stroke, 'round', 'round')
       .beginStroke('black')
       .moveTo(that.oldPoint.x, that.oldPoint.y)
       .lineTo(newPoint.x, newPoint.y);

     outputLayer.updateCache('destination-out');
     stage.update();

     that.oldPoint = newPoint;
  };

  this.handleMouseUp = function (event) {
     	if (!event.primary) { return; }
      uiLayer.graphics.clear();
      stage.update();
     	stage.removeEventListener("stagemousemove", that.handleMouseMove);
   };
}


function pngDataToImage(input) {
  var src = "data:image/png;base64," + input;
  var image = new Image();

  image.src = src;
  return image;
}
