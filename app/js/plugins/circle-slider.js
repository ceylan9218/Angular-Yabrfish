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
                    left: 40,
                    top: -12
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


                  var page = 0;
                  var count = 4;
                  var prev_atan = 0;
                  var prev_deg = 0;
                  var testAry = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
                  scope.test = 0;
                  var clockwise = true;
		
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

                    // scope.$apply(function() {
                    //   scope.content = scope.contents[deg];
                    //   scope.test = testAry[deg + page * count];
                    // });

                    // prev_deg = deg;
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

                      var scrollFromTop = $(window).scrollTop();
                        
                      var mPos = {
                        x: clientX - elPos.x,
                        y: clientY - elPos.y + scrollFromTop
                      };
                     
                      //var atan = Math.atan2(mPos.x - radius, mPos.y - radius * 2);
                      atan = Math.atan2(mPos.x - radius, mPos.y - radius);
                      deg = -atan / (Math.PI / 2) + 2; // final (0-360 positive) degrees from mouse position

                      X = Math.round(radius * Math.sin(deg * Math.PI / 2));
                      Y = Math.round(radius * -Math.cos(deg * Math.PI / 2));

                      var sliderLeft = X + radius - sliderW2;
                      var sliderTop = Y + radius - sliderH2;

                      slider.css({
                        left: sliderLeft,
                        top: sliderTop
                      });

                      scope.$apply(function(){                        
                        scope.test = Math.round(deg);
                      })

                      if(prev_atan - atan >= 0){
                        clockwise = true;
                      }else{
                        clockwise = false;
                      }

                      
                      // if(deg == 0){
                      //   redProgressBar.css({
                      //     '-webkit-transform': 'rotate(' + (parseInt(deg) + 1) * 90 + 'deg)',
                      //     'transform': 'rotate(' + (parseInt(deg) + 1)  * 90 + 'deg)',
                      //     '-ms-transform': 'rotate(' + (parseInt(deg) + 1) * 90 + 'deg)'
                      //   });
                      // }else{
                      //   redProgressBar.css({
                      //     '-webkit-transform': 'rotate(' + parseInt(deg) * 90 + 'deg)',
                      //     'transform': 'rotate(' + parseInt(deg)  * 90 + 'deg)',
                      //     '-ms-transform': 'rotate(' + parseInt(deg) * 90 + 'deg)'
                      //   });  
                      // }

                      prev_atan = atan;
                    } // if (mdown) - end
                  }); // poolContainer.on('mousemove touchmove') - end
                }
            };
        }])
})();