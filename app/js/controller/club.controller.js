/**=========================================================
 * Module: clubController
 * Description: Controller for Club item in Profile menu.
 * Author: Marcin - 2015-11-19
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.profile-clubs', ['ngAnimate', 'ui.bootstrap','flash'])
        .directive('memberAction', function($rootScope, LookupService, ViewerService){
          return {
            restrict: 'E',
            scope: {
              actionType: '=',
              accountId: '='              
            },
            templateUrl: 'app/views/partials/member-action.html',
            link: function(scope, elm, attr){
              // Get Relationship Types
              LookupService.getRelationshipTypes().then(function(types){
                scope.relationshipTypes = types;
              }, function(error){
                console.log(error);
                return;
              })

              scope.updateRelation = function(relationId){
                var viewerId = $rootScope.user.externalId;
                var accountId = scope.accountId;

                if(relationId == 0){
                  ViewerService.removeMembership(viewerId, accountId).then(function(data){
                    if(data.error == 'Not Found'){
                      console.log("Error! ", data.error);
                      return;
                    }
                    console.log(data);
                  });

                  ViewerService.removeRelation(viewerId, accountId).then(function(data){
                    if(data.error == 'Not Found'){
                      console.log("Error! ", data.error);
                      return;
                    }
                    console.log(data);
                  });

                  scope.$parent.$emit('account', accountId);

                }else{
                  ViewerService.updateRelation(viewerId, accountId, relationId).then(function(data){
                    if(data.error == 'Conflict'){
                      console.log("Error! ", data.error);
                      return;
                    }

                    scope.actionType = data.relationshipType;
                  });
                }
              }
            }
          }
        })
        .controller('clubController', clubController);

    function clubController($scope, $rootScope, $http, RouteHelpers, Flash, APP_APIS, ViewerService) {      
      if(!$rootScope.user)
        return;
      
      $scope.basepath = RouteHelpers.basepath;
      $scope.clubs = [];
      $scope.myClubs = [];
      $scope.search_club = '';

      // Search Clubs
      $scope.$watch('search_club', function(newVal){
        if(newVal != ''){
          $http.get(APP_APIS['commerce']+'/accounts?name='+newVal+'&type=6')
            .success(function(data){
              $scope.clubs = data;              
            })          
        }else{
          $scope.clubs = [];
        }
      });      

      // // Set Club Name in Search box.
      $scope.selectClub = function(club){
        $scope.search_club = club.name;

        for(var i in $scope.myClubs){
          if($scope.myClubs[i].account.externalId == club.externalId){
            Flash.create('danger', 'Already existed!');
            return;
          }
        }

        $scope.myClubs.push({
          account: club
        });
      }

      // Get my Clubs initially.
      $scope.getClubs = function() {
        ViewerService.getClubs($rootScope.user.externalId).then(function(clubs){
          $scope.myClubs = clubs;      
        }, function(error){
          console.log(error);
          return;
        })
      }

      // Hide a Club on Remove Action
      $scope.$on('account', function(e, data){
        for(var i in $scope.myClubs){
          if(data == $scope.myClubs[i].account.externalId){
            $scope.myClubs.splice(i, 1);
          }
        }
      })
    }
})();