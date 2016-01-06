/**=========================================================
 * Module: radarController
 * Description: Controller for Radar page
 * Author: Ryan - 2015.9.21
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.radar', ["ngSanitize", 'ngAnimate', 'infinite-scroll'])        
        .controller('radarController', radarController);

    function radarController($rootScope, $scope, $http, RouteHelpers, TileService) {

        $scope.inMotion = false;
        $scope.InMotionPage = 0;
        $scope.basepath = RouteHelpers.basepath;
        $scope.tiles = [];

        $scope.loadBanner = function(){
          // Get Banner Image.
          $http.get('http://ab167293.adbutler-boson.com/adserve/;ID=167293;size=1838x227;setID=196632;type=json')
            .success(function(data){
              $scope.bannerId = data.placements.placement_1.banner_id;
              $scope.bannerImg = data.placements.placement_1.image_url;
              $scope.bannerUrl = data.placements.placement_1.redirect_url;
              $scope.alt = data.placements.placement_1.alt_text;
              $scope.target = data.placements.placement_1.target;
            })
        }

        //-----------------------------------------------------------
        // Need to utilise the Paging from the Recommendation API
        //-----------------------------------------------------------

        $scope.getRadar = function() {

            //---------------------------------------------------------//
            // Load Single Page of Tiles
            //--------------------------------------------------------//
            if ( $scope.inMotion || ! TileService.moreRadar() ) {
                //---------------------------------------------------------------
                // Check Cache Size of Controller if navigation has left the View
                //---------------------------------------------------------------
                if ( $scope.tiles.length < TileService.cacheSize()) {
                    $scope.tiles.length = 0;
                    $scope.tiles = TileService.cacheTiles();
                }
                return;
            }

            $scope.inMotion = true;
            $scope.loading = true;

            if ( ! TileService.moreRadar() ) {
                $scope.loading = false;
                $scope.inMotion = true;
            } else {
                TileService.getRadar($rootScope.user.externalId).then(function (radar) {
                    $scope.tiles = TileService.cacheTiles();
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