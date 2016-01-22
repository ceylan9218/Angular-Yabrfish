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

        $scope.bRadarScrollDisabled = false;
        $scope.loading = false;
        $scope.pageToken='RADAR'+ new Date().getTime();

        $scope.basepath = RouteHelpers.basepath;
        $scope.tiles = TileService.cacheTiles();

        $scope.loadBanner = function(){
          // Counting Loads Of Banner
          TileService.loadCache($scope.pageToken);
          // Get Banner Image
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

            console.log("Get Tiles Called " + $scope.tiles.length + "Loading " + $scope.loading + "Scroll "+ $scope.bRadarScrollDisabled)

            if ( $scope.loading ) {
                return;
            }

            $scope.loading = true;

            if ( ! TileService.moreRadar() ) {
                $scope.loading = false;
                $scope.bRadarScrollDisabled = true;
            } else {
                TileService.getRadar($rootScope.user.externalId).then(function (radar) {
                    $scope.tiles = TileService.cacheTiles();
                    $scope.loading = false;
                    //----------------------------------------------------------------//
                    // Disable Radar Scrolling as we have now filled the Cache
                    //---------------------------------------------------------------//
                    if ( ! TileService.moreRadar() ) {
                        $scope.bRadarScrollDisabled = true;
                    }
                }, function (error) {
                    console.log(error);
                    return;
                })
            }
        }

        $rootScope.$on('currTile', function(event, data){
            var currTileId = data.externalId;
            $scope.tiles.forEach(function(tile){
                if(tile.externalId != currTileId) {
                    tile.addToNet = false;
                }
            });
        })

        $scope.$on('youtubeVideo', function(event, tileId, videoType){
console.log(tileId);
            var currTileId = tileId;
            $rootScope.youtubePlay = [];

            $scope.tiles.forEach(function(tile){
                if(videoType == 'bitmovin'){
                    $rootScope.youtubePlay[tile.externalId] = false;
                }else{
                    if(tile.externalId != currTileId) {
                        $rootScope.youtubePlay[tile.externalId] = false;
                    }else{
                        $rootScope.youtubePlay[tile.externalId] = true;                    
                    }
                }
            });
        })
    }

})();