/**=========================================================
 * Module: Club View Directive.
 * Description: Directive for a club panel of profile page.
 * Author: Marcin - 2016.1.28
 =========================================================*/
 (function() {
    'use strict';

    angular
        .module('app.club', [])
        .directive("club", function() {
        	return {
        		restrict: 'E',
        		templateUrl: "app/views/partials/club.html",
        		scope: {
        			club: '='
        		},
        		link: function(scope, elem, attrs) {
        			console.log(scope.club);
        		}
        	}
        })
})();