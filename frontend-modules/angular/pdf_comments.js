app.controller('CommentListController', function($scope, $http, $rootScope, $sce) {

    $scope.orderType = "author";
    $scope.ascending = "true";
    //$scope.filters = '{"author":"Kaet"}';
    $scope.filters = '{}';


    $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"'+ $scope.orderType + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;

    function updateScope(url){
      $http.get(url).success(function (data) {
        $scope.comments = data.comments;

        for(var i in $scope.comments){
          var cmnt = $scope.comments[i];
          cmnt.html = $sce.trustAsHtml(cmnt.html);
        }
      });
    };


    $scope.$watch("orderType",function(newValue,oldValue){
      $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"'+ $scope.orderType + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;
      updateScope($scope.commentGetUrl);
    });

    $scope.$watch("ascending",function(newValue,oldValue){
      $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"'+ $scope.orderType + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;
      updateScope($scope.commentGetUrl);
    });

    $scope.$watch("filters",function(newValue,oldValue){
      $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"'+ $scope.orderType + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;
      updateScope($scope.commentGetUrl);
    });




    $http.get('/slide-viewer/disComm').success(function (data) {
        console.log(data);
        $scope.comments = data.comments;

        for(var i in $scope.comments){
            var cmnt = $scope.comments[i];
            cmnt.html = $sce.trustAsHtml(cmnt.html);
        }


        /*$scope.loadComments = function (orderType, ascending, filters) {
          //var url = '/slide-viewer/disComm/{"type":"'+ orderType + '","ascending":"' + ascending + '"}/' + filters;
          var url = '/slide-viewer/disComm/{"type":"'+ orderType + '","ascending":"' + ascending + '"}/{"author":"Kaet"}';
          console.log(url);
          $http.get(url).success(function (data) {
              console.log(data);
              $scope.comments = data.comments;

              for(var i in $scope.comments){
                  var cmnt = $scope.comments[i];
                  cmnt.html = $sce.trustAsHtml(cmnt.html);
              }

          });




        };*/
    });

});
