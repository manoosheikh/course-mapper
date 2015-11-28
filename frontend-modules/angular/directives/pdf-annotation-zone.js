app.directive('pdfAnnotationZone',
    function ($compile, $timeout) {
        return {
            restrict: 'E',

            terminal: true,
            require: 'movable-pdf',
            scope: {
              relativePosition: '=',
              relativeSize: '=',
              color: '=',
              tagName: '=',
              dragable: '@',
              isBeingCreated: '@',
              annZoneId: '@',
              divCounter: '@',
              id: '@'
            },

            templateUrl: '/angular/views/pdf-annotation-zone.html',
            //replace: true,
            //transclude: true,
            controller: function($http, $scope, $rootScope, $sce, $timeout){

              console.log("Got called");
              $scope.canMove = $scope.dragable;
              $scope.switchShowAnnoZones = 'On';
              $scope.annZoneID = $scope.id;
              //$scope.annZoneId = "";
              $scope.opacityFactorHighlight = "0.75";
              //$scope.tagName = "";
              //$scope.color ="#444444";
              $scope.dataRelCoord = "100;100";
              $scope.colorPickerId ="1";
              $scope.divCounter = "1";
              $scope.editZoneMode = "BLUB";



              $scope.setEditZoneMode = function(a,b,c){;};

              $timeout(function(){
                $scope.$apply();
              });


              $('select[name="colorpicker-change-background-color"]').simplecolorpicker({picker: true, theme: 'glyphicons'});
              $('#destroy').on('click', function() {
                $('select').simplecolorpicker('destroy');
              });
              // By default, activate simplecolorpicker plugin on HTML selects
              $('#init').trigger('click');


            }
        };
    }
);
