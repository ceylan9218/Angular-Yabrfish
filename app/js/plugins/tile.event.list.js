/**=========================================================
 * Module: eventList Directive.
 * Description: Directive for Event List of a Tile.
 * Author: Ryan - 2015.12.23
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.event-list', [])
        .directive("eventList", ['$location', 'APP_APIS', 'TileService', function($location, APP_APIS, TileService) {
            return {
                restrict: "E",
                scope: {
                    tile:"="
                },
                templateUrl: "app/views/partials/event-list.html",
                link: function(scope, elem, attrs) {

                    var monthNames = TileService.getMonthNames();

                    scope.events = [];
                    scope.classes = [];
                    scope.eventPerSlide = 1;
                    scope.currEvent = 0;
                    scope.carouselIndex = 3;                    	

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

                        scope.eventWidth = angular.element('#tile_'+scope.tile.externalId+' .events').width() / scope.eventPerSlide;
                        scope.eventSliderWidth = scope.eventWidth * scope.events.length;

                        //------------------------------------------------/
                        // Set the initial Event
                        scope.currEvent = 0;

                    })

                    scope.selectEvent = function(event, length) {
                        scope.selectedEvent = event.eventId;

                        var eventData = {
                            event: event,
                            length: length,
                            editable: true,
                            enableEvent: scope.enableEvent
                        };
                        scope.$parent.$parent.$parent.$broadcast('event', eventData);
                        //scope.$parent.$broadcast('event', eventData);
                    }
                }
            }
        }])        
})();