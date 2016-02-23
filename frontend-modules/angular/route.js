app.config(['$routeProvider', '$locationProvider',

    function ($routeProvider, $locationProvider) {

        $routeProvider.
        when('/static/about', {
            templateUrl: '/static/about',
            controller: 'staticController',
            reloadOnSearch: false
        }).

        when('/category/:slug', {
            templateUrl: 'courses_list.html',
            controller: 'CourseListController',
            reloadOnSearch: false
        }).

        when('/cid/:courseId/nid/:nodeId', {
            templateUrl: function (params) {
                var tUrl = '/treeNode/' + params.courseId + '/nodeDetail/' + params.nodeId;
                var hasQueryStringStart = false;
                if (params.iframe === 'true' || params.iframe === 'false'){
                  if(!hasQueryStringStart)
                    tUrl += '?';
                  else {
                    tUrl += '&';
                  }
                  tUrl += 'iframe=' + params.iframe;
                  hasQueryStringStart = true;
                }
                if(typeof(params.accessToken) != undefined){
                    if(!hasQueryStringStart)
                      tUrl += '?';
                    else {
                      tUrl += '&';
                    }
                    tUrl += 'accessToken=' + params.accessToken;
                    hasQueryStringStart = true;
                }
                return tUrl;
            },
            controller: 'NodeRootController',
            reloadOnSearch: false
        }).

        when('/cid/:courseId', {
            templateUrl: function (params) {
                var tUrl = '/course/courseDetail/' + params.courseId;
                if (params.iframe === 'true' || params.iframe === 'false')
                    tUrl += '?iframe=' + params.iframe;
                return tUrl;
            },
            controller: 'CourseRootController',
            reloadOnSearch: false
        }).

        otherwise({
            redirectTo: '/'
        });

    }]);
