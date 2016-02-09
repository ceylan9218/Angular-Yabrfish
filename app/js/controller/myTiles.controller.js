/**=========================================================
 * Module: myTileController
 * Description: Controller for My Tiles
 * Author: Ryan - 2015.11.20
 =========================================================*/

(function() {
    'use strict';
angular
    .module('app.profile-tiles', ['ngAnimate', 'ui.bootstrap'])
    .directive('tilePanel', function() {
        return {
            restrict: 'E',
            transclude: true,
            scope: {},
            controller: 'myTileController',
            templateUrl: 'app/views/partials/tile-panel.html'
        };
    })
    .controller('myTileController', myTileController)
    .directive('tileItem', function() {
        return {
            require: '^tilePanel',
            restrict: 'E',
            transclude: true,
            scope: {
                tile: '='
            },
            link: function(scope, element, attrs, myTileController) {

            },
            templateUrl: 'app/views/partials/tile-item.html'
        };
    })

    function myTileController($scope, $rootScope, TileService, $timeout) {

        $scope.bTileScrollDisabled = false;
        $scope.loading = false;
        $scope.myTiles = [];
        $scope.tilesWidth = 0;

        var setTilesWidth = function(tiles){
            $timeout(function(){
                var tileWidth = angular.element('.panel-item').width();
                $scope.tilesWidth = tiles.length * tileWidth + 'px';
            })
        }

        // Get My Tiles.
        $scope.getTiles = function() {

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