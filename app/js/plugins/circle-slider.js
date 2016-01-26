(function() {
    'use strict';

    angular
        .module('app.circle-slider', [])
        .directive("circleSlider", ['$state', '$rootScope', function($state, $rootScope) {
            return {
                restrict: 'E',
                scope: {
                  contents: '=',
                },
                templateUrl: "app/views/partials/circle-slider.html",
                link: function(scope, element, attrs) {

                  scope.content = scope.contents[0];

                  var slider = angular.element('#slider');
                  var redProgressBar = angular.element('#slice .pie');
        		      var circleBg = angular.element('#circle .circleBg');
        		      
                  slider.css({
                    left: 42.5,
                    top: -9.5
                  });

                  var circle = angular.element('#circle');
                  var poolContainer = angular.element('.poolContainer');
                  var sliderW2 = 10;
                  var sliderH2 = 10;
                  var radius = 52.5;
                  var deg = 0, atan = 0;
                  var elP = circle.offset();

                  var elPos = {
                    x: elP.left,
                    y: elP.top
                  };

                  var X = 0, Y = 0;
                  var mdown = false;

                  var round = 0;
                  var count = 4;
                  var prev_atan = 0;
                  var prev_deg = 0;

                  var testAry = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
                  scope.test = 0;
                  var clockwise = false;
		              
                  round = parseInt(scope.contents.length/count) + 1;

                  var total_deg = 0;
                  var diff_atan = 0;

                  poolContainer.on('mousedown touchstart', function(event) {
                    mdown = true;
                  });

                  poolContainer.on('mouseup touchend', function(event) {
                    mdown = false;                  
                    deg = Math.round(deg);

                    X = Math.round(radius * Math.sin(deg * Math.PI / 2));
                    Y = Math.round(radius * -Math.cos(deg * Math.PI / 2));

                    var sliderLeft = X + radius - sliderW2;
                    var sliderTop = Y + radius - sliderH2;

                    slider.css({
                      left: sliderLeft,
                      top: sliderTop
                    });

                    prev_deg = deg;
                  });

                  poolContainer.on('mousemove touchmove', function(event) {

                    event.preventDefault();
                      
                    var clientX = event.clientX,
                        clientY = event.clientY;
                      
                    if (event.type === 'touchmove') {
                          //console.log(event.originalEvent.changedTouches[0]);
                        clientX = event.originalEvent.changedTouches[0].clientX;
                        clientY = event.originalEvent.changedTouches[0].clientY;
                    }
                      
                    if (mdown) {

                      X = Math.round(radius * Math.sin(deg * Math.PI / 2));
                      Y = Math.round(radius * -Math.cos(deg * Math.PI / 2));

                      var sliderLeft = X + radius - sliderW2;
                      var sliderTop = Y + radius - sliderH2;

                      slider.css({
                        left: sliderLeft,
                        top: sliderTop
                      });

                      var scrollFromTop = $(window).scrollTop();
                        
                      var mPos = {
                        x: clientX - elPos.x,
                        y: clientY - elPos.y + scrollFromTop
                      };

                      //var atan = Math.atan2(mPos.x - radius, mPos.y - radius * 2);
                      atan = Math.atan2(mPos.x - radius, mPos.y - radius);
                      deg = -atan / (Math.PI / 2) + 2; // final (0-360 positive) degrees from mouse position

                      var diff_atan = atan - prev_atan;
                      
                      if( 0 <= diff_atan && diff_atan < Math.PI )
                        clockwise = false;
                      else if( Math.PI <= diff_atan && diff_atan < Math.PI * 2 ){
                        clockwise = true;
                        diff_atan = diff_atan - Math.PI*2;
                      }
                      else if( Math.PI * -1 <= diff_atan && diff_atan < 0 )
                        clockwise = true;
                      else if( Math.PI * -2 <= diff_atan && diff_atan < Math.PI * -1 ){
                        clockwise = false;
                        diff_atan = diff_atan + Math.PI*2;
                      }
                      else
                        clockwise = false;

                      total_deg = total_deg + diff_atan;

                      var degree = -total_deg / Math.PI * 180 + 180;

                      if (degree >= 360 * round) {
                        degree -= 360 * round;
                      }
                      if (degree < 0) {
                        degree += 360 * round;
                      }
                      degree = parseInt((degree + 45) / 90);
                      degree = degree %2;

                      scope.$apply(function() {
                        scope.content = scope.contents[degree];
                      })

                      prev_atan = atan;

                    } // if (mdown) - end
                  }); // poolContainer.on('mousemove touchmove') - end
                }
            };
        }])
})();