/**=========================================================
 * Module: clubController
 * Description: Controller for Club item in Profile menu.
 * Author: Marcin - 2015-11-19
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.profile-clubs', ['ngAnimate', 'ui.bootstrap','flash'])
        .directive('clubPanel', function() {
            return {
                restrict: 'E',
                transclude: true,
                scope: {},
                controller: 'clubController',
                templateUrl: 'app/views/partials/club-panel.html'
            };
        })
        .controller('clubController', clubController)
        .directive('clubItem', function() {
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
                templateUrl: 'app/views/partials/club-item.html'
            };
        });

    function clubController($rootScope, $scope, $sce, RouteHelpers, ViewerService, Flash) {

        $scope.myClubs = [];
        $scope.loading = false;
        $scope.bClubScrollDisabled = false;

        $scope.getClubs = function () {


            console.log("Get Hubs Called " + $scope.myClubs.length + "Loading " + $scope.loading + "Scroll " + $scope.bClubScrollDisabled)

            if ($scope.loading) {
                return;
            }

            $scope.loading = true;

            if (!ViewerService.moreClubs()) {
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
    }

})();
