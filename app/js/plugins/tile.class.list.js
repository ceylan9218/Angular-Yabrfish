/**=========================================================
 * Module: Class Directive.
 * Description: Directive for Class of Event in a Tile.
 * Author: Ryan - 2015.12.24
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.class-list', [])
        .directive("classListOld", ['TileService', function(TileService) {
            return {
              	restrict: "E",
              	scope: {
              		tile: '=',
                  event: '=',
                  eventIndex: '='
              	},
              	templateUrl: "app/views/partials/class-list.html",
              	link: function(scope, elem, attrs) {

                		var getClasses = function(eventId) {
                			TileService.getClasses(eventId).then(function(classes){
                				scope.classes = classes;
                				for(var i in scope.classes) {
                            var flag = "http://img.yabrfish.com/cdn/flags/"+scope.classes[i].classFlag.toLowerCase()+".jpg";
                            scope.classes[i].flag = flag;
  	                    }

                        if(scope.eventIndex == 0){
                          var classData = {
                              type: 'class',
                              firstEvent: true,
                              data: scope.classes[0]
                          };
                        }else{
                          var classData = {
                              type: 'class',
                              firstEvent: false,
                              data: scope.classes[0]
                          };
                        }
                        scope.$parent.$broadcast('circleData', classData);
                			}, function(error){
                				console.log(error);
                				return;
                			})
                		}

                    scope.$watch('event', function(newVal){
                      var eventId = newVal.eventId;
                      getClasses(eventId);
                    })
  				      }
            }
        }]);
})();        