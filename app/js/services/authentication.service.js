/**=========================================================
 * Module: Authentication module.
 * Author: Marcin - 2015.12.4
 * Account Login.
 =========================================================*/
(function() {
    'use strict';
    
    angular
        .module('app.facebook-auth', ['facebook'])
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
        .factory('AuthenticationService', AuthenticationService);
       
        function AuthenticationService($http, $location, Facebook, APP_APIS){
          var service = {};

          // Define user empty data :/
          service.user = {};

          // Defining user logged status
          service.logged = false;

          /**
          * Watch for Facebook to be ready.
          * There's also the event that could be used
          */
          // $scope.$watch(
          //   function() {
          //     return Facebook.isReady();
          //   },
          //   function(newVal) {
          //     if (newVal)
          //       $scope.facebookReady = true;
          //   }
          // );

          service.getUser = function() {
            Facebook.getLoginStatus(function(response) {
              if (response.status == 'connected') {
                service.user = response;
                service.logged = true;
                $http.get(APP_APIS['commerce']+'/viewers/'+response.authResponse.userID+'?ident=facebook')
                  .success(function(data) {
                    service.user = data;
                  })
                return response;
              }
            });
          }
          
          /**
          * Login
          */
          service.login = function() {
            if(!service.logged) {
              Facebook.login(function(response) {
                if (response.status == 'connected') {
                  service.logged = true;
                  $location.path('/app');
                  me();
                }        
              }, {scope: 'email, user_birthday, user_friends, user_likes'});
            }
          };

          /**
          * me 
          */
          var me = function() {
            Facebook.api('/me?fields=name,email,birthday,gender,sports,taggable_friends', function(response) {
              /**
              * Using $scope.$apply since this happens outside angular framework.
              */
              // $rootScope.$apply(function() {
              //   $rootScope.user = response;
              // });
              $http.get(APP_APIS['commerce']+'/viewers/'+response.id+'?ident=facebook')
                .success(function(data) {
                  service.user = data;
                  return service;
                })
                .error(function(data, status){
                  $http.post(APP_APIS['commerce']+'/viewers/'+response.id+'?ident=facebook')
                    .success(function(data) {
                    })
                });              
            });
          };

          /**
          * Logout
          */
          service.logout = function() {
            angular.element('.open').removeClass('open');
            Facebook.logout(function() {
              service.user = {};
              service.logged = false;
              return service;
            });
          }

          /**
          * Taking approach of Events :D
          */
          // $scope.$on('Facebook:statusChange', function(ev, data) {
          //   console.log('Status: ', data);
          // });

          return service;
        }
})();