/**=========================================================
 * Module: eventList Directive.
 * Description: Directive for Event List of a Tile.
 * Author: Ryan - 2015.12.23
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.event-list', [])
        .directive("eventList", ['$http', '$location', 'APP_APIS', function($http, $location, APP_APIS) {
            return {
                restrict: "E",
                scope: {
                    tile:"="
                },
                templateUrl: "app/views/partials/event-list.html",
                link: function(scope, elem, attrs) {
                    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                    scope.events = [];
                    scope.classes = [];

                    var path = $location.path();
                    // Enable/Disable Edit Event.
                    if(path.indexOf('/app/tiles') != -1)
                      scope.enableEvent = true;
                    else
                      scope.enableEvent = false;

                    //--------------------------------------------------------------------------
                    // Get List of Events from Tile Service,
                    // Use lazy loading to only visible Events in Panel;
                    //--------------------------------------------------------------------------
                    $http.get(APP_APIS['tile']+'/tiles/'+ scope.tile.externalId +'/events')
                    .success(function(data) {
                        var events = data.eventList;

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
//console.log(scope.events);
                    });
                    
                    scope.slideEvents = function(dir) {
                        var eventWidth = angular.element('.events').width() / 3;
                        var endTranslate = (scope.events.length - 3) * eventWidth * -1;

                        if(!scope.translate)
                            scope.translate = 0;

                        if (dir === 'left') {
                            scope.translate += eventWidth;
                            if(scope.translate <= 0)
                                scope.transform = "translate("+scope.translate+"px, 0px)";
                            else
                                scope.translate = 0;
                        } else {
                            if(scope.events.length > 3) {
                                scope.translate -= eventWidth;
                                if(scope.translate >= endTranslate)
                                    scope.transform = "translate("+scope.translate+"px, 0px)";
                                else{
                                    scope.transform = "translate("+endTranslate+"px, 0px)";
                                    scope.translate = endTranslate;
                                }
                            }
                        }
                    }
                    scope.selectEvent = function(event, length) {
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