/**=========================================================
 * Module: peopleController
 * Description: Controller for people panel in Profile page.
 * Author: Marcin - 2016-2-13
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.profile-people', ['ngAnimate', 'ui.bootstrap'])
        .directive('peoplePanel', function() {
            return {
                restrict: 'E',
                transclude: true,
                scope: {
                    ownerId: '='
                },
                controller: 'peopleController',
                templateUrl: 'app/views/partials/people-panel.html'
            };
        })
        .controller('peopleController', peopleController)
        .directive('peopleItem', function() {
            return {
                require: '^peoplePanel',
                restrict: 'E',
                transclude: true,
                scope: {
                    member: '='
                },
                link: function(scope, element, attrs, peopleController) {
                },
                templateUrl: 'app/views/partials/people-item.html'
            };
        });

    function peopleController($rootScope, $scope, AccountService, $timeout) {

        $scope.people = AccountService.cacheClubMembers();
        $scope.loading = false;
        $scope.bClubMembersScrollDisabled = false;

        $scope.getClubMembers = function () {

            console.log("PEOPLE-CONTROLLER MEMBERS Called " + $scope.people.length + "Loading " + $scope.loading + "Scroll " + $scope.bClubMembersScrollDisabled);

            if ($scope.loading) {
                return;
            }

            $scope.loading = true;

            if (!AccountService.moreClubMembers()) {
                $scope.loading = false;
                $scope.bClubMembersScrollDisabled = true;
            } else {
                AccountService.getClubMembers($scope.ownerId).then(function (members) {
                    $scope.people = members;
console.log($scope.people);
                    $scope.loading = false;
                    $scope.bClubMembersScrollDisabled = true;
                    
                }, function (error) {
                    console.log(error);
                    return;
                })
            }
        }
    }
})();
