/**=========================================================
 * Module: TileService.
 * Description: Service for a tile's elements
 * Author: Ryan - 2015.12.7
 =========================================================*/
 (function() {
    'use strict';
    
    angular
        .module('app.tileSrv', [])        
        .service('TileService', TileService);

        function TileService($http, $q, APP_APIS){

        	var tileCache = {"cacheId": null, "cacheSize" : 0, "page" : 0, "pageSize" : 6, "totalPages" : 0, "totalItems" : 0, tiles:[]};
        	var eventCache = {"cacheId": null, "cacheSize" : 0, "page" : 0, "pageSize" : 6, "totalPages" : 0, "totalItems" : 0, events:[]};
			var contentCache = {"cacheId": null, "cacheSize" : 0, "page" : 0, "pageSize" : 6, "totalPages" : 0, "totalItems" : 0, content:[]};
			var netTilesCache = {"cacheId": null, "cacheSize" : 0, "page" : 0, "pageSize" : 6, "totalPages" : 0, "totalItems" : 0, tiles:[]};

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
					reco[i].moreImg = 'app/img/more.png';
					//-------------------------------------------------------------//
					// Add Tiles to Cache
					// Controller is building Cache as well
					//------------------------------------------------------------//
					tileCache.tiles[tileCache.cacheSize++] = reco[i];
				}

				return reco;
			};
	
			var cacheNetTiles = function(response) {

                var tiles = [];
                tiles = response.data.tileList;

                for (var i in tiles) {
                    //Get and change lowercase Tile Type.
                    tiles[i].tileType = tiles[i].tileType.toLowerCase();
                    // Get Time Difference
                    tiles[i].publishedDate = getTimeDiff(tiles[i].publishedDate);

                    //-------------------------------------------------------------//
                    // Add Tiles to Cache Not being used in this Current Version
                    //  Controller is building Cache as well
                    //------------------------------------------------------------//
                    netTilesCache.tiles[netTilesCache.cacheSize++] = tiles[i];
                }

                return tiles;
            };

            var cacheEvents = function(externalId, response) {

				var events = [];
				events = response.data.eventList;

				for (var i in events) {
                    eventCache.events.unshift(events[i])
                    eventCache.cacheSize++;
               	}

                if (currTile.externalId == externalId) {
                    currTile.events = eventCache.events;
                }

				return events;

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

                cacheNetTileSize: function() { return netTilesCache.cacheSize },

				totalElements: tileCache.totalItems,

				currPage: function () { return tileCache.page },

				totalPages: function () { return tileCache.totalPages },

				cacheTiles: function () { return tileCache.tiles},

                cacheNetTiles: function () { return netTilesCache.tiles},

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

        		getMonthNames: function(){
        			var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        			return monthNames;
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

                                console.log("RECO THEN count " + tileCache.totalItems + " total " + tileCache.totalItems);

                                deferred.resolve(reco);
                            });

                        return deferred.promise;
                },

				getNetTiles: function(externalId){

					console.log("SERVICE Page " + netTilesCache.page + " count " + netTilesCache.totalPages + " total " + netTilesCache.cacheSize);

					var deferred = $q.defer();

					//------------------------------------------------------------------------//
					// Check we are using the correct Cache and the User has Not Changed the Net
					//------------------------------------------------------------------------//

					if ( netTilesCache.cacheId != externalId ) {
						netTilesCache.cacheId = externalId
						netTilesCache.cacheSize =  0;
						netTilesCache.page = 0;
						netTilesCache.pageSize = 6;
						netTilesCache.totalPages = 0;
						netTilesCache.totalItems = 0;
						if ( netTilesCache.tiles != undefined ) { netTilesCache.tiles.length = 0 };
					}

					if ( netTilesCache.page !=0 && netTilesCache.page  >= netTilesCache.totalPages ) {
						// Resolve the deferred $q object before returning the promise
						deferred.resolve([]);
						return deferred.promise;
					}

					var promise = $http.get(APP_APIS['viewer']+'/nets/'+ externalId +'/tiles?page='+netTilesCache.page+'&size='+netTilesCache.pageSize)
						.then(function(response){

							if ( tileCache.page == 0 ) {
								//---------------------------------------------//
								//Check Total Number of Pages in the Response //
								//---------------------------------------------//
								netTilesCache.totalItems = response.data.totalElements;
								netTilesCache.totalPages = response.data.totalPages;
							}

							var tiles = cacheNetTiles(response);
							netTilesCache.page++;

							console.log("SERVICE THEN count " + netTilesCache.totalItems + " total " + netTilesCache.totalItems);

							deferred.resolve(tiles);
						});

					return deferred.promise;
				},

		        getTileEvents: function(externalId) {

                    //--------------------------------------------------------------------------
                    // Get List of Events from Tile Service.
                    //--------------------------------------------------------------------------

					if ( eventCache.cacheId != externalId ) {
						eventCache.cacheId = externalId
						eventCache.cacheSize =  0;
						eventCache.page = 0;
						eventCache.pageSize = 6;
						eventCache.totalPages = 0;
						eventCache.totalItems = 0;
						if ( eventCache.tiles != undefined ) eventCache.tiles.length = 0;
					}

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
							deferred.resolve(events);
						});

					return deferred.promise;
				},

				getFirstEvent: function(tileId) {

					if ( eventCache.cacheSize > 0 )
					{
						return eventCache.events[0];

					}
					var deferred = $q.defer();
					$http.get(APP_APIS['tile']+'/tiles/'+ tileId +'/events')
						.success(function(response){	
							deferred.resolve(response.eventList[0]);
						})
						.error(function(status){
							deferred.resolve(status);
						})

					return deferred.promise;
				},

				getClasses: function(eventId) {
					var deferred = $q.defer();
					$http.get(APP_APIS['tile']+'/events/'+ eventId +'/classes')
			            .success(function(data) {
							deferred.resolve(data);
			            })
			            .error(function(status){
							deferred.resolve(status);
						});

			        return deferred.promise;
				},

				getRaces: function(eventId, classId){
					var deferred = $q.defer();
					$http.get(APP_APIS['tile']+'/events/'+ eventId +'/classes/'+classId+'/races')
			            .success(function(data) {
							deferred.resolve(data);
			            })
			            .error(function(status){
							deferred.resolve(status);
						});

			        return deferred.promise;					
				},

				getResults: function(eventId, classId, raceId) {
					var deferred = $q.defer();
					$http.get(APP_APIS['tile']+'/events/'+ eventId +'/classes/'+classId+'/races/'+raceId+'/results')
			            .success(function(data) {
							deferred.resolve(data);
			            })
			            .error(function(status){
							deferred.resolve(status);
						});

			        return deferred.promise;
				},

				getTileContent: function(externalID) {

					$http.get(APP_APIS['tile']+'/tiles/' + externalId + '/content')
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

				});

				},

				moreRadar: function() {

                    return  ( ( tileCache.cacheSize < tileCache.totalItems ) || tileCache.page == 0 )

                },

                moreNetTiles: function() {

                    return ( ( netTilesCache.cacheSize < netTilesCache.totalItems ) ||  netTilesCache.page == 0  )
                },

                moreEvents: function() {

                    return ( ( eventCache.cacheSize < eventCache.totalItems ) ||  eventCache.page == 0  )
                }
        	}
        }
})();