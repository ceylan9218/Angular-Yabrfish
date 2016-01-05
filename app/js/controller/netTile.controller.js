/**=========================================================
 * Module: netTileController
 * Description: Controller for a Net Tiles page
 * Author: Ryan - 2015.10.20
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.net-tiles', ['ngAnimate', 'ui.bootstrap'])
        .controller('netTileController', netTileController);        

    function netTileController($scope, $rootScope, $state, RouteHelpers, $modal, $log,  TileService, ViewerService, AuthService) {

        $scope.basepath = RouteHelpers.basepath;
        $scope.netTiles = [];
        $scope.netName = '';
        $scope.loading = false;
        $scope.inMotion = false;

        var netId = $state.params.id;

        $scope.getNetTiles = function() {

            if ( $scope.inMotion || ! TileService.moreNetTiles() ) {
                //---------------------------------------------------------------
                // Check Cache Size of Controller if navigation has left the View
                //---------------------------------------------------------------
                if ( $scope.netTiles.length < TileService.cacheNetTileSize() ) {
                    //$scope.netTiles = TileService.cacheNetTiles();
                    TileService.getNetTiles(netId).then(function (netTiles) {
                        $scope.netTiles = TileService.cacheNetTiles();
                        $scope.loading = false;
                        $scope.inMotion = false;
                    }, function (error) {
                        console.log(error);
                        return;
                    })
                    return;
                }
            }

            $scope.inMotion = true;
            $scope.loading = true;

            if ( ! TileService.moreNetTiles() ) {
                $scope.loading = false;
                $scope.inMotion = true;
            } else {
                TileService.getNetTiles(netId).then(function (netTiles) {
                    $scope.netTiles = TileService.cacheNetTiles();
                    $scope.loading = false;
                    $scope.inMotion = false;
                }, function (error) {
                    console.log(error);
                    return;
                })
            }
        }

        $scope.getNetInfo = function() {
          $scope.cacheNets = ViewerService.cacheNets();
          for (var i in $scope.cacheNets){
              if( $scope.cacheNets[i].externalId == netId ){
                  $scope.netName = $scope.cacheNets[i].name;
              }
          }   
        }
    }

})();