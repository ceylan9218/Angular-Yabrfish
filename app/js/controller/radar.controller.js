/**=========================================================
 * Module: radarController
 * Description: Controller for Radar page
 * Author: Ryan - 2015.9.21
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.radar', ["ngSanitize", "com.2fdevs.videogular", "com.2fdevs.videogular.plugins.controls", "info.vietnamcode.nampnq.videogular.plugins.youtube", 'ngMap', 'ngAnimate', 'infinite-scroll'])
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
        .controller('radarController', radarController);

    function radarController($rootScope, $scope, $http, $sce, RouteHelpers, APP_APIS, TileService) {

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

        $scope.getVideoList = function(element){
          var uid = element.externalId;
          $scope.loading = true;
          element.videoList = [];
          element.videoTitles = [];
          element.videoImages = [];
          element.videoType = '';
          element.youtube = {
            config: {}
          }

          var video_list = angular.element("#tile_"+element.externalId+ " .video-list");
          if(video_list[0])
            video_list[0].style.display = 'block';

          $http.get(APP_APIS['tile']+'/tiles/' + uid + '/content')
            .success(function(data){
                if(data.contentList && data.contentList.length>0){
                  element.videoType = data.contentList[0].externalRefs[0].providerCode.toLowerCase();
                  if(element.videoType == 'youtube'){
                    element.vid = data.contentList[0].externalRefs[0].externalContentId;
                    for( var i in data.contentList ){                      
                      element.videoTitles[i] = data.contentList[i].title;
                    }
                  }else if (element.videoType == 'syco') {
                    for( var i = 0; i < data.contentList.length; i++ ){
                      var vid = data.contentList[i].externalRefs[0].externalContentId;
                      $http.get('http://api1.syndicatecontent.com/Sc.Content.Api.External/ScContentExt/inventory/'+vid+'?mediaformatid=9&vendortoken=B9C333B9-54F3-40B6-8C34-7A6512955B98')
                        .success(function(data) {
                            if(data.resources[0].medias[0].hostId){
                              element.videoList.push(data.resources[0].medias[0]);
                            }
                        });
                      element.videoTitles.push(data.contentList[i].title);
                      element.videoImages.push(data.contentList[i].creatives[0].url);
                    }
                  }
                }
                $scope.loading = false;
            })
        }

        $scope.videoPlay = function(element, video) {
          $rootScope.youtubePlay = false;
          if(element.videoType == 'syco'){           
            element.hls_source = video.clientPlayBackUrl + video.url;
            $rootScope.$broadcast( "linkChanged", element.hls_source, element.externalId);
          }

          var tileVideo = angular.element("#tile_"+element.externalId+ " .tileVideo");
          var tileImg = angular.element("#tile_"+element.externalId+ " .tileImg");
          var video_list = angular.element("#tile_"+element.externalId+ " .video-list");
          var ribbon = angular.element("#tile_"+element.externalId+ " .ribbon");

          tileVideo.height(tileImg.height());

          angular.element(".tileImg").css('display', 'inline-block');
          angular.element(".tileVideo").css('display', 'none');
          angular.element(".youtubeVideo-wrap").css('display', 'none');        
          angular.element(".video-list").css('display', 'none');

          tileVideo[0].style.display = 'inline-block';
          tileImg[0].style.display = 'none';
          video_list[0].style.display = 'block';

          if(ribbon[0])
            ribbon[0].style.display = 'none';
        }

        $scope.youtubeVideoPlay = function(element) {
          element.showYoutube = true;
          $rootScope.youtubePlay = true;
          $rootScope.$broadcast( "linkChanged", element.hls_source, element.externalId);

          element.youtube.config = {
            preload: "none",
            autoPlay: true,
            sources: [
                {src: "https://www.youtube.com/watch?v=" + element.vid},
                {src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.webm"), type: "video/webm"},
                {src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.ogg"), type: "video/ogg"}
            ],                      
            theme: {
                url: "http://www.videogular.com/styles/themes/default/latest/videogular.css"
            },
            plugins: {
              controls: {
                autoHide: true,
                autoHideTime: 5000
              }
            }
          };

          var youtubeVideo = angular.element("#tile_"+element.externalId+ " .youtubeVideo-wrap");
          var tileImg = angular.element("#tile_"+element.externalId+ " .tileImg");
          var video_list = angular.element("#tile_"+element.externalId+ " .video-list");
          var ribbon = angular.element("#tile_"+element.externalId+ " .ribbon");
          
          youtubeVideo.height(tileImg.height());
          
          angular.element(".tileImg").css('display', 'inline-block');
          angular.element(".tileVideo").css('display', 'none');
          angular.element(".youtubeVideo-wrap").css('display', 'none');
          angular.element(".video-list").css('display', 'none');

          youtubeVideo[0].style.display = 'inline-block';
          tileImg[0].style.display = 'none';
          video_list[0].style.display = 'block';
          if(ribbon[0])
            ribbon[0].style.display = 'none';
        }

        $scope.hideVideo = function(element) {
          $rootScope.$broadcast( "linkChanged", element.hls_source, element.externalId);
          $rootScope.youtubePlay = false;

          var tileVideo = angular.element("#tile_"+element.externalId+ " .tileVideo");
          var youtubeVideo = angular.element("#tile_"+element.externalId+ " .youtubeVideo-wrap");
          var tileImg = angular.element("#tile_"+element.externalId+ " .tileImg");
          var ribbon = angular.element("#tile_"+element.externalId+ " .ribbon");
          
          tileVideo[0].style.display = 'none';
          youtubeVideo[0].style.display = 'none';
          tileImg[0].style.display = 'inline-block';
          if(ribbon[0])
            ribbon[0].style.display = 'inline-block';
        }

        $scope.extendTile = function(element){
          if(element.extendWrap){
            element.extendWrap = false;
            element.moreImg = 'app/img/more.png';
          }
          else{
            element.extendWrap = true;
            element.moreImg = 'app/img/less.png';
          }
        }

    }

})();