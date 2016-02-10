/**=========================================================
 * Module: eventList Directive.
 * Description: Directive for Event List of a Tile.
 * Author: Ryan - 2015.12.23
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.event-panel', [])
        .directive("eventPanel", ['$location', 'TileService', '$timeout', function($location, TileService, $timeout) {
            return {
                restrict: "E",
                scope: {
                    tile:"="
                },
                templateUrl: "app/views/partials/event-panel.html",
                link: function(scope, elem, attrs) {

                    var monthNames = TileService.getMonthNames();

                    scope.events = [];
                    scope.carouselIndex = 0;
                    scope.currEvent = {};

                    var path = $location.path();
                    // Enable/Disable Edit Event.
                    if(path.indexOf('/app/tiles') != -1)
                      scope.enableEvent = true;
                    else
                      scope.enableEvent = false;

                    //------------------------------------------------------------------------------
                    // Need to put into a function to support infinite scroll and paging of events.
                    //------------------------------------------------------------------------------
                    TileService.getTileEvents(scope.tile.externalId).then(function(events){
                        for(var i in events) {
                            var startDate = new Date(events[i].startDate);
                            var month = monthNames[startDate.getMonth()];
                            var date = startDate.getDate();
                            scope.events.push({
                                eventId: events[i].externalId,
                                isRace: events[i].eventType == 'REGATTA',
                                month: month,
                                date: date,
                                name: events[i].name,
                                startDate: startDate,
                                endDate: new Date(events[i].endDate)
                            });
                        }

                        // If current page is My Tiles page, we will add Add Event button.
                        if(scope.enableEvent)
                            scope.events.push('addEvent');

                        //------------------------------------------------/
                        // Set the initial Event
                        scope.currEvent = scope.events[0];
                    })

                    scope.slideEvents = function(dir){
                        var slideWidth = angular.element('.slide').width();

                        if (dir === 'left') {
                            if(scope.carouselIndex > 0){
                                scope.carouselIndex--;                            
                                
                                angular.element('.slide').hide().css({'left': -slideWidth});
                                $timeout(function(){
                                    angular.element('.slide').show().animate({left: 0}, 300, function(){
                                        angular.element('.slide').css({left: null, position: null});
                                    });
                                }, 100);
                                reloadClassList();
                            }
                        } else {                            
                            if(scope.carouselIndex < scope.events.length - 1){                               
                                scope.carouselIndex++;
                                
                                angular.element('.slide').hide().css({'left': slideWidth});
                                $timeout(function(){
                                    angular.element('.slide').show().animate({left: 0}, 300, function(){
                                        angular.element('.slide').css({left: null, position: null});
                                    });
                                }, 100);                                
                                reloadClassList();
                            }
                            
                        }

                        scope.currEvent = scope.events[scope.carouselIndex];
                    }

                    var reloadClassList = function() {                        
                        angular.element('.slide').addClass('whirl line back-and-forth');
                        
                        $timeout(function(){
                            angular.element('.slide').removeClass('whirl line back-and-forth');
                        }, 1500);
                    }
                }
            }
        }])
        .controller('eventController', eventController)
    
    function eventController($rootScope, $scope, TileService, ViewerService) {
        $scope.events = [];
        $scope.currEvent = {};
        var monthNames = TileService.getMonthNames();

        $scope.getTileEvents = function() {

            TileService.getTileEvents($scope.tile.externalId).then(function(events){
                for(var i in events) {
                    var startDate = new Date(events[i].startDate);
                    var month = monthNames[startDate.getMonth()];
                    var date = startDate.getDate();
                    $scope.events.push({
                        eventId: events[i].externalId,
                        isRace: events[i].eventType == 'REGATTA',
                        month: month,
                        date: date,
                        name: events[i].name,
                        startDate: startDate,
                        endDate: new Date(events[i].endDate)
                    });
                }

                $scope.currEvent = $scope.events[0];
            }, function(error){
                console.log(error);
            })    
        }

        $scope.changeEvent = function(event){
            $scope.currEvent = event;
        }
        $scope.$on('results', function(e, data){
            $scope.results = data;
        })
    }
})();