/**=========================================================
 * Module: myTileController
 * Description: Controller for My Tiles Panel in Profile page.
 * Author: Ryan - 2015.11.20
 =========================================================*/

(function() {
    'use strict';
angular
    .module('app.profile-tiles', ['ngAnimate', 'ui.bootstrap', 'ui.select', 'ngFileUpload', 'stripe.checkout', 'ui.bootstrap.datetimepicker'])
    .directive('tilePanel', function() {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                ownerType: '=',
                ownerId: '='
            },
            controller: 'myTileController',
            templateUrl: 'app/views/partials/tile-panel.html',
            link: function(scope,element, attrs) {                
                
            }
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

    function myTileController($scope, $rootScope, TileService, LookupService, $timeout) {

        $scope.bTileScrollDisabled = false;
        $scope.loading = false;
        $scope.myTiles = TileService.cacheMyTiles($scope.ownerId);
        $scope.tilesWidth = 0;

        $scope.tileTypes = [];

        var setTilesWidth = function(tiles){
            $timeout(function(){
                var tileWidth = angular.element('.panel-item').width();
                $scope.tilesWidth = tiles.length * tileWidth + 'px';
            })
        }

        setTilesWidth($scope.myTiles);

        // Get My Tiles.
        var getTiles = function() {
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
                TileService.getMyTiles($scope.ownerType, $scope.ownerId).then(function (tiles) {
                    $scope.myTiles = TileService.cacheMyTiles($scope.ownerId);
                    $scope.loading = false;
                    $scope.bTileScrollDisabled = true;

                    setTilesWidth($scope.myTiles);
                }, function (error) {
                    console.log(error);
                    return;
                })
            }
        }

        $scope.getTiles = function() {
            getTiles();
        }

        angular.element('.panel-items').bind('scroll', function(evt) {
            if(evt.target.scrollLeft == evt.target.scrollLeftMax){
                getTiles();               
            }
        })      
    }
})();