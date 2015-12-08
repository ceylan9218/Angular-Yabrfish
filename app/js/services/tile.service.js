/**=========================================================
 * Module: TileService.
 * Description: Service for a tile's elements
 * Author: Ryan - 2015.12.7
 =========================================================*/
 (function() {
    'use strict';
    
    angular
        .module('app.tile', [])
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
        })
        .service('TileService', TileService);

        function TileService(){
        	return {
        		getTimeDiff: function(date){
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
        }
})();