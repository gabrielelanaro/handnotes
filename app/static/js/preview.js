
function Preview (origWidth, origHeight, scaleFactor) {
  // Preview acts as a preview control for a bigger canvas
  that = this;
  var canvasWidth = origWidth/scaleFactor, canvasHeight = origHeight/scaleFactor;
  var canvasDiv = $('#preview');

  this.canvas = document.createElement('canvas');

  this.canvas.setAttribute('width', canvasWidth);
  this.canvas.setAttribute('height', canvasHeight);
  this.canvas.setAttribute('id', 'previewcanvas');

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


  var drawingUi = stage.addChild(new createjs.Shape());

  this.drawIndicator = function (x, y) {
    drawingUi
      .graphics
      .clear()
      .beginStroke('black')
      .drawRect(x, y, 800/scaleFactor, 800/scaleFactor);
    stage.update();
  };

  this.drawIndicator(0, 0);
  this.curPos = new createjs.Point(0, 0);

  this.setBitmap = function () {

  };

  this.handleMouseDown = function (e) {
    // Connect mousemove event
    if (!e.primary) { return; }
    that.oldPoint = new createjs.Point(stage.mouseX, stage.mouseY);
    stage.addEventListener("stagemousemove", that.handleMouseMove);
  };


  this.handleMouseMove = function (e) {
    if (!e.primary) { return; }
    that.newPoint = new createjs.Point(stage.mouseX, stage.mouseY);

    // Calculate delta
    var deltaPoint = new createjs.Point(that.newPoint.x - that.oldPoint.x,
                                        that.newPoint.y - that.oldPoint.y);

    var newPos = new createjs.Point(deltaPoint.x + that.curPos.x,
                                    deltaPoint.y + that.curPos.y);

    // We stop at the boundaries
    if ((newPos.x < 0 || newPos.x > (canvasWidth - 800/scaleFactor)) ||
        (newPos.y < 0 || newPos.y > (canvasHeight - 800/scaleFactor)))
        { return; }

    // Move indicator around
    that.drawIndicator(newPos.x, newPos.y);
    that.curPos = newPos;

    // Move original canvas around
    $('#canvas').css({top : - newPos.y * scaleFactor,
                      left: - newPos.x * scaleFactor });

    that.oldPoint = that.newPoint;
  };

  this.handleMouseUp = function (e) {
    if (!e.primary) { return; }
    // Disconnect mousemove event
    stage.removeEventListener("stagemousemove", that.handleMouseMove);
  };

  stage.addEventListener("stagemousedown", this.handleMouseDown);
  stage.addEventListener("stagemouseup", this.handleMouseUp);

}
