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

    function netTileController($scope, $rootScope, $http, $state, RouteHelpers, $modal, $log, APP_APIS, TileService, ViewerService, AuthService) {      

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
                  $scope.netTiles = TileService.cacheNetTiles();
              }
              return;
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

      AuthService.getUser().then(function(user){
        ViewerService.getNets(user.externalId).then(function(nets){
          $scope.nets = nets;
          for (var i in $scope.nets){
            if( $scope.nets[i].externalId == netId ){
              $scope.netName = $scope.nets[i].name;
            }
          }
        }, function(error){
          console.log(error);
          return;
        });
      }, function(error){
        console.log(error);
        return;
      });
    }
})();