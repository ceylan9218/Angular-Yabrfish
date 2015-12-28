/**=========================================================
 * Module: topnavbarController
 * Description: Controller for top nav bar.
 * Author: Ryan - 2015.9.21
 =========================================================*/

(function() {
    'use strict';

    angular
        .module('app.topnavbar', [])        
        .controller('topnavbarController', topnavbarController);

    function topnavbarController($scope, $cookieStore, AuthService) {      
      // Initial checking if user logged in.
      AuthService.getUser();

      /**
       * Logout
       */
      $scope.logout = function() {
        angular.element('.open').removeClass('open');
        AuthService.logout();
      }
    }
})();