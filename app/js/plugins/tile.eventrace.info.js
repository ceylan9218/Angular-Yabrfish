/**=========================================================
 * Module: Class Directive.
 * Description: Directive for Class of Event in a Tile.
 * Author: Andy Modified Version
 =========================================================*/

(function() {
    'use strict';

    angular
        .module('app.race-info', [])
        .directive("classList",function() {
            return {
            	restrict: "E",
                transclude: true,
            	scope: {
            		tile: '=',
                    event: '='
            	},
                controller: 'raceController',
            	templateUrl: "app/views/partials/class-list.html",
            	link: function(scope, elem, attrs) {

				}
            }
        })
        .controller('raceController', raceController)
        .directive("raceList", function() {
            return {
                restrict: "E",
                require: '^classList',
                scope: {
                    // Use the Class List Controller For Race Data As Well therefore do not require additonal
                    // Reference to the Class List.
                    event: '=',
                    races: '='
                },
                templateUrl: "app/views/partials/race-list.html",
                link: function(scope, elem, attrs, raceController) {
                    scope.$watch('races', function(newVal){
//                        console.log(newVal);
                    })

                    // Receive Message from Circular Control
                    scope.$on('circleData', function(e, data){
                        if(data.type == 'race') {
                        }
                    })
                }
            };
        });


    // Add all Access to Services in a Single Controller for Both Directives

    function raceController($scope, TileService) {        

        $scope.$watch('event', function(newVal){
            getClasses($scope.event.eventId);
        })

        // Shared Race Controller Removing Code from Directives
        $scope.eventClasses = [];

        var getClasses = function(eventId) {
            $scope.showClasses = false;

            TileService.getClasses(eventId).then(function(classes) {
                $scope.eventClasses = classes;
                for (var i in $scope.eventClasses) {
                    var flag = "http://img.yabrfish.com/cdn/flags/" + $scope.eventClasses[i].classFlag.toLowerCase() + ".jpg";
                    $scope.eventClasses[i].flag = flag;
                }
                getRaces(eventId, $scope.eventClasses[0].externalId);

                $scope.showClasses = true;
            }, function(error){
                console.log(error);
                return;
            })
        }

        var getRaces = function(eventId, classId) {
            $scope.showRaces = false;

            TileService.getRaces(eventId, classId).then(function(data){                
                $scope.races = data;
                for(var i in $scope.races){
                    $scope.races[i].classId = classId;
                }

                $scope.showRaces = true;

                if($scope.races.length > 0)
                    getResults(eventId, classId, $scope.races[0].externalId);
            }, function(error){
                console.log(error);
                return;
            });
        }

        var getResults = function(eventId, classId, raceId){
            if(raceId){
                TileService.getResults(eventId, classId, raceId).then(function(data){
                    var results = data;

                    if(results.length == 0){
                        var message = 'No Results!';
                        //Flash.create('danger', message);
                    }

                    for(var i in results){
                        if(isNaN(results[i].positionDesc))
                            results[i].positionDesc = "DNC";

                        // Get finishCorrected
                        if(results[i].finishCorrected)
                            results[i].finishCorrected = results[i].finishCorrected.split('.')[0].split(':');
                    }
console.log(results);                    
                    $scope.$emit('results', results);
                }, function(error){
                    console.log(error);
                    return;
                })    
            }else{
                var results = [];
            }
        }

        // Receive Message from Circular Control
        $scope.$on('circleData', function(e, data){
            if(data.type == 'class') {
                getRaces($scope.event.eventId, data.data.externalId);
            }else if(data.type == 'race'){
                var classId = data.data.classId;
                var raceId = data.data.externalId;
                getResults($scope.event.eventId, classId, raceId);
            }
        })

    }

})();