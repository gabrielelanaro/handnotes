var sketch = angular.module('sketch', []);

sketch.factory('NotebookData', function($http){
    return {
        pages : function(params){
            return $http.get('/pages');
        }
    }
});

sketch.controller('NotebookController', function ($scope, NotebookData) {

  NotebookData.pages().then(function (response) {
    $scope.pages = response.data;
  });
  $scope.currentPage = 1;

  var sketchCanvas = new Sketch();

  $scope.newPage = function() {
    $scope.pages.push({'num': $scope.pages.length + 1});
    $scope.currentPage = $scope.pages.length;

    sketchCanvas.checkpoint = null;
    sketchCanvas.redraw();
  };

  $scope.savePage = function (page) {
    console.log('Saving page ' + page);
    $.ajax({
      url: '/sketch/' + page,
      type: 'PUT',
      contentType: 'octet-stream',
      data: canvas.toDataURL('image/png'),
      success: function() {}
    });
  };

  $scope.loadPage = function (page) {
    console.log('Loading page ' + page);
    sketchCanvas.resetc();

    $.ajax({
      url: '/sketch/' + page,
      type: 'GET',
      // dataType: 'octet-stream',
      success: function(data, textStatus, jqXHR) {
        var image = pngDataToImage(data);
        sketchCanvas.checkpoint = image;
        sketchCanvas.redraw();
      }}).fail(function () {
        sketchCanvas.checkpoint = null;
        sketchCanvas.redraw();
      });

      $scope.currentPage = page;
  };

  $scope.loadPage(1);
});
