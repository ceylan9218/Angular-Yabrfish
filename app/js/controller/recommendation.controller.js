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
        .directive("checkboxGroup", function() {
            return {
                restrict: "A",
                link: function(scope, elem, attrs) {
                    // Determine initial checked boxes
                    if (scope.checkedWeekDays.indexOf(scope.day.id) !== -1) {
                        elem[0].checked = true;
                    }

                    // Update array on click
                    elem.bind('click', function() {
                        var index = scope.checkedWeekDays.indexOf(scope.day.id);
                        // Add if checked
                        if (elem[0].checked) {
                            if (index === -1) scope.checkedWeekDays.push(scope.day.id);
                        }
                        // Remove if unchecked
                        else {
                            if (index !== -1) scope.checkedWeekDays.splice(index, 1);
                        }
                        // Sort and update DOM display
                        scope.$apply(scope.checkedWeekDays.sort(function(a, b) {
                            return a - b
                        }));
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

        var path = $location.path();
        // Enable/Disable Edit Event.
        if(path.indexOf('/app/tiles') != -1)
          $scope.enableEvent = true;
        else
          $scope.enableEvent = false;

        $scope.checkedWeekDays = [1,2];
        var days = $scope.checkedWeekDays.length - 1;

        $scope.weekDays = [{
          "id": 1,
          "value": 'Sat'
        }, {
          "id": 2,
          "value": 'Sun'
        }, {
          "id": 3,
          "value": 'Mon'
        }, {
          "id": 4,
          "value": 'Tue'
        }, {
          "id": 5,
          "value": 'Wed'
        }, {
          "id": 6,
          "value": 'Thu'
        }, {
          "id": 7,
          "value": 'Fri'
        }];

        // Initial Checked boxes
        angular.forEach($scope.weekDays, function (item) {
            angular.forEach($scope.checkedWeekDays, function (day) {
              if(item.id == day){
                item.Selected = true;
              }
            });
        });

        $scope.checkAll = function() {
          if ($scope.events.selectedAll) {
              $scope.events.selectedAll = true;
              $scope.checkedWeekDays = [1,2,3,4,5,6,7];
          } else {
              $scope.events.selectedAll = false;
              $scope.checkedWeekDays = [];
          }
          angular.forEach($scope.weekDays, function (item) {
              item.Selected = $scope.events.selectedAll;
          });
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

            // Get Events if tile type is 'Event'
            if( element.tileType == 'event' ){
              element.event_cals = [];
              element.eventsAry = [];
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
                      name: element.events[i].name,
                      startDate: startDate,
                      endDate: new Date(element.events[i].endDate)
                    });
                  }
                  
                  // If current page is My Tiles page, we will add Add Event button.
                  if($scope.enableEvent)
                    element.event_cals.push('addEvent');

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

        $scope.selectEvent = function(element, event, event_length){
console.log(event);
          element.eventEdit = true;

          if (event == 'addEvent') {
            var eventId = '';
            element.eventName = '';
            element.eventCount = event_length - 1;
            element.startDate = new Date();
            element.endDate = new Date(element.startDate.getTime() + 24 * 60 * 60 * 1000);
          }else{
            var eventId = event.eventId;
            element.eventName = event.name;
            element.eventCount = event_length - 1;
            element.startDate = event.startDate;
            element.endDate = event.endDate;            
          }

          element.selectedEvent = eventId;

          if(!eventId || eventId == '')
            return;

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
                  eventName: element.eventName,
                  name: element.classes_data[i].name
                });
              }
            });
        }

        // Set finish Date when change start Date or check week days.
        $scope.setEndDate = function(element) {
          element.endDate = new Date(element.startDate.getTime() + 24 * 60 * 60 * 1000);
        }

        $scope.checkEvtCount = function(element){
          if(!element.eventCount || eventCount < 0){
            Flash.create('danger', 'Please input positive number!');
            return;
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

        /*-------------------------------------Add / Save Event - Ryan(12.15)--------------------------------------------*/
         // Get Event Tile Type
        LookupService.getEventTypes().then(function(eventtypes){
          $scope.eventtypes = eventtypes;
        }, function(error){
          console.log(error);
          return;
        })
       
        $scope.open = {
          startDate: false,
          finishDate: false
        };
        
        // Disable weekend selection
        $scope.disabled = function(date, mode) {
          return (mode === 'day' && (new Date().toDateString() == date.toDateString()));
        };

        $scope.dateOptions = {
          showWeeks: false,
          startingDay: 1
        };
        
        $scope.timeOptions = {
          readonlyInput: false,
          showMeridian: false
        };
        
        $scope.dateModeOptions = {
          minMode: 'year',
          maxMode: 'year'
        };
        
        $scope.openCalendar = function(e, date) {
            $scope.open[date] = true;
        };

        $scope.events = {
          name: '',
          count: 1,
          selectedAll: false,
          eventsAry: []
        };
        $scope.eventStep = 1;
             
        // Click Next button of Event.
        var tempStartDate = '';    
        $scope.addEvent = function(element) {
          if(element.eventStep >= element.eventCount)
            return;

          if(tempStartDate == element.startDate){
            Flash.create('danger', 'Please select different start date.');
            return;
          }

          tempStartDate = element.startDate;
          element.startDate = new Date(element.startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

          element.eventName = element.eventName.replace(element.eventStep, '');
          element.eventName = element.eventName + parseInt(element.eventStep + 1);

          element.eventsAry.push({
            id: element.eventStep,
            name: element.eventName,
            startDate: element.startDate,
            finishDate: element.endDate
          })

          element.eventStep++;
        }

        // Click Prev button of Event.
        $scope.popEvent = function(element) {
          if(element.eventStep <= 1)
            return;
          
          tempStartDate = '';
          element.startDate = new Date(element.startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          element.eventsAry.pop();
          element.eventStep--;
        }

        // Click Skip Date button of Event.
        $scope.skipDate = function(element) {
          element.startDate = new Date(element.startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  //        $scope.dates.finishDate = new Date($scope.dates.startDate.getTime() + 24 * 60 * 60 * 1000);
        }

        $scope.save = function(element) {
          Flash.create('success', 'Successfully saved.');
        }
        /*-------------------------------------Add / Save Event End--------------------------------------------*/
    }
})();