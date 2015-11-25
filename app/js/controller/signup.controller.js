/**=========================================================
 * signupController: Controller for a Sign Up page
 * used in Sign Up page.
 * Author: Ryan - 2015.11.15
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.signup', ['ngAnimate', 'ui.bootstrap'])
        .controller('signupController', signupController);

    function signupController($scope, $http) {
      $scope.slideSignup = function(dir){
        var formWidth = angular.element('.signup-form').width();

        if (dir === 'next') {
          formWidth = formWidth * -1;
          $scope.transform = "translate("+formWidth+"px, 0px)";
        }else {
          $scope.transform = "translate(0px, 0px)";
        }
      }

      $scope.setFile = function(element) {
        $scope.currentFile = element.files[0];
        var reader = new FileReader();

        reader.onload = function(event) {
          $scope.image_source = event.target.result;
          $scope.$apply();
        }

        // when the file is read it triggers the onload event above.
        reader.readAsDataURL(element.files[0]);
      }
    }
})();