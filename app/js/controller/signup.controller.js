/**=========================================================
 * Module: signupController
 * Description: Controller for a Sign Up page
 * Author: Ryan - 2015.11.15
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.signup', ['ngAnimate', 'ui.bootstrap', 'ngFileUpload', 'flash'])
        .controller('signupController', signupController);

    function signupController($scope, $http, $location, APP_APIS, Upload, Flash) {
      $scope.register = {        
        email: '',
        password1: '',
        password2: '',
        firstname: '',
        surname: '',
        agreements: ''
      }       

      $scope.createUser = function(){
        if(!$scope.register.agreements){
          Flash.create('danger', 'Error! Please read and agree the terms!');
          return;
        }

        var params = {
          email: $scope.register.email,
          password: $scope.register.password2,
          forename: $scope.register.firstname,
          surname: $scope.register.surname,
          regType: "EMAIL"
        }

        $http.post(APP_APIS['commerce']+'/registration', params)
          .success(function(user){
            console.log(user);
            Flash.create('success', 'Successfully registered new user.');
            $location.path('/app/login');
          }).error(function(status){
            console.log(status);
            Flash.create('danger', 'Failed registration.');
          });      
      }
    }
})();