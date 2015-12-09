/**=========================================================
 * Module: FacebookAuthService.
 * Description: Service for facebook authentication.
 * Author: Marcin - 2015.12.4
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
        .service('FacebookAuthService', FacebookAuthService);

        function FacebookAuthService($http, $location, $q, Facebook, $rootScope, APP_APIS){
          $rootScope.logged = false;
          $rootScope.user = {};

          var me = function(response) {
            var deferred = $q.defer();
            Facebook.api('/me?fields=name, first_name, last_name, email, birthday, gender, sports, taggable_friends', function(response) {
                if (!response || response.error) {
                    deferred.reject('Error occured');
                } else {
console.log(response.id);
                  $http.get(APP_APIS['commerce']+'/viewers/'+response.id+'?ident=facebook')
                    .success(function(data) {
                      deferred.resolve(data);
                      
                      $rootScope.logged = true;
                      $rootScope.user = data;
                      $rootScope.user.email = response.email;
                      $rootScope.user.birthday = response.birthday;
                      $rootScope.user.gender = response.gender;
                      $rootScope.user.taggable_friends = response.taggable_friends;
console.log($rootScope.user);
                    })
                    .error(function(data, status){
                      if(status == 404){
                        var params = {
                          "forename": response.first_name,
                          "nickname": response.name,
                          "surname": response.last_name,
                          "viewerIdentities": [{
                            "isExternalAuth": true,
                            "identityService": "FACEBOOK",
                            "identityId": response.id
                          }]
                        }
                        $http({
                          method: 'POST',
                          url: APP_APIS['commerce']+'/viewers',
                          data: JSON.stringify(params),
                          headers: {'Content-Type': 'application/json'}
                        }).success(function (data, status, headers, config){
                          console.log(data);
                        }).error(function (data, status, headers, config){
                          console.log(status);
                        })
                      }
                      deferred.resolve(status);                        
                    });
                }
            });
            return deferred.promise;
          };

          return {              
              getUser: function() {
                Facebook.getLoginStatus(function(response) {
                  if (response.status == 'connected') {
                    me(response);
                  }else{
//                    $location.path('app/login');
                  }
                }, {scope: 'email, user_birthday, user_friends, user_likes'});
                $rootScope.user.externalId = "A10153DA-E739-4978-ADA4-B9765F7DFCEF"; // Just For testing.
              },

              login: function() {
                Facebook.login(function(response) {
                  if (response.status == 'connected') {
                    me(response);
                    $location.path('/');
                  }        
                }, {scope: 'email, user_birthday, user_friends, user_likes'});
              },

              logout: function() {
                Facebook.logout(function() {
                  $rootScope.user = {};
                  $rootScope.logged = false;
                  $location.path('app/login');
                });
              }
          }
        }
})();