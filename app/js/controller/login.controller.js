/**=========================================================
 * Module: Login Controller.
 * used in Login page.
 * Author: Ryan - 2015.12.4 - Updated by Marcin.
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.login', [])
        .controller('loginController', loginController);
    
    function loginController($scope, $rootScope, $location, $http, APP_APIS, AuthenticationService) {
    	
    	// Facebook login.
		$scope.FBLogin = function() {
			AuthenticationService.login();
		}
    }
})();