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
                require: '^accPanel',
                restrict: 'E',
                transclude: true,
                scope: {
                    account: '='
                },                
                link: function(scope, element, attrs, accController) {
//                    clubController.addItem(scope);
                },
                templateUrl: 'app/views/partials/acc-item.html'
            };
        });

    function accController($rootScope, $scope, $sce, RouteHelpers, ViewerService, AccountService, Flash, $timeout) {

        $scope.myAccounts = ViewerService.cacheClubs();;
        $scope.loading = false;
        $scope.bAccScrollDisabled = false;
        $scope.accountsWidth = 0;


        var setAccWidth = function(accounts){
            $timeout(function(){
                var accountWidth = angular.element('.account').width();
                $scope.accountsWidth = accounts.length * accountWidth + 'px';
            })
        }

        // Use total number of Records or Page Size
        // If a large number of items.

        setAccWidth($scope.myAccounts);

        $scope.getAccounts = function () {

            console.log("ACCOUNT-CONTROLLER CLUBS Called " + $scope.myAccounts.length + "Loading " + $scope.loading + "Scroll " + $scope.bAccScrollDisabled)

            if ($scope.loading) {
                return;
            }

            $scope.loading = true;

            //-------------------------------------------------------------------------------
            // Get Accounts based on Viewer Roles
            //------------------------------------------------------------------------------

            ViewerService.getAccounts($rootScope.user.externalId).then(function (data) {
                $scope.loading = false;
                $scope.bAccScrollDisabled = true;
                var cacheCount;
                for (var i in data) {
                    $scope.myAccounts.push(data[i].account);
                    cacheCount = AccountService.addCache(data[i].account);
                }
                setAccWidth($scope.myAccounts);
            }, function (error) {
                console.log(error);
                return;
            });


        }
    }

})();
