/**=========================================================
 * Module: clubController
 * Description: Controller for Club item in Profile menu.
 * Author: Marcin - 2015-11-19
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.profile-accounts', ['ngAnimate', 'ui.bootstrap','flash'])
        .directive('accPanel', function() {
            return {
                restrict: 'E',
                transclude: true,
                scope: {},
                controller: 'accController',
                templateUrl: 'app/views/partials/acc-panel.html'
            };
        })
        .controller('accController', accController)
        .directive('accItem', function() {
            return {
                require: '^clubPanel',
                restrict: 'E',
                transclude: true,
                scope: {
                    club: '='
                },                
                link: function(scope, element, attrs, clubController) {
//                    clubController.addItem(scope);
                },
                templateUrl: 'app/views/partials/acc-item.html'
            };
        });

    function accController($rootScope, $scope, $sce, RouteHelpers, ViewerService, Flash, $timeout) {

        $scope.myAccounts = ViewerService.cacheClubs();
        $scope.loading = false;
        $scope.bAccScrollDisabled = false;
        $scope.clubsWidth = 0;


        var setClubsWidth = function(clubs){
            $timeout(function(){
                var clubWidth = angular.element('.club').width();
                $scope.clubsWidth = clubs.length * clubWidth + 'px';
            })
        }
        
        setClubsWidth($scope.myAccounts);

        $scope.getClubs = function () {

            console.log("ACCOUNT-CONTROLLER CLUBS Called " + $scope.myAccounts.length + "Loading " + $scope.loading + "Scroll " + $scope.bAccScrollDisabled)

            if ($scope.loading) {
                return;
            }

            $scope.loading = true;

            if (!ViewerService.moreClubs()) {
                $scope.loading = false;
                $scope.bAccScrollDisabled = true;
            } else {
                ViewerService.getAccounts($rootScope.user.externalId).then(function (accounts) {
                    $scope.myAccounts = accounts;

                    $scope.loading = false;
                    $scope.bAccScrollDisabled = true;

                    setClubsWidth($scope.myAccounts);
                }, function (error) {
                    console.log(error);
                    return;
                })
            }
        }
    }

})();
