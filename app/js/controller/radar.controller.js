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

        $scope.inMotion = false;
        $scope.InMotionPage = 0;
        $scope.basepath = RouteHelpers.basepath;
        $scope.tiles = [];
        $scope.CurrTile = [];
        $scope.totalTiles = [];
        $scope.showVideo = false;
        $scope.hideImg = false;
        $scope.filter = {
          feeds : ''
        };
        $scope.monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        $rootScope.youtubePlay = false;


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


        //-------------------------------------------------------------------------------
        // Test harness
        //-------------------------------------------------------------------------------
        $scope.test = function(){
            $scope.currTile = TileService.currTile('28650A0A-071A-44C2-BE43-7C5A517B9B39');

            console.log ("Events More " + TileService.moreEvents())
            if ( TileService.moreEvents() ) {
                TileService.getTileEvents('28650A0A-071A-44C2-BE43-7C5A517B9B39').then(function (events) {
                    $scope.currTile = TileService.currTile('28650A0A-071A-44C2-BE43-7C5A517B9B39');
                }, function (error) {
                    console.log(error);
                    return;
                })
            }

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
                if ( $scope.tiles.length < TileService.cacheSize() ) {
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