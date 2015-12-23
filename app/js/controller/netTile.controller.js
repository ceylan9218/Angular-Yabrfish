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
      $scope.tiles = [];
      $scope.netName = '';

      var netId = $state.params.id;

      ViewerService.getTilesByNetId(netId).then(function(tiles){
        $scope.tiles = tiles;
        for ( var i in $scope.tiles ){
          $scope.tiles[i].publishedDate = TileService.getTimeDiff($scope.tiles[i].publishedDate);
          $scope.tiles[i].tileType = $scope.tiles[i].tileType.toLowerCase();
        }
      }, function(error){
        console.log(error);
        return;
      });

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