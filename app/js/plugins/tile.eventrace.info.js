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
            	scope: {
            		tile: '=',
                event: '=',
                eventIndex: '='
            	},
            	templateUrl: "app/views/partials/class-list.html",
            	link: function(scope, elem, attrs) {

                // On initialisation Get Classes or do we do that in HTML
                // NEED To set the classes on Event Change.
                getClasses(scope.event.eventId);

                // Receive Message from Circular Control
                scope.$on('circleData', function(e, data){

                    if(data.type == 'class') {
                        // Send Message to the Race List that The Class has Changed
                    }


                })

				}
            }
        })
        .controller('raceController', raceController)
        .directive("raceList", function() {
        return {
            restrict: "E",
            scope: {
                // Use the Class List Controller For Race Data As Well therefore do not require additonal
                // Reference to the Class List.
                require: '^classList',
            },
            templateUrl: "app/views/partials/race-list.html",
            link: function(scope, elem, attrs, ctrl) {

                // Receive Message from Circular Control
                scope.$on('circleData', function(e, data){

                    if(data.type == 'race') {

                    }


                })

            }
        };
    });


    // Add all Access to Services in a sIngle Controller for Both Directives

    function raceController($rootScope, $scope, $sce, RouteHelpers, ViewerService, Flash, $timeout) {


        // Shared Race Controller Removing Code from Directives
        $scope.eventClasses = [];

        var getClasses = function(eventId) {
            TileService.getClasses(eventId).then(function(classes) {
                scope.classes = classes;
                for (var i in scope.classes) {
                    var flag = "http://img.yabrfish.com/cdn/flags/" + scope.classes[i].classFlag.toLowerCase() + ".jpg";
                    scope.eventClasses[i].flag = flag;
                }
            }, function(error){
                console.log(error);
                return;
            })
        }
    }

})();