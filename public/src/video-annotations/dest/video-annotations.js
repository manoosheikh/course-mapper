/*jslint node: true */
'use strict';

var videoAnnotationsModule = angular.module('VideoAnnotations', [
    'ngSanitize',
    'ngRoute',
    'com.2fdevs.videogular',
    'com.2fdevs.videogular.plugins.controls',
    'com.2fdevs.videogular.plugins.overlayplay',
    'info.vietnamcode.nampnq.videogular.plugins.youtube'
]);
;/*jslint node: true */
'use strict';

videoAnnotationsModule.controller('VaController', ['$scope', 'socket', '$rootScope',
    function($scope, socket, rootScope) {
        function markAuthoredComments(comments) {
            var user = rootScope.user;
            var isAdmin = user.role === 'admin';

            _.forEach(comments, function(comment) {
                if (isAdmin) {
                    comment.canEdit = true;
                } else {
                    var isAuthor = comment.author === user.username;
                    comment.canEdit = isAuthor;
                }
            });
        }

        this.init = function() {
            $scope.commentText = '';
            var user = rootScope.user;
            var isAdmin = user.role === 'admin';
            if (isAdmin) {
                $scope.canEdit = true;
            } else {
                var isAuthor = $scope.source.author === user.username;
                $scope.canEdit = isAuthor;
            }
            $scope.annotationTypes = [{
                id: 'embedded-note',
                name: 'Embedded Note'
            }, {
                id: 'note',
                name: 'Note'
            }];
            // Listen for changes in comments
            socket.on($scope.source._id + ':comments:updated', function(params) {
                markAuthoredComments(params.comments);
                $scope.source.comments = params.comments;
            });
        };

        $scope.editAnnotation = function() {
            $scope.source.isEditMode = true;
            $scope.$parent.searchHide(true);
            $scope.$parent.seekPosition($scope.source);
            
            _.each($scope.$parent.annotations, function(a) {
                if (a._id !== $scope.source._id)
                    a.isEditMode = false;
            });
        };

        $scope.closeAnnotation = function() {
            $scope.source.isEditMode = false;
            $scope.$parent.searchHide(false);
        };

        $scope.saveAnnotation = function() {
            var annotation = $scope.source;

            if (!annotation.text) return;
            if (annotation.start < 0) return;
            if (annotation.end < annotation.start) return;

            socket.emit('annotations:save', {
                annotation: annotation
            });

            $scope.source.isEditMode = false;
            $scope.source.isDefault = false;
            $scope.$parent.searchHide(false);
        };

        $scope.cancelAnnotation = function() {
            $scope.$parent.annotations.shift();
            $scope.$parent.searchHide(false);
        };

        $scope.deleteAnnotation = function() {
            var params = {
                id: $scope.source._id
            };
            socket.emit('annotations:delete', params);
        };

        $scope.postComment = function() {
            var annotationId = $scope.source._id;
            var commentText = $scope.commentText;

            if (!commentText || !annotationId) {
                return;
            }

            var params = {
                annotation_id: annotationId,
                text: commentText
            };

            socket.emit('comments:post', params);
            $scope.commentText = '';
        };


        $scope.removeComment = function(commentId) {
            var params = {
                annotation_id: $scope.source._id,
                comment_id: commentId
            };
            socket.emit('comments:remove', params);
        };

        this.init();
    }
]);
;/*jslint node: true */
'use strict';

videoAnnotationsModule.directive('videoAnnotation', function() {
    return {
        scope: {
            source: '='
        },
        templateUrl: '/src/video-annotations/scripts/directives/va-annotation/va-annotation.html',
        controller: 'VaController'
    };
});
;'use strict';

