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
            		
            	},
            	templateUrl: "app/views/partials/race-list.html",
            	link: function(scope, elem, attrs) {
                    var monthNames = TileService.getMonthNames();

                    scope.$on('classData', function(e, data){
                        scope.eventId = data.eventId;
                        scope.classId = data.classObj.externalId;

                        // Get Races for a class
                        TileService.getRaces(scope.eventId, scope.classId).then(function(data){
                            scope.races = data;

                            if(scope.races.length == 0){
                                scope.isRace = true;
                                scope.showRaces = false;
                                var message = 'No Races!';
                                Flash.create('danger', message);
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
                                // Set Event ID and Class ID to Races.
                                // scope.races[i].eventId = eventId;
                                // scope.races[i].classId = classId;
                            }
                        }, function(error){
                            console.log(error);
                            return;
                        })
                    })

                    scope.getResult = function(race){
console.log(race, scope.eventId, scope.classId);                        
                        if(race.showResult)
                            race.showResult = false;
                        else{
                            race.showResult = true;

                            TileService.getResults(scope.eventId, scope.classId, race.externalId).then(function(data){
                                race.results = data;

                                if(race.results.length == 0){
                                    var message = 'No Results!';
                                    Flash.create('danger', message);
                                }

                                for(var i in race.results){
                                    if(isNaN(race.results[i].positionDesc))
                                        race.results[i].positionDesc = "DNC";

                                    // Get finishCorrected
                                    if(race.results[i].finishCorrected)
                                        race.results[i].finishCorrected = race.results[i].finishCorrected.split('.')[0].split(':');
                                }
                            }, function(error){
                                console.log(error);
                                return;
                            })
                        }
                    }
                }
            }
        }]);
})();        