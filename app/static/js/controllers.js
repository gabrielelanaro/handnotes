var sketch = angular.module('sketch', []);

sketch.factory('NotebookData', function($http){
    return {
        pages : function(params){
            return $http.get('/pages');
        }
    }
});

sketch.controller('NotebookController', function ($scope, $timeout, $http, NotebookData) {
  $scope.currentPage = 0;

  NotebookData.pages().then(function (response) {
    $scope.pages = response.data;
    if ($scope.pages.length == 0)
      $scope.newPage();

    $scope.loadPage(0).then(function () {$scope.autoSave(5)});
  });

  var sketchCanvas = new Sketch();

  $scope.refreshThumbnails = function () {
    NotebookData.pages().then(function (response) {
      $scope.pages = response.data;
    });
  };

  $scope.setTool = function(tool) {
    console.log('Set tool ' + tool);
    if (tool == "eraser") {
      sketchCanvas.setEraser(true);
    }
    else {
      sketchCanvas.setEraser(false);
    }
  };

  $scope.newPage = function() {
    sketchCanvas.setBackgroundImage(null);
    return $http.post('/sketch/new', canvas.toDataURL())
                .then(function (result) {
        $scope.currentPage = $scope.pages.length;
        $scope.pages.push(result.data);
        $scope.savePage($scope.currentPage);
    });
  };

  $scope.savePage = function (pagenum) {
    console.log('Saving pagenum ' + pagenum);
    console.log($scope.pages);
    $.ajax({
      url: '/sketch/' + $scope.pages[pagenum]['id'],
      type: 'PUT',
      contentType: 'octet-stream',
      data: canvas.toDataURL('image/png'),
      success: function() {
        console.log('Save successful');
        $scope.refreshThumbnails();
      }
    }).fail(function () {console.log('Save failed');});
  };

  $scope.loadPage = function (pagenum) {
    // Load page and return a promise
    return $http.get('/sketch/' + $scope.pages[pagenum]['id'])
             .then(function (result) {
                $scope.currentPage = pagenum;
                var image = pngDataToImage(result.data);
                sketchCanvas.setBackgroundImage(image);
              });
  };

  $scope.deletePage = function (pagenum) {
    if ($scope.pages.length == 1) {
      return;
    }
    console.log('Loading pagenum ' + pagenum);
    $.ajax({
      url: '/sketch/' + $scope.pages[pagenum]['id'],
      type: 'DELETE',
      // dataType: 'octet-stream',
      success: function(data, textStatus, jqXHR) {
        console.log('Delete successful');
      }}).fail(function () {
      });

      if ($scope.currentPage >= 1) {
        $scope.currentPage -= 1;
      }
      $scope.loadPage($scope.currentPage);
      $scope.refreshThumbnails();
  };

  $scope.autoSave = function (seconds) {
    (function tick() {
      $scope.savePage($scope.currentPage);
      $timeout(tick, seconds * 1000);
    })();
  };



});
