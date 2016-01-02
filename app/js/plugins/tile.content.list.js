/**=========================================================
 * Module: eventList Directive.
 * Description: Directive for Content List of a Tile.
 * Gets Content Video and Pictures from Tiles.
 * Author: Ryan - 2015.12.23
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.content-list', [])
        .directive("contentList", ['$http', '$location', 'APP_APIS', 'TileService', function($http, $location, APP_APIS, TileService) {
            return {
                restrict: "E",
                scope: {
                    tile:"="
                },
                templateUrl: "app/views/partials/content-list.html",
                link: function(scope, elem, attrs) {

                    scope.contentList = [];

                    TileService.getTileContent(scope.tile.externalId).then(function(events){
                        for(var i in events) {
                            var startDate = new Date(events[i].startDate);
                            var month = monthNames[startDate.getMonth()];
                            var date = startDate.getDate();
                            scope.events.push({
                                eventId: events[i].externalId,
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

                        scope.eventWidth = angular.element('#tile_'+scope.tile.externalId+' .events').width() / 3;
                        scope.eventSliderWidth = scope.eventWidth * scope.events.length;
                    })
                    

                    scope.selectContent = function(event, length) {
                        var eventData = {
                            event: event,
                            length: length,
                            editable: true,
                            enableEvent: scope.enableEvent
                        };
                        scope.$parent.$broadcast('event', eventData);
                    }
                }                
            }
        }])        
})();