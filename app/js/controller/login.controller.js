/**=========================================================
 * Module: Facebook Login
 * Author: Marcin - 2015.12.4 - Changed
 * Login Via Facebook Account
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