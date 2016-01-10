/**=========================================================
 * Module: actionReplay Directive.
 * Description: Directive for action replay panel of Tile Event.
 * Author: Marcin - 2016.1.8
 =========================================================*/
 (function() {
    'use strict';

    angular
        .module('app.action-replay', [])
        .directive("actionReplay", function(TileService) {
        	return {
        		restrict: 'E',
        		templateUrl: "app/views/partials/action-replay.html",
        		link: function(scope, elem, attrs) {
        			scope.medias = [];

        			var getMedia = function(eventId) {
        				TileService.getMedia(eventId).then(function(data){
        					scope.medias = data;
        				}, function(error){
        					console.log(error);
        					return;
        				})
        			}

        			scope.$on('event', function(e, data){
            			scope.eventId = data.event.eventId;
						getMedia(scope.eventId);
            		})
        		}
        	}
        })
})();