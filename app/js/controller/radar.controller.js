/**=========================================================
 * Module: recommendationController
 * Description: Controller for Radar page
 * Author: Ryan - 2015.9.21
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.recommendations', ["ngSanitize", "com.2fdevs.videogular", "com.2fdevs.videogular.plugins.controls", "info.vietnamcode.nampnq.videogular.plugins.youtube", 'ngMap', 'flash', 'ngAnimate', 'infinite-scroll'])
        .directive('sycovideo', function(){
            return {
              restrict: 'E',
              template: '<div id="{{id}}" class="player"></div>',
              scope: {
                hls_source: "=hls",
                id: "=id"
              },
              link: function(scope, elm, attr) {
                scope.$on('linkChanged', function(event, val, id) {
                  if(scope.id == id) {
                    angular.element('.player').each(function(){
                      var vid = angular.element(this).attr('id');
                      bitdash(vid).destroy();                      
                    });
                    if(val) {
                      var conf = {
                          key:       '9dfc435e221ba94fd0cdbacda4c656cf',
                          playback: {
                            autoplay : true
                          },
                          source: {
                            hls: val,
                          },
                          events: {
                            onReady : function(data) {
                            }                          
                          }
                      };
                      bitdash(scope.id).setup(conf);
                    }
                  }
                });
              }
            }
        })
        .controller('recommendationController', recommendationController);

    function recommendationController($rootScope, $scope, $http, $sce, $location, RouteHelpers, $timeout, $q,
                                            Flash, APP_APIS, TileService, LookupService) {

        $scope.basepath = RouteHelpers.basepath;
        $scope.tiles = [];
        $scope.totalTiles = [];
        $scope.showVideo = false;
        $scope.hideImg = false;
        $scope.filter = {
          feeds : ''
        };
        $scope.monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        $rootScope.youtubePlay = false;

        var tileCountPerPage = 6;

        var radarPromise =
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

        //----------------------------------------
        // Get Radar Tiles from Recommendation
        //----------------------------------------
        $scope.getRadar = function() {
            TileService.getRadar($rootScope.user.externalId).then(function(radar){
                $scope.tiles = radar;
            }, function(error){
                console.log(error);
                return;
            })
        }

        //-----------------------------------------------------------
        // Need to utilise the Paging from the Recommendation API
        //-----------------------------------------------------------

        $scope.radarPage = function() {

            var currentCount = $scope.tiles.length;
            //currentCount = TileService.cacheSize;

            if(currentCount > 0)
                $scope.loading = true;

            if( currentCount > 0 && currentCount < $scope.totalTiles.length ){
                $timeout(function(){
                    $scope.loading = false;
                    for(var i = 0; i < tileCountPerPage; i++){
                        if($scope.totalTiles[currentCount + i])
                        $scope.tiles[currentCount + i] = $scope.totalTiles[currentCount + i];
                }
                }, 2000);
            }else{
                $scope.loading = false;
            }
        }
    }

})();