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
                    scope.currEvent = 0;
                    scope.carouselIndex = 0;                    	

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
                        scope.currEvent = 0;

                        $timeout(function(){
                            scope.eventWidth = angular.element('.events').width();
                            scope.eventSliderWidth = scope.eventWidth * scope.events.length;                            
                        })
                    })

                    scope.slideEvents = function(dir){
                        var endTranslate = (scope.events.length - 1) * scope.eventWidth * -1;

                        if(!scope.translate)
                            scope.translate = 0;

                        if (dir === 'left') {
                            scope.translate += scope.eventWidth;
                            if(scope.translate <= 0){
                                scope.transform = "translate("+scope.translate+"px, 0px)";
                                scope.carouselIndex--;
                            }
                            else{
                                scope.translate = 0;
                            }
                        } else {
                            scope.translate -= scope.eventWidth;
                            if(scope.translate >= endTranslate){
                                scope.transform = "translate("+scope.translate+"px, 0px)";
                                scope.carouselIndex++;                                
                            }
                            else{
                                scope.transform = "translate("+endTranslate+"px, 0px)";
                                scope.translate = endTranslate;
                            }
                        }
                    }
                }
            }
        }])        
})();