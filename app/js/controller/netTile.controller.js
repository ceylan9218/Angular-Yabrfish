/**=========================================================
 * netTileController: Controller for a Net Tiles page
 * used in Net Tiles page.
 * Author: Ryan - 2015.10.20
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.net-tiles', ['ngAnimate', 'ui.bootstrap'])
        .controller('netTileController', netTileController);        

    function netTileController($scope, $rootScope, $http, $state, RouteHelpers, $modal, $log, APP_APIS) {
      if(!$rootScope.user)
        return;
      
      $scope.basepath = RouteHelpers.basepath;
      $scope.tiles = [];
      $scope.netName = '';

      var netId = $state.params.id;
      $http.get(APP_APIS['viewer']+'/nets/'+ netId +'/tiles')
        .success(function(data) {
            $scope.tiles = data.tileList;
            for ( var i in data.tileList ){
              $scope.tiles[i].publishedDate = getTimeDiff($scope.tiles[i].publishedDate);
              $scope.tiles[i].tileType = $scope.tiles[i].tileType.toLowerCase();
            }
        });

      $http.get(APP_APIS['viewer']+'/viewers/'+$rootScope.user.externalId+'/nets')
        .success(function(data) {
            $scope.nets = data.viewerNets;
            for (var i in $scope.nets){
              if( $scope.nets[i].externalId == netId ){
                $scope.netName = $scope.nets[i].name;
              }
            }
        });

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