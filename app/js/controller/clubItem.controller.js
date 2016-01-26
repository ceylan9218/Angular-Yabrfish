/**=========================================================
 * Module: clubItemController
 * Description: Controller for Club item in Profile menu.
 * Author: Marcin - 2015-11-19
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.club-detail', ['ngAnimate', 'ui.bootstrap','flash', 'ngFileUpload'])
        .directive('memberAction', function(LookupService){
            return {
                restrict: 'EA',
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
        .controller('clubItemController', clubItemController);

    function clubItemController($scope, $rootScope, $http, RouteHelpers, Flash, APP_APIS, ViewerService, AccountService, LookupService) {

        if(!$rootScope.user)
            return;



        //----------------------------------------------------------------------------
        // Fill Out the Initial Clubs View for Membership and Relationships
        //----------------------------------------------------------------------------

        $scope.getActions = function() {

            $scope.clubActions = [];

            LookupService.getRelationshipTypes().then(function(types){
                $scope.clubActions = types;
            }, function(error){
                console.log(error);
            })

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