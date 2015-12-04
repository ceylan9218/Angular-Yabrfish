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

    function topnavbarController($rootScope, $scope, $http, $location, Facebook, APP_APIS) {
      $scope.toggleItem = function() {
        if($('.dropdown').hasClass('open'))
          $('.dropdown').removeClass('open');
        else
          $('.dropdown').addClass('open');
      }
      $scope.hideMenu = function() {
        angular.element('.open').removeClass('open');
      }

      Facebook.getLoginStatus(function(response) {
        if (response.status == 'connected') {
          $rootScope.user = response;
          $rootScope.logged = true;
          $http.get(APP_APIS['commerce']+'/viewers/'+$rootScope.user.authResponse.userID+'?ident=facebook')
            .success(function(data) {
              $rootScope.user = data;
console.log($rootScope.user);
            })
        }else{
          $rootScope.user = {};
          $rootScope.user.externalId = "A10153DA-E739-4978-ADA4-B9765F7DFCEF";  // Just For testing.
        }
      });

      /**
       * Logout
       */
      $rootScope.logout = function() {
        angular.element('.open').removeClass('open');
        Facebook.logout(function() {
          $rootScope.$apply(function() {
            $rootScope.user = {};
            $rootScope.logged = false;
            $location.path('app/login');
          });
        });
      }
    }
})();