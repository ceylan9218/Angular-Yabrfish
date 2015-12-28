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
			var cacheSize = 0;
			var currPage = 0;
			var pageItems = 2;
			//------------------------------------------------
			// Initialize Page Parameters of REST Call
			//------------------------------------------------
			var totalElements = -1;
			var totalPages = -1;

			//--------------------------------------------------------------------------------------------
			// Process Response and cache tiles from Recommendations Service
			//--------------------------------------------------------------------------------------------

			var cacheReco = function(pageNumber, pageSize, response) {

				var reco = [];

				reco = response.data.recommendations;

				for (var i in reco) {

					// Add Empty Events Object.
					reco[i].events = [];

					//Get and change lowercase Tile Type.
					reco[i].tileType = reco[i].tileType.toLowerCase();

					// Get Time Difference
					reco[i].publishedDate = getTimeDiff(reco[i].publishedDate);

					//-------------------------------------------------------------//
					// Add Tiles to Cache
					//------------------------------------------------------------//
					cacheTile[cacheSize++] = reco[i];

				}

				return reco;

			};

			//--------------------------------------------------------------------------------------------
			// Time Difference form Now to Creation Date
			//--------------------------------------------------------------------------------------------

			var getTimeDiff = function(date){
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
			};


		return {

				//--------------------------------------------------------------------------------------------
				// Get Recommendations for Radar Screen in the Future we wil use the Viewer ID to Personalise
				//
				// "page": 0,
				// "size": 2,
				//--------------------------------------------------------------------------------------------

				cacheSize : function() {
					return cacheSize;
				},

				totalElements : function() {
					return totalElements;
				},

				getRadar: function(viewerId){

					var deferred = $q.defer();

					if ( cacheSize == totalElements ) {
						// Resolve the deferred $q object before returning the promise
						deferred.resolve(cacheTile);
						return deferred.promise;
					}

					var promise = $http.get(APP_APIS['reco']+'/recommendations?page='+currPage+'&size='+pageItems)
						.then(function(response){

							if ( currPage == 0 ) {
								//---------------------------------------------//
								//Check Total Number of Pages in the Response //
								//---------------------------------------------//
								totalElements = response.data.totalElements;
								totalPages = response.data.totalPages;
							}

							var reco = cacheReco(currPage,pageItems,response);
							currPage++;

							deferred.resolve(reco);
						});

					return deferred.promise;
				},

				//--------------------------------------------------------------------------
				// Get List of Events from Tile Service.
				//--------------------------------------------------------------------------
				getTileEvents: function(externalId) {

					var deferred = $q.defer();

					var promise = $http.get(APP_APIS['tile']+'/tiles/'+ externalId +'/events')
						.then(function(response){
							var reco = cacheReco(response);
							deferred.resolve(reco);
						});

					return deferred.promise;
				}
        	}
        }
})();