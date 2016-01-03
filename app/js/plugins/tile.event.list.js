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

                    // scope.colors = ['#fc0003', '#f70008', '#f2000d', '#ed0012', '#e80017', '#e3001c'];
                    // function getSlide(target, style) {
                    //     var i = target.length;
                    //     return {
                    //         id: (i + 1),
                    //         label: 'slide #' + (i + 1),
                    //         img: 'http://lorempixel.com/1200/500/' + style + '/' + ((i + 1) % 10) ,
                    //         color: scope.colors[ (i*10) % scope.colors.length],
                    //         odd: (i % 2 === 0)
                    //     };
                    // }

                    // function addSlide(target, style) {
                    //     target.push(getSlide(target, style));
                    // }

                    // scope.carouselIndex = 3;

                    // function addSlides(target, style, qty) {
                    //     for (var i=0; i < qty; i++) {
                    //         addSlide(target, style);
                    //     }
                    // }

                    // // 1st ngRepeat demo
                    // scope.slides = [];
                    // addSlides(scope.slides, 'sports', 5);


                    var monthNames = TileService.getMonthNames();

                    scope.events = [];
                    scope.classes = [];
                    scope.eventPerSlide = 1;
                    scope.currEvent = 0;

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

                    scope.slideEvents = function(dir) {

                        var eventWidth = angular.element('.events').width() / scope.eventPerSlide;
                        var endTranslate = (scope.events.length - scope.eventPerSlide) * eventWidth * -1;

                        if(!scope.translate)
                            scope.translate = 0;

                        if ( dir === 'left' && scope.currEvent > 0) {
                            scope.currEvent--
                        }

                        if ( dir === 'right' && scope.currEvent < scope.events.length) {
                            scope.currEvent++
                        }

                        if (dir === 'left') {
                            scope.translate += eventWidth;
                            if(scope.translate <= 0)
                                scope.transform = "translate("+scope.translate+"px, 0px)";
                            else
                                scope.translate = 0;
                        } else {
                            if(scope.events.length > scope.eventPerSlide) {
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