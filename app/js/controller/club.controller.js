/**=========================================================
 * Module: clubController
 * Description: Controller for Club item in Profile menu.
 * Author: Marcin - 2015-11-19
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.profile-clubs', ['ngAnimate', 'ui.bootstrap','flash', 'ngFileUpload'])
        .directive('memberAction', function(){
          return {
            restrict: 'E',
            scope: {
              actionType: '=',
              accountId: '=',
              clubActions: '=',
            },
            templateUrl: 'app/views/partials/member-action.html',
            link: function(scope, elm, attr){
console.log(scope.clubActions);
                scope.relationshipTypes = scope.clubActions;

                // Update Relationship
                scope.updateRelation = function(relationId){

                    var accountId = scope.accountId;
                    var relationship = {
                        accountId: scope.accountId,
                        relationship: relationId
                    }

                    scope.$parent.$emit('relationShip', relationship);

              }
            }
          }
        })
        .controller('clubController', clubController);

    function clubController($scope, $rootScope, $http, RouteHelpers, Flash, APP_APIS, ViewerService, AccountService, LookupService) {

        if(!$rootScope.user)
          return;
      
        $scope.basepath = RouteHelpers.basepath;
        $scope.inMotion = false;
        $scope.loading = false;
        $scope.clubs = [];
        $scope.myClubs = ViewerService.cacheClubs();
        $scope.search_club = '';
        $scope.searchToken = '';
        $scope.bClubScrollDisabled = false;

        $scope.clubActions = [];

            //----------------------------------------------------------------------------
            // Fill Out the Initial Clubs View for Membership and Relationships
            //----------------------------------------------------------------------------

            $scope.getClubLookups = function() {

                LookupService.getRelationshipTypes().then(function(types){
                    $scope.clubActions = types;
                }, function(error){
                    console.log(error);
                })

            }

            $scope.getClubs = function() {


                console.log("Get Clubs Called " + $scope.myClubs.length + "Loading " + $scope.loading + "Scroll "+ $scope.bClubScrollDisabled)

                if ( $scope.loading ) {
                    return;
                }

                $scope.loading = true;

                if ( ! ViewerService.moreClubs() ) {
                    $scope.loading = false;
                    $scope.bClubScrollDisabled = true;
                } else {
                    ViewerService.getClubs($rootScope.user.externalId).then(function (clubs) {
                        $scope.myClubs = clubs;
                        $scope.loading = false;
                        $scope.bClubScrollDisabled = true;
                    }, function (error) {
                        console.log(error);
                        return;
                    })
                }

            }

            // --------------------------------------------------------------------
            // Call Back Function for Image Upload - Used to update Account Panel
            // --------------------------------------------------------------------
            $scope.onComplete = function (creative) {


                var currClub = ViewerService.setCurrentClub(creative.externalId);

                var currAccount = currClub.account;
                //--------------------------------------------------------
                // Update the Image
                //--------------------------------------------------------
                currAccount.accountLogoUrl  = creative.creatives.url;

                AccountService.updateAccount(currAccount).then(function (data) {
                    console.log("Successful Update Account");
                    ViewerService.UpdateClub(creative.externalId,'accountLogoUrl',creative.creatives.url);
                }, function (error) {
                    console.log(error);
                    Flash.create('danger', 'Error! Problem Updating Image For The Account');
                    return;
                })


            }


            //----------------------------------------------------------------------------
            // Search For Clubs
            //----------------------------------------------------------------------------
            $scope.searchClubs = function() {

              //---------------------------------------------------------//
              // Load Single Page Search
              //--------------------------------------------------------//
              if ( $scope.inMotion || ! AccountService.moreSearch($scope.searchToken) ) {
                //---------------------------------------------------------------
                // Check Cache Size of Controller if navigation has left the View
                //---------------------------------------------------------------
                if ( $scope.clubs.length < AccountService.searchCacheSize()) {
                  $scope.clubs.length = 0;
                  $scope.clubs = AccountService.cacheSearch();
                }
                return;
              }

              $scope.inMotion = true;
              $scope.loading = true;

              if ( ! AccountService.moreSearch($scope.searchToken) ) {
                $scope.loading = false;
                $scope.inMotion = true;
              } else {
                AccountService.searchAccounts($scope.searchToken,1,$scope.search_club, '6').then(function (searchRes) {
                  $scope.clubs = AccountService.cacheSearch();
                  $scope.loading = false;
                  $scope.inMotion = false;
                }, function (error) {
                  console.log(error);
                  return;
                })
              }
            }

        // Search Clubs
            $scope.$watch('search_club', function(newVal){
              if(newVal != '' && newVal.length > 3) {
                  $scope.searchToken='CLUB'+ new Date().getTime();
                  $scope.search_club=newVal;
                  $scope.searchClubs();
              }
            });

            //----------------------------------------------------------------------------
            // Set Club into the View for Optional Creating A Relationship
            //----------------------------------------------------------------------------

            $scope.selectClub = function(club){

                for(var i in $scope.myClubs){
                if($scope.myClubs[i].account.externalId == club.externalId){
                  Flash.create('danger', 'Its Already Saved For You');
                  return;
                }
                }

                $scope.myClubs.push({account: club});

                ViewerService.addClubCache(club);

                  // Clear Search List
                  $scope.clubs = [];

        }

            //----------------------------------------------------------------------------
            // Remove a Club From Relationship and View receiving event from
            // Directive seems to intialise the controller
            //----------------------------------------------------------------------------
            $scope.$on('account', function(e, data){
                for(var i in $scope.myClubs){
                  if(data == $scope.myClubs[i].account.externalId){
                        ViewerService.removeClubCache($scope.myClubs[i].account.externalId);
                        $scope.myClubs.splice(i, 1);
                  }
                }
            })
    }

})();