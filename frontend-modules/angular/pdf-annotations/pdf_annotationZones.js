app.controller('AnnotationZoneListController', function($scope, $http, $rootScope, $sce, $timeout) {



    $scope.refreshTags = function() {
      $http.get('/slide-viewer/disAnnZones/1/'+$scope.currentPageNumber).success(function (data) {
        console.log('TAGS UPDATED OF PAGE ' + $scope.currentPageNumber);
        $scope.annZones = data.annZones;

        tagListLoaded($scope.annZones);

        $timeout(function(){
          $scope.$apply();
        });


        /*$scope.$on('$stateChangeSuccess', function(){
          console.log("ALL DONE AJS");
        });
        */

      });
    };

    $scope.$watch("currentPageNumber",function(newValue,oldValue){
      console.log("LOADED RESET");
      $(".slideRect").remove();

      annotationZonesAreLoaded = false;

      toDrawAnnotationZoneData = [];
      $scope.refreshTags();
    });

    //$scope.refreshTags();
});