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
    
    function loginController($scope, $rootScope, $http, $location, $cookieStore, FacebookAuthService, Flash, APP_APIS) {
    	
    	// Facebook login.
		$scope.FBLogin = function() {
			FacebookAuthService.login();
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

            // Check if this user has already registered.
            var params = {
                email: $scope.email,
                password: $scope.password,
                regType: 'email'
            }
            
            $http.post(APP_APIS['commerce']+'/auth', params)
                .success(function(user){
                    if(user == ''){
                        Flash.create('danger', 'Failed Login!');
                        return;
                    }else{
                        Flash.create('success', 'Successfully Login!');

                        $rootScope.logged = true;
                        $rootScope.user = user;
                        $location.path('/');

                        $cookieStore.put('user', user);
                        var userCookie = $cookieStore.get('user');
                    }
//                    console.log(user);
                }).error(function(status){
                    console.log(status);
                })
        }
    }
})();