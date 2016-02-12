/**=========================================================
 * Module: myTileController
 * Description: Controller for My Tiles
 * Author: Ryan - 2015.11.20
 =========================================================*/

(function() {
    'use strict';
angular
    .module('app.profile-classes', ['ngAnimate', 'ui.bootstrap'])
    .directive('classesPanel', function() {
        return {
            restrict: 'E',
            transclude: true,
            scope: {},
            controller: 'classesController',
            templateUrl: 'app/views/partials/tile-panel.html'
        };
    })
    .controller('classesController', classesController)
    .directive('classesItem', function() {
        return {
            require: '^classesPanel',
            restrict: 'E',
            transclude: true,
            scope: {
                tile: '='
            },
            link: function(scope, element, attrs, classesController) {

            },
            templateUrl: 'app/views/partials/tile-item.html'
        };
    })

    function classesController($scope, $rootScope, TileService, $timeout) {

        $scope.bTileScrollDisabled = false;
        $scope.loading = false;
        $scope.myTiles = [];
        $scope.tilesWidth = 0;

        var setClassesWidth = function(classes){
            $timeout(function(){
                var panelWidth = angular.element('.panel-item').width();
                $scope.panelWidth = classes.length * panelWidth + 'px';
            })
        }

        // Get My Tiles.
        $scope.getClasses = function() {

            //---------------------------------------------------------//
            // Load Single Page of my tiles.
            //--------------------------------------------------------//

            if ($scope.loading) {
                return;
            }

            $scope.loading = true;

            if ( ! TileService.moreMyTiles() ) {
                $scope.loading = false;
                $scope.bTileScrollDisabled = true;
            } else {
                TileService.getMyTiles($rootScope.user.externalId).then(function (tiles) {
                    $scope.myTiles = TileService.cacheMyTiles();
                    $scope.loading = false;
                    $scope.bTileScrollDisabled = true;

                    setTilesWidth($scope.myTiles);
                }, function (error) {
                    console.log(error);
                    return;
                })
            }
        }

    }
})();