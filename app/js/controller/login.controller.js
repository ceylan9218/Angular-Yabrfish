/**=========================================================
 * Module: loginController
 * Description: Controller for Login page.
 * Author: Ryan - 2015.12.4 - Updated by Marcin.
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.login', [])
        .controller('loginController', loginController);
    
    function loginController($scope, $http, FacebookAuthService) {
    	
    	// Facebook login.
		$scope.FBLogin = function() {
			FacebookAuthService.login();
		}
    }
})();