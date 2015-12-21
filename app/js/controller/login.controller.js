/**=========================================================
 * Module: loginController
 * Description: Controller for Login page.
 * Author: Ryan - 2015.12.4 - Updated by Marcin.
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.login', ['flash'])
        .controller('loginController', loginController);
    
    function loginController($scope, $rootScope, $http, $location, $cookieStore, AuthService, Flash, APP_APIS) {
    	
    	// Facebook login.
		$scope.FBLogin = function() {
			AuthService.FBLogin();
		}

        $scope.login = function() {
            if(!$scope.email){
                Flash.create('danger', 'Please input valid Email address.');
                return;
            }

            if(!$scope.password){
                Flash.create('danger', 'Please input password');
                return;
            }

            AuthService.login($scope.email, $scope.password).then(function(user){
                if(user == ''){
                    Flash.create('danger', 'Failed Login!');
                    return;
                }else{
                    Flash.create('success', 'Successfully Login!');
                }
            });            
        }
    }
})();