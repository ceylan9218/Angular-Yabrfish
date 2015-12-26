/**=========================================================
 * Module: TileService.
 * Description: Service for a tile's elements
 * Author: Ryan - 2015.12.7
 =========================================================*/
 (function() {
    'use strict';
    
    angular
        .module('app.tile', [])        
        .service('TileService', TileService);

        function TileService($http, $q, APP_APIS){

			var cacheTile = [];
			var currPage = 0;

			return {

				//--------------------------------------------------------------------------------------------
				// Get Recommendations for Radar Screen in the Future we wil use tghe Viewer ID to Personalise
				// The response to a specific user.
				// Use Paging Params
				//
				// "pageNumber": 0,
				// "pageSize": 0,
				//--------------------------------------------------------------------------------------------

				getRadar: function(viewerId){
					var deferred = $q.defer();
					$http.get(APP_APIS['reco']+'/recommendations?PageNumber='+currPage+'pageSize=6')
						.success(function(data){
							deferred.resolve(data);
						})
						.error(function(status){
							deferred.resolve(status);
						});

					return deferred.promise;
				},

				//--------------------------------------------------------------------------------------------
				//Time Difference form Now to Creation Date
				//--------------------------------------------------------------------------------------------

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