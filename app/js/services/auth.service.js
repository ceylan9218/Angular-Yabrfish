/**=========================================================
 * Module: AuthService.
 * Description: Service for user authentication.
 * Author: Marcin - 2015.12.4
 =========================================================*/
(function() {
    'use strict';
    
    angular
        .module('app.authSrv', ['facebook'])
        .config(['FacebookProvider',
          function(FacebookProvider) {
            var myAppId = '502380783269481';

            // You can set appId with setApp method
            FacebookProvider.setAppId('myAppId');

            /**
            * After setting appId you need to initialize the module.
            * You can pass the appId on the init method as a shortcut too.
            */
            FacebookProvider.init(myAppId);
          }
        ])
        .service('AuthService', AuthService);

        function AuthService($http, $location, $q, Facebook, $rootScope, $cookieStore, APP_APIS){
          $rootScope.logged = false;
          $rootScope.user = {};

          var me = function(response) {
            var deferred = $q.defer();
            
            var tokenId = response.authResponse.accessToken;
            var params = {
              "regType" : "Facebook",
              "accessToken": tokenId
            }

            $http.post(APP_APIS['commerce']+'/auth', params)
              .success(function(response){
                // If this FB user was not registered, will be registered.
                if(response == ''){
                  $http.post(APP_APIS['commerce']+'/registration', params)
                    .success(function(user){
                      $rootScope.user = user;
                      $rootScope.logged = true;
                      deferred.resolve(user);
                    }).error(function(status){
                      deferred.resolve(status);
                    })
                }else{
                  $rootScope.user = response;
                  $rootScope.logged = true;
                  deferred.resolve(response);
                }
              }).error(function(status){
                deferred.resolve(status);
              })
            return deferred.promise;
          };

          return {              
              getUser: function() {
                var deferred = $q.defer();
                var userCookie = $cookieStore.get('user');
                if(userCookie){
                  $rootScope.logged = true;
                  $rootScope.user = userCookie;
                  deferred.resolve(userCookie);
                }else{
                  Facebook.getLoginStatus(function(response) {
                    if (response.status == 'connected') {
                      me(response).then(function(user){
                        deferred.resolve(user);

                        $rootScope.logged = true;
                        $rootScope.user = user;
                      });
                    }else{
                      $location.path('app/login');
                    }
                    }/*, {scope: 'email, user_birthday, user_friends, user_likes'}*/ );
                }                
                
                /* ------------------------------------------------------------------
                    Just For testing.
                    Andy's Account ID: A10153DA-E739-4978-ADA4-B9765F7DFCEF
                    Dan's Account ID: B16EF381-81D1-4014-8BFA-AA7B082E0FD7
                   ------------------------------------------------------------------*/
                $rootScope.user = {
                  avatarUrl:"https://scontent.xx.fbcdn.net/hprofile-xaf1/v/t1.0-1/c12.12.153.153/s50x50/33665_456192072715_4033077_n.jpg?oh=42ff51a9d97a59c831cdd5e0bf138d91&oe=56E185C2",
                  forename:"Daniel",
                  nickname:"Daniel Belton",
                  surname:"Belton",
                  externalId: "A10153DA-E739-4978-ADA4-B9765F7DFCEF"
                };
                deferred.resolve($rootScope.user);

                return deferred.promise;
              },

              login: function(email, password) {
                var deferred = $q.defer();
                // Check if this user has already registered.
                var params = {
                    email: email,
                    password: password,
                    regType: 'email'
                }
                
                $http.post(APP_APIS['commerce']+'/auth', params)
                  .success(function(user){
                    if(user != ''){
                      $rootScope.logged = true;
                      $rootScope.user = user;
                      $location.path('/');

                      $cookieStore.put('user', user);
                      var userCookie = $cookieStore.get('user');
                    }
                    deferred.resolve($rootScope.user);
                  }).error(function(status){
                      console.log(status);
                      deferred.resolve(status);
                  })

                return deferred.promise;
              },

              FBLogin: function() {
                Facebook.login(function(response) {
                  if (response.status == 'connected') {
                    me(response);
                    $location.path('/');
                  }        
                }, {scope: 'email, user_birthday, user_friends, user_likes'});
              },

              logout: function() {
                var userCookie = $cookieStore.get('user');
                if(userCookie){
                  $cookieStore.remove('user');
                  $rootScope.user = {};
                  $rootScope.logged = false;
                  $location.path('app/login');
                }else{
                  Facebook.logout(function() {
                    $rootScope.user = {};
                    $rootScope.logged = false;
                    $location.path('app/login');
                  });
                }
              }
          }
        }
})();