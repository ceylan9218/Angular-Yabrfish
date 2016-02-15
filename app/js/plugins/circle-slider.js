(function() {
    'use strict';

    angular
        .module('app.circle-slider', [])
        .directive("circleSlider", ['$state', '$rootScope', '$timeout', function($state, $rootScope, $timeout) {
            return {
                restrict: 'E',
                scope: {
                  circleId: '=',
                  circleType: '=',
                  contents: '=',
                },
                templateUrl: "app/views/partials/circle-slider.html",
                link: function(scope, element, attrs) {

                    scope.$watch('contents', function(newVal){                      
                        var slider = angular.element('#'+scope.circleId+' #slider');
                        var circleBg = angular.element('#'+scope.circleId+' #circle .circleBg');
                        var circle = angular.element('#'+scope.circleId+' #circle');
                        var poolContainer = angular.element('#'+scope.circleId+' .poolContainer');
                        var slide = angular.element('.slide');

                        var sliderW2 = 10;
                        var sliderH2 = 10;
                        var radius = 45;
                        var deg = 0, atan = 0;
                        var X = 0, Y = 0;
                        var mdown = false;
                        var setZero = false;
                        var prev_atan = 0;
                        var clockwise = false;
                        var total_deg = 0;
                        var diff_atan = 0;
                        var degree = 0;
                        var elP = circle.offset();

                        var elPos = {
                          x: elP.left,
                          y: elP.top
                        };

                        slider.css({
                          left: '35px',
                          top: '-10px'
                        });
                        
                        if(!scope.contents)
                          return;
                        
                        scope.content = scope.contents[0];

                        var count = scope.contents.length;
                        if(count > 0)
                          scope.step = 1;
                        else
                          scope.step = 0;

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
                            if(30 < mPos.x && mPos.x <= 50 && -10 < mPos.y && mPos.y <= 15 && !setZero){
                                setZero = true;                                
                            }
                            
                            if(scope.circleType == 'class'){
                              angular.element('.race-list').addClass('whirl line back-and-forth');
                            }
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

                            scope.$apply(function(){

                              if (scope.contents.length > 0) {
                                scope.step = degree % count + 1;
                                scope.content = scope.contents[scope.step - 1];  

                                var circleData = {
                                  type: scope.circleType,
                                  data: scope.content
                                }

                                scope.$emit('circleData', circleData);
                              }else{
                                scope.step = 0;
                              }

                              if(scope.circleType == 'class'){
                                angular.element('.race-list').removeClass('whirl line back-and-forth');

                                var raceId = 'race_' + scope.circleId.split('_')[1];
                                var resetData = {
                                  raceId: raceId
                                };

                                scope.$emit('resetRace', resetData);
                              }
                            })
                        });

                        scope.$on('resetRace', function(e, data){
                          var raceId = data.raceId;

                          angular.element('#'+raceId+' #slider').css({
                            left: '35px',
                            top: '-10px'
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

                                degree = -total_deg / Math.PI * 180 + 180;

                                // if(setZero){
                                //   console.log('second');
                                // }else{
                                //   console.log('first');
                                // }
                                
                                if (degree >= (90 * count + 45)) {
                                  total_deg = total_deg + (Math.PI / 2) * count;
                                }
                                if (degree < 0) {
                                  total_deg = total_deg - (Math.PI / 2) * count;
                                }

                                degree = parseInt((degree + 45) / 90);
                                prev_atan = atan;

                                scope.$apply(function() {
                                    if (scope.contents.length > 0 ) {

                                      scope.step = degree % count + 1;
                                      scope.content = scope.contents[scope.step - 1];  

                                      if(!scope.content)
                                          return;
                                    }                                
                                })
                            } // if (mdown) - end                              
                        }); // poolContainer.on('mousemove touchmove') - end
                    })
                }
            };
        }])
})();