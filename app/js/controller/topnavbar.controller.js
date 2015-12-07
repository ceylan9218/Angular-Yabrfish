/**=========================================================
 * Module: topnavbarController
 * Author: Ryan - 2015.9.21
 * Handle topnavbar collapsible elements
 =========================================================*/

(function() {
    'use strict';

    angular
        .module('app.topnavbar', ['facebook'])        
        .controller('topnavbarController', topnavbarController);

    function topnavbarController($scope, $http, $location, Facebook, APP_APIS, AuthenticationService) {
      $scope.toggleItem = function() {
        if($('.dropdown').hasClass('open'))
          $('.dropdown').removeClass('open');
        else
          $('.dropdown').addClass('open');
      }
      $scope.hideMenu = function() {
        angular.element('.open').removeClass('open');
      }
      
      // Initial checking if user logged in.
      AuthenticationService.getUser();

      /**
       * Logout
       */
      $scope.logout = function() {
        angular.element('.open').removeClass('open');
        AuthenticationService.logout();
      }
    }
})();