/**=========================================================
 * Module: Class Directive.
 * Description: Directive for Class of Event in a Tile.
 * Author: Ryan - 2015.12.24
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.class-list', [])
        .directive("classList", ['$http', '$location', 'APP_APIS', 'TileService', '$timeout', function($http, $location, APP_APIS, TileService, $timeout) {
            return {
            	restrict: "E",
            	scope: {
            		tile: '='
            	},
            	templateUrl: "app/views/partials/class-list.html",
            	link: function(scope, elem, attrs) {
            		scope.eventId = '';

            		var getClasses = function(eventId) {
            			TileService.getClasses(eventId).then(function(classes){
            				scope.classes = classes;
            				for(var i in scope.classes) {
		                        var flag = "http://img.yabrfish.com/cdn/flags/"+scope.classes[i].classFlag.toLowerCase()+".jpg";
		                        scope.classes[i].flag = flag;
		                    }
            				scope.classWidth = angular.element('.classes').width() / 3;
	                    	scope.classSliderWidth = scope.classWidth * scope.classes.length;
            			}, function(error){
            				console.log(error);
            				return;
            			})
            		}

            		// Get Classes for first Event.
            		TileService.getFirstEvent(scope.tile.externalId).then(function(event){
            			getClasses(event.externalId);
            			scope.eventId = event.externalId;
            		})

					scope.slideClasses = function(dir){
						var classWidth = angular.element('.classes').width() / 3;
						var endTranslate = (scope.classes.length - 3) * classWidth * -1;

						if(!scope.translate)
							scope.translate = 0;

						if (dir === 'left') {
							scope.translate += classWidth;
							if(scope.translate <= 0)
								scope.transform = "translate("+scope.translate+"px, 0px)";
							else
								scope.translate = 0;
						} else {
							if(scope.classes.length > 3){
								scope.translate -= classWidth;
								if(scope.translate >= endTranslate)
									scope.transform = "translate("+scope.translate+"px, 0px)";
								else{
									scope.transform = "translate("+endTranslate+"px, 0px)";
									scope.translate = endTranslate;
								}
							}
						}
					}

            		scope.$on('event', function(e, data){
            			scope.eventId = data.event.eventId;
						getClasses(data.event.eventId);
            		})

            		scope.selectClass = function(classObj){                        
                        scope.selectedClass = classObj.externalId;

            			var classData = {
            				classObj: classObj,
            				eventId: scope.eventId
            			};

            			$timeout(function(){
						   scope.$parent.$parent.$parent.$broadcast('classData', classData);
						});
            		}
				}
            }
        }]);
})();        