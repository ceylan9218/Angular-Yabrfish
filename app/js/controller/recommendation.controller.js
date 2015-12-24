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

    function recommendationController($rootScope, $scope, $http, $sce, $location, RouteHelpers, $timeout, $q, Flash, APP_APIS, TileService, LookupService) {
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

        $scope.getRecommendations = function(){
          var deferred = $q.defer();

          $http.get(APP_APIS['reco']+'/recommendations')
            .success(function(data){
              deferred.resolve({
                tiles: data.recommendations
              })              
            }).error(function(data, status){
              deferred.reject('ERROR');              
            })

            //return the promise
            return deferred.promise;           
        }

        var recommendations = $scope.getRecommendations();
        recommendations.then(function(resolve){
            $scope.totalTiles = resolve.tiles;
            for (var i in $scope.totalTiles) {
              $scope.totalTiles[i].events = [];

              //Get and change lowercase Tile Type.              
              $scope.totalTiles[i].tileType = $scope.totalTiles[i].tileType.toLowerCase();

              // Get Time Difference
              $scope.totalTiles[i].publishedDate = TileService.getTimeDiff($scope.totalTiles[i].publishedDate);

              if( i < tileCountPerPage ){
                $scope.tiles[i] = $scope.totalTiles[i];
              }
            }
        }, function(reject){
          console.log(reject);
        })       

        $scope.loadMore = function() {
          var currentCount = $scope.tiles.length;
          
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
          }
          else{
            element.extendWrap = true;
          }
        }

        $scope.slideClasses = function(dir, element){
            var classWidth = angular.element('.classes').width() / 3;
            var endTranslate = (element.classes.length - 3) * classWidth * -1;

            if(!element.classTranslate)
              element.classTranslate = 0;

            if (dir === 'left') {
              element.classTranslate += classWidth;
              if(element.classTranslate <= 0)
                element.classTransform = "translate("+element.classTranslate+"px, 0px)";
              else
                element.classTranslate = 0;
            } else {
              if(element.classes.length > 3){
                element.classTranslate -= classWidth;
                if(element.classTranslate >= endTranslate)
                  element.classTransform = "translate("+element.classTranslate+"px, 0px)";
                else{
                  element.classTransform = "translate("+endTranslate+"px, 0px)";
                  element.classTranslate = endTranslate;
                }
              }
            }
        }

        $scope.getRaces = function(element, classElm){
          element.selectedClass = classElm;
          element.eventName = classElm.eventName;
          element.className = classElm.name;

          var eventId = classElm.eventId;
          var classId = classElm.classId;
          element.races = [];

          // Get Races for a class
          $http.get(APP_APIS['tile']+'/events/'+ eventId +'/classes/'+classId+'/races')
            .success(function(data){
              element.races = data;
              
              if(element.races.length == 0){
                element.isRace = true;
                element.showRaces = false;
                var message = 'No Races!';
                Flash.create('danger', message);
              }else{
                element.isRace = false;
              }

              for(var i in element.races){
                // Get Date of Race
                var race_date = new Date(element.races[i].startdate);
                var race_day = race_date.getDate();
                if(race_day>3 && race_day<21){
                  race_day = race_day + 'th';
                }else{
                  switch (race_day % 10) {
                      case 1:  race_day = race_day + "st";
                      case 2:  race_day = race_day + "nd";
                      case 3:  race_day = race_day + "rd";
                      default: race_day = race_day + "th";
                  }
                }
                var race_month = $scope.monthNames[race_date.getMonth()];
                var race_hours = race_date.getHours();
                var race_min = race_date.getMinutes();
                element.races[i].race_date = race_day + " " + race_month + " " + race_hours + ":" + race_min;

                // Set Event ID and Class ID to Races.
                element.races[i].eventId = eventId;
                element.races[i].classId = classId;
              }
            });
        }

        $scope.getResult = function(race){
          if(race.showResult)
            race.showResult = false;
          else{
            race.showResult = true;
            
            var eventId = race.eventId;
            var classId = race.classId;
            var raceId = race.externalId;

            $http.get(APP_APIS['tile']+'/events/'+eventId+'/classes/'+classId+'/races/'+raceId+'/results')
              .success(function(data){
                race.results = data;

                if(race.results.length == 0){
                  var message = 'No Results!';
                  Flash.create('danger', message);
                }
                
                for(var i in race.results){
                  if(isNaN(race.results[i].positionDesc))
                    race.results[i].positionDesc = "DNC";

                  // Get finishCorrected
                  if(race.results[i].finishCorrected)
                    race.results[i].finishCorrected = race.results[i].finishCorrected.split('.')[0].split(':');
                }
              })
          }
        }
    }
})();