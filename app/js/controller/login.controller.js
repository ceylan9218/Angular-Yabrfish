/**=========================================================
 * Module: Facebook Login
 * Author: Ryan - 2015.9.21
 * Login Via Facebook Account
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.login', ['facebook'])
        .config(['FacebookProvider',
          function(FacebookProvider) {
            var myAppId = '502380783269481';
           
            // You can set appId with setApp method
            // FacebookProvider.setAppId('myAppId');
           
            /**
            * After setting appId you need to initialize the module.
            * You can pass the appId on the init method as a shortcut too.
            */
            FacebookProvider.init(myAppId);           
          }
        ])
        .controller('loginController', loginController)
        /**
         * Just for debugging purposes.
         * Shows objects in a pretty way
         */
        .directive('debug', function() {
          return {
            restrict: 'E',
            scope: {
              expression: '=val'
            },
            template: '<pre>{{debug(expression)}}</pre>',
            link: function(scope) {
              // pretty-prints
              scope.debug = function(exp) {
                return angular.toJson(exp, true);
              };
            }
          }
        });
    
    function loginController($scope, $rootScope, $timeout, Facebook, $location, $http, APP_APIS) {
      // Define user empty data :/
      $rootScope.user = {};
      
      // Defining user logged status
      $rootScope.logged = false;
      
      // And some fancy flags to display messages upon user status change
      $scope.byebye = false;
      $scope.salutation = false;
      
      /**
       * Watch for Facebook to be ready.
       * There's also the event that could be used
       */
      $scope.$watch(
        function() {
          return Facebook.isReady();
        },
        function(newVal) {
          if (newVal)
            $scope.facebookReady = true;
        }
      );
      
//      var userIsConnected = false;
      
      Facebook.getLoginStatus(function(response) {
        if (response.status == 'connected') {
//          userIsConnected = true;
          $rootScope.user = response;
          $rootScope.logged = true;
          $http.get(APP_APIS['commerce']+'/viewers/'+$rootScope.user.authResponse.userID+'?ident=facebook')
            .success(function(data) {
              $rootScope.user = data;
            })
        }
      });
      
      /**
       * IntentLogin
       */
      $scope.IntentLogin = function() {
        if(!$rootScope.logged) {
          $scope.login();
        }
      };
      
      /**
       * Login
       */
      $scope.login = function() {
        Facebook.login(function(response) {
          if (response.status == 'connected') {
            $rootScope.logged = true;
            $location.path('/app');
            $scope.me();
          }        
        }, {scope: 'email, user_birthday, user_friends, user_likes'});
      };
       
      /**
       * me 
       */
      $scope.me = function() {        
        Facebook.api('/me?fields=name,email,birthday,gender,sports,taggable_friends', function(response) {
          /**
           * Using $scope.$apply since this happens outside angular framework.
           */
          $rootScope.$apply(function() {
            $rootScope.user = response;
          });

          $http.get(APP_APIS['commerce']+'/viewers/'+$rootScope.user.id+'?ident=facebook')
            .success(function(data) {
              $rootScope.user = data;
            }).error(function(data, status){
              $http.post(APP_APIS['commerce']+'/viewers/'+$rootScope.user.id+'?ident=facebook')
                .success(function(data) {

                })
            });
        });
      };
      
      /**
       * Logout
       */
      $rootScope.logout = function() {
        angular.element('.open').removeClass('open');
        Facebook.logout(function() {
          $rootScope.$apply(function() {
            $rootScope.user = {};
            $rootScope.logged = false;
//            userIsConnected = false;
            $location.path('app/login');
          });
        });
      }
      
      /**
       * Taking approach of Events :D
       */
      $scope.$on('Facebook:statusChange', function(ev, data) {
        console.log('Status: ', data);
        if (data.status == 'connected') {          
          $scope.$apply(function() {
            $scope.salutation = true;
            $scope.byebye     = false;
          });
        } else {
          $scope.$apply(function() {
            $scope.salutation = false;
            $scope.byebye     = true;
            
            // Dismiss byebye message after two seconds
            $timeout(function() {
              $scope.byebye = false;
            }, 2000)
          });
        }
      });
    }
})();