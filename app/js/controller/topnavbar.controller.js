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

    function topnavbarController($scope, FacebookAuthService) {
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
      FacebookAuthService.getUser().then(function(user){
//        console.log(user);
      });

      /**
       * Logout
       */
      $scope.logout = function() {
        angular.element('.open').removeClass('open');
        FacebookAuthService.logout();

        if(userCookie)
          $cookieStore.remove('user');
      }
    }
})();