videoAnnotationsModule.controller('VaWidgetController', ['$scope', 'socket', '$rootScope', '$http',
  function ($scope, socket, rootScope, $http) {
    var videoPulse;
    var videoPulseHost = 'http://lanzarote.informatik.rwth-aachen.de:3005';

    var onLeave = function (currentTime, timeLapse, params) {
      params.completed = false;
      params.showing = false;
    };

    var onComplete = function (currentTime, timeLapse, params) {
      params.completed = true;
      params.showing = false;
    };

    var onUpdate = function (currentTime, timeLapse, params) {
      if (!params.showing) {
        params.completed = false;
        params.showing = true;
      }
    };

    var checkCanEdit = function (item) {
      var user = rootScope.user;
      var isAuthor = item.author === user.username;
      var isAdmin = user.role === 'admin';
      return (isAuthor || isAdmin);
    };

    $scope.createAnnotation = function () {
      // If the first annotation is the default,
      // then do not allow adding another one.
      if ($scope.annotations.length > 0 &&
        $scope.annotations[0].isDefault) {
        return;
      }
      _.each($scope.annotations, function (a) {
        a.isEditMode = false;
      });

      // get current playback time and add
      // default offset seconds for the end of
      // the annotation
      var startTime = $scope.API.currentTime;
      var endTime = $scope.API.currentTime + (5 * 1000);

      var defaultAnnotation = {
        "isEditMode": true,
        "isDefault": true,
        "isAuthor": true,
        "canEdit": true,
        "start": startTime,
        "end": endTime,
        "position": {
          "top": "10",
          "left": "10"
        },
        "size": {
          "height": "20",
          "width": "30"
        },
        "type": "note",
        "text": "",
        "video_id": $scope.videoId
      };
      $scope.annotations.unshift(defaultAnnotation);
      $scope.hideSearch = true;
      $scope.query = '';
    };

    $scope.searchHide = function (value) {
      $scope.hideSearch = value;
    };

    $scope.seekPosition = function (annotation) {
      $scope.API.seekTime(annotation.start / 1000);
    };

    $scope.onPlayerReady = function (API) {
      // Bootstrap footprint
      new Footprint({
        type: 'video',
        controls: false,
        timeupdate: false,
        sliderHolder: '.fp-timeline',
        infoHolder: '.fp-info-data'
      });
      $scope.API = API;
    };

    socket.on('annotations:updated', function (annotations) {
      var editedAnnotation = null;
      if ($scope.annotations && $scope.annotations.length > 0) {
        editedAnnotation = _.find($scope.annotations, function (ann) {
          return ann.isEditMode;
        });
      }
      // clear current annotations state
      $scope.annotations = [];
      $scope.cuePoints.points = [];
      $scope.selectedAnnotation = null;

      //Restore annotation that the user is editing.
      if (editedAnnotation) {
        $scope.annotations.push(editedAnnotation);
      }

      var sorted = _.sortByAll(annotations, ['start']);
      sorted.forEach(function (annotation) {
        var cuePoint = {
          timeLapse: {
            start: (new Date(annotation.start).getTime() - 0.001) / 1000,
            end: new Date(annotation.end).getTime() / 1000
          },
          onLeave: onLeave,
          onUpdate: onUpdate,
          onComplete: onComplete,
          params: annotation
        };
        $scope.cuePoints.points.push(cuePoint);

        annotation.canEdit = checkCanEdit(annotation);
        annotation.reposition = function (params) {
          if (params.position) {
            annotation.position = params.position;
          }
          if (params.size) {
            annotation.size = params.size;
          }
        };
        $scope.annotations.push(annotation);

        // find current user comments
        _.forEach(annotation.comments, function (c) {
          c.canEdit = checkCanEdit(c);
        });
      });
    });

    $scope.getInlineAnnotationStyle = function (item) {
      return {
        'top': item.position.top + '%',
        'left': item.position.left + '%',
        'width': item.size.width + '%',
        'z-index': item.isEditMode ? 1 : 0,
        'height': item.size.height + '%',
        'background': item.isHovered ? 'rgba(0, 0, 0, 0.3)' : 'background: rgba(0, 0, 0, 0.05)'
      };
    };

    $scope.init = function (videoId, videoSource) {
      $scope.sources = [{
        src: videoSource,
        type: 'video/mp4',
        video_id: videoId
      }];

      // Stop any previous pulse
      if (videoPulse) {
        videoPulse.stop();
      }
      videoPulse = new VideoPulse({
        host: videoPulseHost,
        userId: rootScope.user._id,
        videoId: videoId,
        mediaElement: $scope.API
      });

      $scope.cuePoints = {points: []};
      $scope.annotations = [];

      // Trigger initial annotations update.
      socket.emit('annotations:get', {video_id: videoId});
    };

    // Initialize scope when the video-source is set.
    $scope.$watch('videoSource', function (oldVal, newVal) {
      if (newVal) {
        $scope.init($scope.videoId, $scope.videoSource);
      }
    });

    var resumeLastPlaybackState = function () {
      var user = rootScope.user;
      var videoId = $scope.sources[0].video_id;
      var url = videoPulseHost + '/beats/' + videoId + '/' + user._id;
      $http.get(url)
        .success(function (data) {
          var timestamp = data.pointer || 0;
          console.log('Resuming position: ' + timestamp);
          $scope.API.seekTime(timestamp / 1000);
        });
    };

    var isResumed = false;

    $scope.onUpdateState = function (state) {

      rootScope.$broadcast('onVideoUpdateState', {'state': state, 'API': $scope.API});
      if (state === 'play') {
        if (!isResumed) {
          resumeLastPlaybackState();
          isResumed = true;
        }
        videoPulse.start();
      } else {
        videoPulse.stop();
      }
    };
  }
]);;/*jslint node: true */
'use strict';

videoAnnotationsModule.directive('vaWidget',
    function() {
        return {
            restruct: 'A',
            scope: {
                videoSource: '@',
                videoId: '@'
            },
            templateUrl: '/src/video-annotations/scripts/directives/va-widget/va-widget.html',
            controller: 'VaWidgetController'
        };
    }
);
