/**=========================================================
 * Module: clubController
 * Description: Controller for Club item in Profile menu.
 * Author: Marcin - 2015-11-19
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.profile-accounts', ['ngAnimate', 'ui.bootstrap'])
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
                },
                templateUrl: 'app/views/partials/acc-item.html'
            };
        });

    function accController($rootScope, $scope, ViewerService, AccountService, $timeout) {

        $scope.myAccounts = [];
        $scope.loading = false;
        $scope.bAccountScrollDisabled = false;
        $scope.accountsWidth = 0;


        var setAccWidth = function(accounts){
            $timeout(function(){
                var accountWidth = angular.element('.panel-item').width();
                $scope.accountsWidth = accounts.length * accountWidth + 'px';
            })
        }

        // Use total number of Records or Page Size
        // If a large number of items.

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
                $scope.bAccountScrollDisabled = true;
                var cacheCount;
                for (var i in data) {
                    $scope.myAccounts.push(data[i].account);
                    cacheCount = AccountService.addCache(data[i].account);
                }
                
                // Not sure of this Functionality
                setAccWidth($scope.myAccounts);
            }, function (error) {
                console.log(error);
                return;
            });


        }
    }

})();
