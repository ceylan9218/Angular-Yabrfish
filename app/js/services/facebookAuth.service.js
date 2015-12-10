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
            FacebookProvider.setAppId('myAppId');

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
                var FBUser = response;
                if (!FBUser || FBUser.error) {
                    deferred.reject('Error occured');
                } else {
                  $http.get(APP_APIS['commerce']+'/viewers/'+FBUser.id+'?ident=facebook')
                    .success(function(data) {
                      // Get Viewer Informations with Facebook ID.
                      deferred.resolve(data);
                      
                      // $rootScope.logged = true;
                      // $rootScope.user = data;
                      // $rootScope.user.email = FBUser.email;
                      // $rootScope.user.birthday = FBUser.birthday;
                      // $rootScope.user.gender = FBUser.gender;
                      // $rootScope.user.taggable_friends = FBUser.taggable_friends;
//console.log($rootScope.user);
                    })
                    .error(function(data, status){
                      // If this Facebook user not signin to app, this viewer will be created automatically.
                      if(status == 404){
                        Facebook.api('/'+FBUser.id+'/picture', function(data){
                          var avatarUrl = data.data.url;
                          var params = {
                            "avatarUrl": avatarUrl,
                            "forename": FBUser.first_name,
                            "nickname": FBUser.name,
                            "surname": FBUser.last_name,
                            "viewerIdentities": [
                              {
                                "identityService": "FACEBOOK",
                                "identityId": FBUser.id
                              },
                              {
                                "identityService": "EMAIL",
                                "identityId": FBUser.email
                              }
                            ]
                          }

                          $http({
                            method: 'POST',
                            url: APP_APIS['commerce']+'/viewers',
                            data: JSON.stringify(params),
                            headers: {'Content-Type': 'application/json'}
                          }).success(function (data, status, headers, config){
                            var viewer = data;
                            // $rootScope.logged = true;
                            // $rootScope.user = viewer;
                            // $rootScope.user.email = FBUser.email;
                            // $rootScope.user.birthday = FBUser.birthday;
                            // $rootScope.user.gender = FBUser.gender;
                            // $rootScope.user.taggable_friends = FBUser.taggable_friends;

                            // Add attributes to new viewer.
                            var attr_params = [
                              {
                                "attribute": 1,
                                "attributeValueDate": Number(new Date(FBUser.birthday))
                              },
                              {
                                "attribute": 3,
                                "attributeValueText": FBUser.gender
                              }
                            ];

                            $http({
                              method: 'POST',
                              url: APP_APIS['commerce']+'/viewers/'+viewer.externalId+'/attributes',
                              data: JSON.stringify(attr_params),
                              headers: {'Content-Type': 'application/json'}
                            }).success(function (data, status, headers, config){
                              console.log(data)
                            }).error(function (data, status, headers, config){
                              console.log(status);
                            })                            

                            console.log(viewer);
                          }).error(function (data, status, headers, config){
                            console.log(status);
                          })
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
                var deferred = $q.defer();
                Facebook.getLoginStatus(function(response) {
                  if (response.status == 'connected') {
                    me(response).then(function(user){
                      deferred.resolve(user);
                    });
                  }else{
                    $location.path('app/login');
                  }
                }, {scope: 'email, user_birthday, user_friends, user_likes'});
                
                // Just For testing.
                $rootScope.user.externalId = "A10153DA-E739-4978-ADA4-B9765F7DFCEF"; 
                var user = {
                  externalId: "A10153DA-E739-4978-ADA4-B9765F7DFCEF"
                }
                deferred.resolve(user);

                return deferred.promise;
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