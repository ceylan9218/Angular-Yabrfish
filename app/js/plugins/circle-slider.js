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
                  var setZero = false;

                  // var round = 0;
                  var count = scope.contents.length;
                  var prev_atan = 0;
                  var prev_deg = 0;

                  var testAry = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
                  scope.test = 0;
                  var clockwise = false;
		              
                  // round = parseInt(scope.contents.length/count) + 1;
                  //round = 3;

                  var total_deg = 0;
                  var diff_atan = 0;
                  var degree = 0;

                  // Get Mouse/Touch position.                  
                  var getMPos = function(event) {
                    
                    var scrollFromTop = $(window).scrollTop();

                    var mPos = {
                      x: event.clientX - elPos.x,
                      y: event.clientY - elPos.y + scrollFromTop
                    };

                    return mPos;
                  }

                  poolContainer.on('mousedown touchstart', function(event) {
                    mdown = true;
                       
                    var mPos = getMPos(event);
                    // If user click on left of circle at first, it sets circle to 0.
                    if(15 < mPos.x && mPos.x <= 60)
                      setZero = true;
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

                    scope.$apply(function(){
                      var index = degree % count;
console.log(degree, count);                      
                      scope.content = scope.contents[index];
                    })
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

                      if(!setZero)
                        degree = -total_deg / Math.PI * 180 + 180;
                      else
                        degree = -total_deg / Math.PI * 180 - 180;

                      if (degree >= (90 * count + 45)) {
                        total_deg = total_deg + (Math.PI / 2) * count;
                      }
                      if (degree < 0) {
                        total_deg = total_deg - (Math.PI / 2) * count;
                      }

                      degree = parseInt((degree + 45) / 90);
                      prev_atan = atan;

                    } // if (mdown) - end
                  }); // poolContainer.on('mousemove touchmove') - end
                }
            };
        }])
})();