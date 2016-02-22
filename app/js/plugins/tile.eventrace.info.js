/**=========================================================
 * Module: Classes, Races & Results Directives.
 * Description: Directive for classes, races and results panel of Event modal.
 * Author: Ryan Modified Version - 2016.2.17
 =========================================================*/

(function() {
    'use strict';

    angular
        .module('app.event-raceInfo', [])
        .directive("classList",function() {
            return {
            	restrict: "E",
                transclude: true,
            	scope: {
                    event: '='
            	},
                controller: 'raceController',
            	templateUrl: "app/views/partials/class-list.html",
            	link: function(scope, elem, attrs) {

                    scope.$watch('classes', function(newVal){
                        // -------------------------------------------------------------
                        // Set Classes Slider width = classWidth * classes.length
                        // -------------------------------------------------------------
                        scope.transform = 0;
                        scope.translate = 0;
                        scope.classIndex = 0;
                        scope.classWidth = angular.element('.classes').width() / 3;
                        scope.classSliderWidth = scope.classWidth * scope.classes.length;
                        angular.element('.class-slider').css('margin-left', scope.classWidth+'px');
                    })

                    scope.slideClasses = function(dir){
                        if(!scope.translate)
                            scope.translate = 0;

                        if (dir === 'left' && scope.classIndex > 0) {
                            scope.translate += scope.classWidth;
                            scope.transform = "translate("+scope.translate+"px, 0px)";
                            scope.classIndex--
                            scope.currClass = scope.classes[scope.classIndex];                            
                        } else if(dir === 'right' && scope.classIndex < scope.classes.length - 1) {
                            scope.translate -= scope.classWidth;
                            scope.transform = "translate("+scope.translate+"px, 0px)";
                            scope.classIndex++;
                            scope.currClass = scope.classes[scope.classIndex];
                        }
                    }

				}
            }
        })
        .controller('raceController', raceController)
        .directive("raceList", function() {
            return {
                restrict: "E",
                require: '^classList',
                scope: {
                    races: '='
                },
                templateUrl: "app/views/partials/race-list.html",
                link: function(scope, elem, attrs, raceController) {
                    scope.currRace = {};

                    scope.$watch('races', function(newVal){
                        if(!newVal)
                            return;

                        scope.currRace = newVal[0];

                        // -------------------------------------------------------------
                        // Set Races Slider width = raceWidth * races.length
                        // -------------------------------------------------------------
                        scope.transform = 0;
                        scope.translate = 0;
                        scope.raceIndex = 0;
                        scope.raceWidth = angular.element('.races').width() / 5;
                        scope.raceSliderWidth = scope.raceWidth * scope.races.length;
                        angular.element('.race-slider').css('margin-left', scope.raceWidth*2+'px');
                    })

                    scope.slideRaces = function(dir){
                        if(!scope.translate)
                            scope.translate = 0;

                        if (dir === 'left' && scope.raceIndex > 0) {
                            scope.translate += scope.raceWidth;
                            scope.transform = "translate("+scope.translate+"px, 0px)";
                            scope.raceIndex--
                            scope.currRace = scope.races[scope.raceIndex];
                            raceController.setCurrRace(scope.currRace);
                        } else if(dir === 'right' && scope.raceIndex < scope.races.length - 1) {
                            scope.translate -= scope.raceWidth;
                            scope.transform = "translate("+scope.translate+"px, 0px)";
                            scope.raceIndex++;
                            scope.currRace = scope.races[scope.raceIndex];
                            raceController.setCurrRace(scope.currRace);
                        }
                    }
                }
            };
        });


    // Add all Access to Services in a Single Controller for Both Directives
    function raceController($scope, TileService) {        
        // Shared Race Controller Removing Code from Directives
        $scope.classes = [];
        $scope.currClass = {};
        $scope.currRace = {};

        // Get Classes list whenever click an event.
        $scope.$watch('event', function(newVal){
            if(Object.keys(newVal).length === 0)
                return;

            getClasses(newVal.eventId);
        })

        // Get Races list whenever change a class.
        $scope.$watch('currClass', function(newVal){
            var classId = newVal.externalId;
            getRaces($scope.event.eventId, classId);
        })

        // Get Result List whenever change a race.
        this.setCurrRace = function(race){
            getResults($scope.event.eventId, $scope.currClass.externalId, race.externalId);
        }

        var getClasses = function(eventId) {

            TileService.getClasses(eventId).then(function(classes) {
                $scope.classes = classes;

                for (var i in $scope.classes) {
                    var flag = "http://img.yabrfish.com/cdn/flags/" + $scope.classes[i].classFlag.toLowerCase() + ".jpg";
                    $scope.classes[i].flag = flag;
                }

                $scope.currClass = $scope.classes[0];
            }, function(error){
                console.log(error);
                return;
            })
        }

        var getRaces = function(eventId, classId) {
            
            if(!classId)
                return;

            TileService.getRaces(eventId, classId).then(function(data){                
                $scope.races = data;

                if($scope.races.length > 0)
                    getResults(eventId, classId, $scope.races[0].externalId);
                else
                    getResults(eventId, classId, false);

                angular.element('.results-panel').removeClass('whirl line back-and-forth');

            }, function(error){
                console.log(error);
                return;
            });
        }

        var getResults = function(eventId, classId, raceId){
            angular.element('.result-panel').addClass('whirl line back-and-forth');
            
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
                    
                    $scope.$emit('results', results);
                    angular.element('.result-panel').removeClass('whirl line back-and-forth');
                }, function(error){
                    console.log(error);
                    return;
                })    
            }else{
                var results = [];
                $scope.$emit('results', results);
                angular.element('.result-panel').removeClass('whirl line back-and-forth');
            }
        }
    }

})();