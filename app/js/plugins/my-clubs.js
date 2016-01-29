/**=========================================================
 * Module: My Clubs Directive.
 * Description: Directive for my clubs panel of profile page.
 * Author: Marcin - 2016.1.28
 =========================================================*/
 (function() {
    'use strict';

    angular
        .module('app.my-clubs', [])
        .directive("myClubs", function(ViewerService) {
        	return {
        		restrict: 'E',
        		templateUrl: "app/views/partials/club-list.html",
        		scope: {
        			viewerId: '='
        		},
        		link: function(scope, elem, attrs) {
        			ViewerService.getClubs(scope.viewerId).then(function (clubs) {
	                    scope.myClubs = clubs;
	                }, function (error) {
	                    console.log(error);
	                    return;
	                })
        		}
        	}
        })
})();