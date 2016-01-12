/**=========================================================
 * Module: marketController
 * Description: Controller for Market page
 * Author: Ryan - 2015.9.21
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.market', ["ngSanitize", 'ngAnimate', 'infinite-scroll'])
        .controller('marketController', marketController);

    function marketController($rootScope, $scope, $http, RouteHelpers, TileService, LookupService) {

        $scope.inMotion = false;
        $scope.InMotionPage = 0;
        $scope.basepath = RouteHelpers.basepath;
        $scope.tiles = [];
        $scope.tagTypes = [];
        $scope.tags = [];
        $scope.filterTags = [];
        $scope.searchToken = '';
        $scope.cacheFilterTags = [];
        $scope.tileTypes = ['OFFER','SALE', 'SWAP']
        $scope.bMarketScrollDisabled = false;

            $scope.getTiles = function(tags){

                //--------------------------------------------------------------
                // Infinite Scroll Function
                //-------------------------------------------------------------

                getMarketTiles($scope.searchToken, tags, $scope.tileTypes);

            }


            var getMarketTiles = function(cacheId, tileTags, tileTypes){

                if ( TileService.trimSearch($scope.searchToken,tileTags) == 0 ) {
                    $scope.searchToken = 'MARKET' + new Date().getTime();
                    $scope.bMarketScrollDisabled = false;
                } else {
                    $scope.tiles = TileService.cacheSearchTiles();
                    $scope.bMarketScrollDisabled = true;
                    return;
                }

                if ( $scope.inMotion || ! TileService.moreSearch() ) {
                    //---------------------------------------------------------------
                    // Check Cache Size of Controller if navigation has left the View
                    //---------------------------------------------------------------
                    if ( $scope.tiles.length <= TileService.cacheSearchSize()) {
                        $scope.tiles.length = 0;
                        $scope.tiles = TileService.cacheSearchTiles();
                        // Disable Infinite Scroll as we are at end of Cache.
                        $scope.bMarketScrollDisabled = true;
                    }
                    return;
                }

                $scope.inMotion = true;
                $scope.loading = true;

                if ( ! TileService.moreSearch() ) {
                    $scope.loading = false;
                    $scope.inMotion = true;
                } else {
                    TileService.getSearchTiles($scope.searchToken,tileTags,"",tileTypes).then(function (data) {
                        console.log(data);
                        $scope.tiles = data;
                        //$scope.tiles = TileService.cacheSearchTiles();
                        $scope.loading = false;
                        $scope.inMotion = false;
                    }, function (error) {
                        console.log(error);
                        return;
                    })
                }
            }


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

            // Get Tag types.
            LookupService.getTagTypes().then(function(data){
              $scope.tagTypes = data;
              for(var i in $scope.tagTypes){
                $scope.tagTypes[i].shortCode = $scope.tagTypes[i].shortCode.toLowerCase();
              }
            }, function(error){
              console.log(error);
              return;
            })

            // Get tags by type.
            $scope.getTags = function(type){
              LookupService.getTags(type).then(function(data){
                $scope.tags[type] = data;
              }, function(error){
                console.log(error);
                return;
              })
            }

            // Add filter tag.
            var chkTag = function(tag) {
                if($scope.filterTags.indexOf(tag) < 0){
                    $scope.filterTags.push(tag);
                    getMarketTiles($scope.searchToken, $scope.filterTags, $scope.tileTypes);
                }
            }

        // Remove filter tag.
        var unChkTag = function(tag) {

            //----------------------------------------------------------
            // Remove from User Experience
            //----------------------------------------------------------
            for(var i in $scope.tagTypes){
                var type = $scope.tagTypes[i].shortCode;

                for(var i in $scope.tags[type]){
                  if(tag == $scope.tags[type][i]){
                    $scope.tags[type][i].selected = false;
                    break;
                  }
                }
            }

            if($scope.filterTags.indexOf(tag) > -1){
                $scope.filterTags.splice($scope.filterTags.indexOf(tag), 1);
            }

            getMarketTiles($scope.searchToken, $scope.filterTags, $scope.tileTypes);

        }

        // Add filter tags.
        $scope.checkTag = function(tag){
            if(tag.selected){
              chkTag(tag);
            }else{
              unChkTag(tag);
            }          
        }

        // Remove Tags
        $scope.removeTag = function(tag){
            unChkTag(tag);
        }
    }

})();