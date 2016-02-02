/**=========================================================
 * Module: Race Directive.
 * Description: Directive for Races of Class in an Event.
 * Author: Ryan - 2015.12.26
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.race-list', [])
        .directive("raceList", ['$http', '$location', 'APP_APIS', 'TileService', 'Flash', function($http, $location, APP_APIS, TileService, Flash) {
            return {
            	restrict: "E",
            	scope: {
            		tile: '=',
                    event: '=',
                    eventIndex: '='
            	},
            	templateUrl: "app/views/partials/race-list.html",
            	link: function(scope, elem, attrs) {
                    var monthNames = TileService.getMonthNames();

                    scope.$on('circleData', function(e, data){
                        if(data.type == 'class'){

                            // Get Races for a class
                            TileService.getRaces(scope.event.eventId, data.data.accountExternalId).then(function(data){
                                scope.races = data;

                                if(scope.races.length == 0){
                                    scope.isRace = true;
                                    scope.showRaces = false;
                                    var message = 'No Races!';
    //                                Flash.create('danger', message);
                                }else{
                                    scope.isRace = false;
                                }

                                for(var i in scope.races){
                                    // Get Date of Race
                                    var race_date = new Date(scope.races[i].startdate);
                                    var race_day = race_date.getDate();
                                    if(race_day>3 && race_day<21){
                                        race_day = race_day + 'th';
                                    }else{
                                        switch (race_day % 10) {
                                            case 1:  race_day = race_day + "st";
                                            case 2:  race_day = race_day + "nd";
                                            case 3:  race_day = race_day + "rd";
                                            default: race_day = race_day + "th";
                                        }
                                    }
                                    var race_month = monthNames[race_date.getMonth()];
                                    var race_hours = race_date.getHours();
                                    var race_min = race_date.getMinutes();
                                    scope.races[i].race_date = race_day + " " + race_month + " " + race_hours + ":" + race_min;
                                    
                                }

                                // if(scope.races.length > 0)
                                //     getResults(scope.eventId, scope.classId, scope.races[0]);
                                
                            }, function(error){
                                console.log(error);
                                return;
                            })
                        }else{
                            getResults(scope.eventId, scope.classId, data.data);
                        }
                    })                   

                    var getResults = function(eventId, classId, race){
                        TileService.getResults(eventId, classId, race.externalId).then(function(data){
                            var results = data;

                            if(results.length == 0){
                                var message = 'No Results!';
                                Flash.create('danger', message);
                            }

                            for(var i in results){
                                if(isNaN(results[i].positionDesc))
                                    results[i].positionDesc = "DNC";

                                // Get finishCorrected
                                if(results[i].finishCorrected)
                                    results[i].finishCorrected = results[i].finishCorrected.split('.')[0].split(':');
                            }

                            scope.$emit('results', results);
                        }, function(error){
                            console.log(error);
                            return;
                        })
                    }
                }
            }
        }]);
})();        