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

    function clubController($rootScope, $scope, $sce, RouteHelpers, ViewerService, Flash, $timeout) {

        $scope.myClubs = ViewerService.cacheClubs();
        $scope.loading = false;
        $scope.bClubScrollDisabled = false;
        $scope.clubWidth = 0;
        $scope.clubsWidth = 0;

        var setClubsWidth = function(clubs){
            $timeout(function(){
                var clubWidth = angular.element('.club').width();
                $scope.clubWidth = clubWidth;
                $scope.clubsWidth = clubs.length * clubWidth + 'px';
            })
        }
        
        setClubsWidth($scope.myClubs);

        $scope.getClubs = function () {

            console.log("CLUB-CONTROLLER CLUBS Called " + $scope.myClubs.length + "Loading " + $scope.loading + "Scroll " + $scope.bClubScrollDisabled)

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
                    setClubsWidth($scope.myClubs);
                }, function (error) {
                    console.log(error);
                    return;
                })
            }
        }

        $scope.slideClubs = function(dir){
            var columns = 0;
            var content_width = angular.element('.content-wrapper').width();
            
            if( content_width == 1140 ){
                columns = 3;
                var endTranslate = ($scope.myClubs.length - 3) * $scope.clubWidth * -1;
            }
            else if( content_width == 708 ){
                columns = 2;
                var endTranslate = ($scope.myClubs.length - 2) * $scope.clubWidth * -1;
            }
            else if( content_width == 290 ){
                columns = 1;
                var endTranslate = ($scope.myClubs.length - 1) * $scope.clubWidth * -1;
            }
            else{
                columns = 3;
                var endTranslate = ($scope.myClubs.length - 3) * $scope.clubWidth * -1;
            }

            if(!$scope.translate)
                $scope.translate = 0;

            if (dir === 'left') {
                $scope.translate += $scope.clubWidth;
                if($scope.translate <= 0){
                    $scope.transform = "translate("+$scope.translate+"px, 0px)";
                }
                else{
                    $scope.translate = 0;
                }
            } else {
                if($scope.myClubs.length >  columns) {
                    $scope.translate -= $scope.clubWidth;
                    if($scope.translate >= endTranslate){
                        $scope.transform = "translate("+$scope.translate+"px, 0px)";
                    }
                    else{
                        $scope.transform = "translate("+endTranslate+"px, 0px)";
                        $scope.translate = endTranslate;
                    }    
                }
            }
        }
    }

})();
