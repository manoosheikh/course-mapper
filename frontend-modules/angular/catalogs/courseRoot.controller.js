app.controller('CourseRootController', function($scope, $rootScope, $filter, $http,
                                            $location, $routeParams, $timeout,
                                            courseService, authService, toastr, Page) {

    $scope.courseId = $routeParams.courseId;
    $scope.course = null;

    $scope.isOwner = false;
    $scope.isEnrolled = false;
    $scope.isManager = false;

    $scope.currentUrl = window.location.href;
    $scope.followUrl = $scope.currentUrl + '?enroll=1';

    $scope.currentTab = "preview";
    $scope.include = null;

    $scope.changeTab = function(){
        var defaultPath = "preview";
        var q = $location.search();

        if(!q.tab){
            q.tab = defaultPath;
        }

        $scope.currentTab = q.tab;
        $scope.actionBarTemplate = 'actionBar-course-' + $scope.currentTab;

        $timeout(function(){
            if(!authService.isLoggedIn){
                if($scope.currentTab != defaultPath)
                    $location.search('tab', defaultPath);
            }
        });

        if($scope.course)
            Page.setTitleWithPrefix($scope.course.name + ' > ' + q.tab);

        $scope.include = '/course/' + $scope.currentTab;

        $rootScope.$broadcast('onCourseTabChange', $scope.currentTab);
    };

    $scope.init = function(refreshPicture){
        courseService.init(
            $scope.courseId,

            function(course){
                $scope.course = course;

                Page.setTitleWithPrefix($scope.course.name);

                //$timeout(function () {
                    $rootScope.$broadcast('onAfterInitCourse', $scope.course, refreshPicture);
                //});
            },

            function(res){
                $scope.errors = res.errors;
                toastr.error('Failed getting course');
            },

            true
        );

        $scope.changeTab();
    };

    /**
     * show new course notification/guide if it is a new course
     */
    $scope.newCourseNotification = function(){
        var loc = $location.search();
        if(loc.new && loc.new == 1){
            toastr.info('<p>You are now in a newly created course. </p>' +
                '<p>You can start by customizing this course by uploading introduction picture and video on the edit panel.</p>' +
                '<p>Collaborate and Annotate on course map and its contents in <i class="ionicons ion-map"></i> <b>Map Tab</b></p>' +
                '<p>Discuss related topic in <i class="ionicons ion-ios-chatboxes"></i> <b>Discussion Tab.</b></p>' +
                '<p>Adding widgets on <i class="ionicons ion-stats-bars"></i> <b>Analytics tab</b>.</p>' +
                '<p>Or wait for your students to enroll in to this course and start collaborating.</p>'
                , 'New course created'
                , {
                    allowHtml: true,
                    closeButton: true,
                    autoDismiss: false,
                    tapToDismiss: false,
                    toastClass: 'toast wide',
                    extendedTimeOut: 30000,
                    timeOut: 30000
                });
        }

    };

    $scope.newCourseNotification();

    /**
     * initiate course when user hast tried to log in
     */
    $scope.$watch(function(){ return authService.isLoggedIn;}, function(){
        if(authService.hasTriedToLogin && !$scope.course){
            $scope.init();
        }
    });

    $scope.$watch(function(){ return courseService.isEnrolled(); }, function(newVal, oldVal){
        $scope.isEnrolled = newVal;
    });

    $scope.$watch(function(){ return courseService.isManager(authService.user); }, function(newVal, oldVal){
        $scope.isManager = newVal;
    });

    $scope.$watch(function(){ return courseService.isOwner(authService.user); }, function(newVal, oldVal){
        $scope.isOwner = newVal;
    });

    $scope.$on('$routeUpdate', function(){
        $scope.changeTab();
    });

    $scope.$on('onAfterEditCourse',function(events, course){
        $scope.init(true);
    });

});