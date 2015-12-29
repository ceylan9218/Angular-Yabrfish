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

            var tileCache = {"cacheSize" : 0, "page" : 0, "pageSize" : 6, "totalPages" : 0, "totalItems" : 0, tiles:[]};
			var eventCache = {"cacheSize" : 0, "page" : 0, "pageSize" : 6, "totalPages" : 0, "totalItems" : 0, events:[]};
			var currTile = [];

			//--------------------------------------------------------------------------------------------
			// Process Response and cache tiles from Recommendations Service
			//--------------------------------------------------------------------------------------------

			var cacheReco = function(response) {

				var reco = [];

				reco = response.data.recommendations;

				for (var i in reco) {

					//Get and change lowercase Tile Type.
					reco[i].tileType = reco[i].tileType.toLowerCase();

					// Get Time Difference
					reco[i].publishedDate = getTimeDiff(reco[i].publishedDate);

					//-------------------------------------------------------------//
					// Add Tiles to Cache Not being used in this Current Version
					//  Controller is building Cache as well
					//------------------------------------------------------------//
					tileCache.tiles[tileCache.cacheSize++] = reco[i];

				}

				return reco;

			};

			var cacheEvents = function(externalId, response) {

				var events = [];
				var eventSize = eventCache.events.length;

				events = response.data.eventList;

				for (var i in events) {
                    eventCache.events.unshift(events[i])
                    eventCache.cacheSize++;
               }

                if (currTile.externalId == externalId) {
                    currTile.events = eventCache.events;
                }

            }

			var getTimeDiff = function(date){

                //--------------------------------------------------------------------------------------------
                // Time Difference from Now to Creation Date
                //--------------------------------------------------------------------------------------------

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

				cacheSize : function () { return tileCache.cacheSize },

				totalElements: tileCache.totalItems,

				currPage: function () { return tileCache.page },

				totalPages: function () { return tileCache.totalPages },

				cacheTiles: function () { return tileCache.tiles},

                currTile: function(externalId) {

                    //-----------------------------------------------------------------------//
                    // Select Current Tile from Cache and set it to currTile Object
                    //----------------------------------------------------------------------//

                    for ( var i in tileCache.tiles ) {
                        if ( tileCache.tiles[i].externalId == externalId ) {
                            currTile = tileCache.tiles[i];
                            return currTile;
                        }
                    }

                    // Empty Tile
                    return [];
            },

                getRadar: function(viewerId){

                        console.log("SERVICE Page " + tileCache.page + " count " + tileCache.totalPages + " total " + tileCache.cacheSize);

                        var deferred = $q.defer();

                        if ( tileCache.page !=0 && tileCache.page  >= tileCache.totalPages ) {
                            // Resolve the deferred $q object before returning the promise
                            deferred.resolve([]);
                            return deferred.promise;
                        }

                        var promise = $http.get(APP_APIS['reco']+'/recommendations?page='+tileCache.page+'&size='+tileCache.pageSize)
                            .then(function(response){

                                if ( tileCache.page == 0 ) {
                                    //---------------------------------------------//
                                    //Check Total Number of Pages in the Response //
                                    //---------------------------------------------//
                                    tileCache.totalItems = response.data.totalElements;
                                    tileCache.totalPages = response.data.totalPages;
                                }

                                var reco = cacheReco(response);
                                tileCache.page++;

                                console.log("SERVICE THEN count " + tileCache.totalItems + " total " + tileCache.totalItems);

                                deferred.resolve(reco);
                            });

                        return deferred.promise;
                },

                getTileEvents: function(externalId) {

                        //--------------------------------------------------------------------------
                        // Get List of Events from Tile Service.
                        //--------------------------------------------------------------------------

                       var deferred = $q.defer();

                        if ( eventCache.page !=0 && eventCache.page  >= eventCache.totalPages ) {
                            // Resolve the deferred $q object before returning the promise
                            deferred.resolve([]);
                            return deferred.promise;
                        }

                        var promise = $http.get(APP_APIS['tile']+'/tiles/'+ externalId +'/events?page='+eventCache.page+'&size='+eventCache.pageSize)
                            .then(function(response){

                                if ( eventCache.page == 0 ) {
                                    //---------------------------------------------//
                                    //Check Total Number of Pages in the Response //
                                    //---------------------------------------------//
                                    eventCache.totalItems = response.data.totalElements;
                                    eventCache.totalPages = response.data.totalPages;
                                }

                                var events = cacheEvents(externalId, response);
                                eventCache.page++;
                                deferred.resolve(response);
                            });

                        return deferred.promise;
                    },

                moreRadar: function() {

                    return  ( ( tileCache.cacheSize < tileCache.totalItems ) || tileCache.page == 0 )

                },

                moreEvents: function() {

                    return ( ( eventCache.cacheSize < eventCache.totalItems ) ||  eventCache.page == 0  )
                }

        }
    }

 })();