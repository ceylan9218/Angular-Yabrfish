/**=========================================================
 * Module: myTileController
 * Description: Controller for My Tiles
 * Author: Ryan - 2015.11.20
 =========================================================*/

(function() {
    'use strict';
angular
    .module('app.profile-tiles', ['ngAnimate', 'ui.bootstrap','flash'])
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
                club: '='
            },
            link: function(scope, element, attrs, clubController) {
//                    clubController.addItem(scope);
            },
            templateUrl: 'app/views/partials/tile-item.html'
        };
    })

    function myTileController($scope, $http, $rootScope, RouteHelpers, APP_APIS, Upload, TileService, ProductService, Flash, AuthService, LookupService) {

      $scope.inMotion = false;
      $scope.loading = false;
      $scope.myTiles = [];
      $scope.basepath = RouteHelpers.basepath;
      $scope.tileTypes = [];
      $scope.tileType = {};
      $scope.newTile = {
        title: '',
        description: '',
        tileType: '',
        accountExternalId: '',
        organizationExternalId: ''
      };
      $scope.accounts = [];
      $scope.account = {};
      $scope.organizations = [];
      $scope.organization = {};
      $scope.diffInstances = 0;
      $scope.enablement = false;
      $scope.enableCreate = true;
      $scope.showNewTile = false;


      if(!$rootScope.user)
        return;

        $scope.getUser = function() {
            AuthService.getUser().then(function(user){
                $rootScope.user = user;
                // Get Current User's Roles
                $http.get(APP_APIS['commerce']+'/viewers/'+$rootScope.user.externalId+'/roles')
                    .success(function(data){
                        for(var i in data){
                            $scope.accounts.push(data[i].account);
                        }
                        $scope.accounts.unshift({
                            name: 'Just For Me'
                        });
                    });
            })
        }


      // Get My Tiles.
      $scope.getTiles = function() {

        //---------------------------------------------------------//
        // Load Single Page of my tiles.
        //--------------------------------------------------------//


        if ( $scope.inMotion || ! TileService.moreMyTiles() ) {

            //---------------------------------------------------------------
            // Check Cache Size of Controller if navigation has left the View
            //---------------------------------------------------------------
            if ( $scope.tiles.length < TileService.cacheMyTilesSize() ) {
                $scope.tiles.length = 0;
                $scope.tiles = TileService.cacheMyTiles();
            }
            return;
        }

        $scope.inMotion = true;
        $scope.loading = true;

        if ( ! TileService.moreMyTiles() ) {
            $scope.loading = false;
            $scope.inMotion = true;
        } else {
            TileService.getMyTiles($rootScope.user.externalId).then(function (tiles) {
                $scope.myTiles = TileService.cacheMyTiles();
                $scope.loading = false;
                $scope.inMotion = false;
            }, function (error) {
                console.log(error);
                return;
            })
        }
      }

    }
})();