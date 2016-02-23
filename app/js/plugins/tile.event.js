/**=========================================================
 * Module: eventList Directive.
 * Description: Directive for Event List of a Tile.
 * Author: Ryan - 2015.12.23
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.event-panel', [])
        .controller('eventController', eventController)
    
    function eventController($rootScope, $scope, TileService, ViewerService, $timeout, COLUMN_WIDTH) {

        $scope.events = [];
        $scope.currEvent = {};
        var monthNames = TileService.getMonthNames();
        
        $scope.transform = 0;
        $scope.translate = 0;

        var eventPanelWidth = angular.element('.main-content').width();
console.log(eventPanelWidth);
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

                angular.element('.results-panel').addClass('whirl line back-and-forth');

            }, function(error){
                console.log(error);
            })
        }

        $scope.changeEvent = function(event){
            $scope.currEvent = event;
            $scope.$parent.$broadcast('event', event);

            var content_width = angular.element('.content-wrapper').width();
            if(content_width == COLUMN_WIDTH['one_column']){
                $scope.translate -= eventPanelWidth;
                $scope.transform = "translate("+$scope.translate+"px, 0px)";
              
                angular.element('.tile-event-modal').css({'transform':$scope.transform, '-webkit-transform':$scope.transform, '-ms-transform':$scope.transform, '-moz-transform':$scope.transform, '-o-transform':$scope.transform});
            }
        }

        // Listen and get results from tile.eventrace.info.js
        $scope.$on('results', function(e, data){
            $scope.results = data;
        })

        // Listen Dialog close event and set scroll position to origin value.
        $rootScope.$on('ngDialog.closed', function (e, $dialog) {
            window.scrollTo(0, $scope.scrollPos);
            angular.element('body').css('top', '');
        });

        $scope.slidePanel = function(dir){
            if(dir === 'prev'){
                $scope.translate += eventPanelWidth;
                $scope.transform = "translate("+$scope.translate+"px, 0px)";
            }else{
                $scope.translate -= eventPanelWidth;
                $scope.transform = "translate("+$scope.translate+"px, 0px)";
            }
            angular.element('.tile-event-modal').css({'transform':$scope.transform, '-webkit-transform':$scope.transform, '-ms-transform':$scope.transform, '-moz-transform':$scope.transform, '-o-transform':$scope.transform});
        }
    }
})();