/**=========================================================
 * recommendationController: Controller for data of Radar page
 * used in Radar page.
 * Author: Ryan - 2015.9.21
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.recommendations', ["ngSanitize", "com.2fdevs.videogular", "com.2fdevs.videogular.plugins.controls", "info.vietnamcode.nampnq.videogular.plugins.youtube", 'ngMap', 'flash', 'ngAnimate', 'infinite-scroll'])
        .controller('recommendationController', recommendationController)
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
        .directive('loading', function () {
            return {
              restrict: 'E',
              replace:true,
              template: '<div class="loading"><img src="http://www.nasa.gov/multimedia/videogallery/ajax-loader.gif" width="20" height="20" />LOADING...</div>',
              link: function (scope, element, attr) {
                  scope.$watch('loading', function (val) {
                      if (val)
                          $(element).show();
                      else
                          $(element).hide();
                  });
              }
            }
        });        

    function recommendationController($rootScope, $scope, $http, $sce, RouteHelpers, $timeout, $q, Flash, APP_APIS) {      
        $scope.basepath = RouteHelpers.basepath;
        $scope.tiles = [];
        $scope.showVideo = false;
        $scope.hideImg = false;
        $scope.filter = {
          feeds : ''
        };
        $scope.monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        $rootScope.youtubePlay = false;

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
            $scope.tiles = resolve.tiles;
            for (var i in $scope.tiles) {
              $scope.tiles[i].events = [];
              var uid = $scope.tiles[i].externalId;         // Tile ExternalId.

              //Get and change lowercase Tile Type.              
              $scope.tiles[i].tileType = $scope.tiles[i].tileType.toLowerCase();

              // Get Time Difference
              $scope.tiles[i].publishedDate = getTimeDiff($scope.tiles[i].publishedDate);

              // Show Google Map
              if(!$scope.tiles[i].location){
                $scope.tiles[i].location = [ {"lat": 51.50013, "lon":-0.126305} ];
              }
              
              var marker, map;               
              $scope.$on('mapInitialized', function(evt, evtMap) {
                  map = evtMap; 
                  marker = map.markers[0]; 
              }); 
              // $scope.centerChanged = function(event) {
              //     $timeout(function() { 
              //         map.panTo(marker.getPosition()); 
              //     }, 100); 
              // } 
              // $scope.click = function(event) {
              //     map.setZoom(8); 
              //     map.setCenter(marker.getPosition());
              // }
            }
        }, function(reject){
          console.log(reject);
        })       

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

            // Get Events if tile type is 'Event'
            if( element.tileType == 'event' ){
              element.event_cals = [];
              element.classes = [];
              element.isRace = true;

              $http.get(APP_APIS['tile']+'/tiles/'+ element.externalId +'/events')
                .success(function(data) {
                  element.events = data.eventList;
                  for(var i in element.events) {
                    var startDate = new Date(element.events[i].startDate);
                    var month = $scope.monthNames[startDate.getMonth()];
                    var date = startDate.getDate();
                    element.event_cals.push({
                      eventId: element.events[i].externalId,
                      month: month,
                      date: date,
                      name: element.events[i].name
                    });
                  }
                  element.eventWidth = angular.element('#tile_'+element.externalId+' .events').width() / 3;
                  element.eventSliderWidth = element.eventWidth * element.event_cals.length;
                  element.showEventSlider = true;

                  // Get Classes for first Event.
                  $http.get(APP_APIS['tile']+'/events/'+ element.events[0].externalId +'/classes')
                    .success(function(data) {
                      element.classes_data = data;

                      if(element.classes_data.length == 0){
                        var message = 'No Classes!';
                        Flash.create('danger', message);
                      }                      
                      
                      for(var i in element.classes_data) {
                        var flag = "http://img.yabrfish.com/cdn/flags/"+element.classes_data[i].classFlag.toLowerCase()+".jpg";
                        element.classes.push({
                          eventId: element.events[0].externalId,
                          classId: element.classes_data[i].externalId,
                          flag: flag,
                          eventName: element.events[0].name,
                          name: element.classes_data[i].name
                        });
                      }
                      element.classWidth = angular.element('.classes').width() / 3;
                      element.classSliderWidth = element.classWidth * element.classes.length;
                      element.showClass = true;
                    });
                });
            }else if(element.tileType == 'offer'){
              $http.get(APP_APIS['tile']+'/tiles/'+ element.externalId +'/offers')
                .success(function(data) {
                  element.offers = data;
                  var curDate = new Date();

                  for(var i in element.offers){
                    element.offers[i].enddate = new Date(element.offers[i].enddate);

                    // Get Diff days between Expired Date and Today.
                    var diff = (element.offers[i].enddate - curDate)/1000;
                    diff = Math.abs(Math.floor(diff));
                    element.offers[i].expire_days = Math.floor(diff/(24*60*60));

                    // Get EndDate.
                    var endDay = element.offers[i].enddate.getDate();
                    var endMonth = element.offers[i].enddate.getMonth() + 1;
                    var endYear = element.offers[i].enddate.getFullYear();

                    if( endDay < 10 ){
                      endDay = '0' + endDay;
                    }
                    if( endMonth < 10 ){
                      endMonth = '0' + endMonth;
                    }
                    element.offers[i].enddate = endDay + '/' + endMonth + '/' + endYear;

                  }
                })
            }
          }
        }

        $scope.slideEvents = function(dir, element){
            var eventWidth = angular.element('.events').width() / 3;
            var endTranslate = (element.event_cals.length - 3) * eventWidth * -1;

            if(!element.translate)
              element.translate = 0;

            if (dir === 'left') {
              element.translate += eventWidth;
              if(element.translate <= 0)
                element.transform = "translate("+element.translate+"px, 0px)";
              else
                element.translate = 0;
            } else {
              if(element.event_cals.length > 3) {
                element.translate -= eventWidth;
                if(element.translate >= endTranslate)
                  element.transform = "translate("+element.translate+"px, 0px)";
                else{
                  element.transform = "translate("+endTranslate+"px, 0px)";
                  element.translate = endTranslate;
                }
              }
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

        $scope.getClasses = function(element, eventId, eventName){
          element.selectedEvent = eventId;

          // Get Classes for Event.
          $http.get(APP_APIS['tile']+'/events/'+ eventId +'/classes')
            .success(function(data) {
              element.classes = [];
              element.classes_data = data;
              
              if(element.classes_data.length == 0){
                var message = 'No Classes!';
                Flash.create('danger', message);
              }
              
              for(var i in element.classes_data) {
                var flag = "http://img.yabrfish.com/cdn/flags/"+element.classes_data[i].classFlag.toLowerCase()+".jpg";
                element.classes.push({
                  eventId: eventId,
                  classId: element.classes_data[i].externalId,
                  flag: flag,
                  eventName: eventName,
                  name: element.classes_data[i].name
                });
              }
            });
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

        $scope.filterFeeds = function() {
        }

        function getTimeDiff(date){
            var curDate = new Date();
            var tilePublishedDate = new Date(date);
            var timeDiff = '';

            if( tilePublishedDate.getFullYear() == curDate.getFullYear() ){
              if(tilePublishedDate.getMonth() == curDate.getMonth()){
                if(tilePublishedDate.getDate() == curDate.getDate()){
                  if(tilePublishedDate.getHours() == curDate.getHours()){
                    if(tilePublishedDate.getMinutes() == curDate.getMinutes()){
                      if(tilePublishedDate.getSeconds() - curDate.getSeconds()){
                        timeDiff = 'now';
                      }else{
                        var secDiff = curDate.getSeconds() - tilePublishedDate.getSeconds();
                        if(secDiff == 1)
                          timeDiff = secDiff + ' second ago';
                        else
                          timeDiff = secDiff + ' seconds ago';
                      }
                    }else{
                      var minDiff = curDate.getMinutes() - tilePublishedDate.getMinutes();
                      if(minDiff == 1)
                        timeDiff = minDiff + ' minute ago';
                      else
                        timeDiff = minDiff + ' minutes ago';
                    }
                  }else{
                    var hoursDiff = curDate.getHours() - tilePublishedDate.getHours();
                    if(hoursDiff == 1)
                      timeDiff = hoursDiff + ' hour ago';
                    else
                      timeDiff = hoursDiff + ' hours ago';
                  }
                }else{
                  var dateDiff = curDate.getDate() - tilePublishedDate.getDate();
                  if(dateDiff == 1)
                    timeDiff = dateDiff + ' day ago';
                  else
                    timeDiff = dateDiff + ' days ago';
                }
              }else{
                var monthDiff = curDate.getMonth() - tilePublishedDate.getMonth();
                if(monthDiff == 1)
                  timeDiff = monthDiff + ' month ago';
                else
                  timeDiff = monthDiff + ' months ago';
              }
            }else{
              var yearDiff = curDate.getFullYear() - tilePublishedDate.getFullYear();
              if(yearDiff == 1)
                timeDiff = yearDiff + ' year ago';
              else
                timeDiff = yearDiff + ' years ago';
            }

            return timeDiff;
        }
    }
})();