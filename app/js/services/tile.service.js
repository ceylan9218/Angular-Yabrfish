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
			var myTilesCache = {"cacheId": null, "cacheSize" : 0, "page" : 0, "pageSize" : 6, "totalPages" : 0, "totalItems" : 0, tiles:[]};
			var netTilesCache = {"cacheId": null, "cacheSize" : 0, "page" : 0, "pageSize" : 6, "totalPages" : 0, "totalItems" : 0, tiles:[]};
			var searchCache = {"cacheId": null, "cacheSize" : 0, "page" : 0, "pageSize" : 6, "totalPages" : 0, "totalItems" : 0, tiles:[]};
			var offerCache = {"cacheId": null, "cacheSize" : 0, "page" : 0, "pageSize" : 6, "totalPages" : 0, "totalItems" : 0, offers:[]};

        	var currTile = [];
        	
        	//--------------------------------------------------------------------------------------------
			// Process Response and cache tiles from Search Function
			//--------------------------------------------------------------------------------------------
			var cacheSearch = function(response) {
				var searches = [];
				searches = response.data.tileList;

				for (var i in searches) {
					//Get and change lowercase Tile Type.
					searches[i].tileType = searches[i].tileType.toLowerCase();
					// Get Time Difference
					searches[i].publishedDate = getTimeDiff(searches[i].publishedDate);
					searches[i].moreImg = 'app/img/more.png';
					//-------------------------------------------------------------//
					// Add Tiles to Cache
					// Controller is building Cache as well
					//------------------------------------------------------------//
					searchCache.tiles[searchCache.cacheSize++] = searches[i];
				}
				return searches;
			};

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

			//--------------------------------------------------------------------------------------------
			// Process Response and cache tiles from Recommendations Service
			//--------------------------------------------------------------------------------------------
			var cacheOffers = function(response) {

				var offers = [];
				var curDate = new Date();

				offers = response.data;

				for (var i in offers) {

					offers[i].enddate = new Date(offers[i].enddate);

					// Get Diff days between Expired Date and Today.
					var diff = (offers[i].enddate - curDate)/1000;
					diff = Math.abs(Math.floor(diff));
					offers[i].expire_days = Math.floor(diff/(24*60*60));

					// Get EndDate.
					var endDay = offers[i].enddate.getDate();
					var endMonth = offers[i].enddate.getMonth() + 1;
					var endYear = offers[i].enddate.getFullYear();

					if( endDay < 10 ){
						endDay = '0' + endDay;
					}
					if( endMonth < 10 ){
						endMonth = '0' + endMonth;
					}
					offers[i].enddate = endDay + '/' + endMonth + '/' + endYear;
					//-------------------------------------------------------------//
					// Add Tiles to Cache
					// Controller is building Cache as well
					//------------------------------------------------------------//
					offerCache.offers[offerCache.cacheSize++] = offers[i];
				}

				return offers;
			};


			//--------------------------------------------------------------------------------------------
			// Process Response and cache tiles from Tile Service
			//--------------------------------------------------------------------------------------------
			var cacheMyTiles = function(response) {

				var tiles = [];
                tiles = response.data.tileList;

                for (var i in tiles) {
                    //Get and change lowercase Tile Type.
                    tiles[i].tileType = tiles[i].tileType.toLowerCase();
                    // Get Time Difference
                    tiles[i].publishedDate = getTimeDiff(tiles[i].publishedDate);
                    tiles[i].moreImg = 'app/img/more.png';
                    //-------------------------------------------------------------//
                    // Add Tiles to Cache Not being used in this Current Version
                    //  Controller is building Cache as well
                    //------------------------------------------------------------//
                    myTilesCache.tiles[myTilesCache.cacheSize++] = tiles[i];
                }

                return tiles;
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

        		cacheMyTilesSize : function () { return myTilesCache.cacheSize },

                cacheNetTileSize: function() { return netTilesCache.cacheSize },

                cacheSearchSize: function() { return searchCache.cacheSize },

				totalElements: tileCache.totalItems,

				currPage: function () { return tileCache.page },

				totalPages: function () { return tileCache.totalPages },

				cacheTiles: function () { return tileCache.tiles},

				cacheMyTiles: function () { return myTilesCache.tiles},

                cacheNetTiles: function () { return netTilesCache.tiles},

				cacheOffers: function () { return offerCache.offers},

				trimSearch: function(cacheId, tileTags) {

					if ( searchCache.cacheId != cacheId ) {
						searchCache.cacheId = cacheId;
						searchCache.cacheSize =  0;
						searchCache.page = 0;
						searchCache.pageSize = 6;
						searchCache.totalPages = 0;
						searchCache.totalItems = 0;
						if ( searchCache.Accounts != undefined ) searchCache.Accounts.length = 0;
						return 0;
					}

					//--------------------------------------------------------------------
					// Check if tiles in the Cache Have the Same Tags currently selected
					// If the user has removed certain tags and they are not in the cache
					// each tile will be removed until the number of tiles is zero
					//--------------------------------------------------------------------
					var matchCount = 0;
					var currTile = 0;

					for (var currTile in searchCache.tiles) {
						// Loop Tags For Each Tile
						for (var t in searchCache.tiles[currTile].tags) {
							// Check Each Tile Tag with the tags selected in the UI
							for (var tg in tileTags) {
								console.log(currTile + " " + searchCache.tiles[currTile].tags[t].externalId + " " + tileTags[tg].externalId )
								if (searchCache.tiles[currTile].tags[t].externalId == tileTags[tg].externalId) {
									matchCount++
								}
							}
						}
						// If No Matches Remove The Tile From The Cache
						if (matchCount == 0) {
							searchCache.tiles.splice(currTile, 1);
							searchCache.cacheSize--;
						}
						matchCount = 0;
					}

					return searchCache.cacheSize;

				},

                cacheSearchTiles: function () { return searchCache.tiles},

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

                getMyTiles: function(viewerId){

                    console.log("SERVICE Page " + myTilesCache.page + " count " + myTilesCache.totalPages + " total " + myTilesCache.cacheSize);

					var deferred = $q.defer();
					
					if ( myTilesCache.page !=0 && myTilesCache.page  >= myTilesCache.totalPages ) {
						// Resolve the deferred $q object before returning the promise
						deferred.resolve([]);
						return deferred.promise;
					}

					var promise = $http.get(APP_APIS['tile']+'/tiles/owners?viewerExternalId='+ viewerId +'&page='+myTilesCache.page+'&size='+myTilesCache.pageSize)
						.then(function(response){

							if ( myTilesCache.page == 0 ) {
								//---------------------------------------------//
								//Check Total Number of Pages in the Response //
								//---------------------------------------------//
								myTilesCache.totalItems = response.data.totalElements;
								myTilesCache.totalPages = response.data.totalPages;
							}

							var tiles = cacheMyTiles(response);
							myTilesCache.page++;

							console.log("SERVICE THEN count " + myTilesCache.totalItems + " total " + myTilesCache.totalItems);

							deferred.resolve(tiles);
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
		        	var deferred = $q.defer();
		        	$http.get(APP_APIS['tile']+'/tiles/'+ externalId +'/events')
		        		.success(function(data){
		        			deferred.resolve(data.eventList);
		        		})
		        		.error(function(status){
		        			console.log(status);
		        			deferred.resolve(status);
		        		})


                    //--------------------------------------------------------------------------
                    // Get List of Events from Tile Service.
                    //--------------------------------------------------------------------------

					// if ( eventCache.cacheId != externalId ) {
					// 	eventCache.cacheId = externalId
					// 	eventCache.cacheSize =  0;
					// 	eventCache.page = 0;
					// 	eventCache.pageSize = 6;
					// 	eventCache.totalPages = 0;
					// 	eventCache.totalItems = 0;
					// 	if ( eventCache.tiles != undefined ) eventCache.tiles.length = 0;
					// }

     //                var deferred = $q.defer();

					// // if ( eventCache.page !=0 && eventCache.page  >= eventCache.totalPages ) {
					// // 	// Resolve the deferred $q object before returning the promise
					// // 	deferred.resolve([]);
					// // 	return deferred.promise;
					// // }

					// var promise = $http.get(APP_APIS['tile']+'/tiles/'+ externalId +'/events?page='+eventCache.page+'&size='+eventCache.pageSize)
					// 	.then(function(response){
					// 		if ( eventCache.page == 0 ) {
					// 			//---------------------------------------------//
					// 			//Check Total Number of Pages in the Response //
					// 			//---------------------------------------------//
					// 			eventCache.totalItems = response.data.totalElements;
					// 			eventCache.totalPages = response.data.totalPages;
					// 		}

					// 		var events = cacheEvents(externalId, response);
					// 		eventCache.page++;
					// 		deferred.resolve(events);
					// 	});

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

				getSearchTiles: function(cacheId, tags, searchParams, tileTypes) {

					//--------------------------------------------------------
					// Server side Search API Interaction
					//--------------------------------------------------------

					// If its a new Search clear the Cache.
					if ( searchCache.cacheId != cacheId ) {
						searchCache.cacheId = cacheId
						searchCache.cacheSize =  0;
						searchCache.page = 0;
						searchCache.pageSize = 6;
						searchCache.totalPages = 0;
						searchCache.totalItems = 0;
						if ( searchCache.tiles != undefined ) searchCache.tiles.length = 0;
					}

					var deferred = $q.defer();

					if ( searchCache.page !=0 && searchCache.page  >= searchCache.totalPages ) {
						// Resolve the deferred $q object before returning the promise
						deferred.resolve([]);
						return deferred.promise;
					}
					
					var searchFilter = '';
					var searchSep = '?';

					for ( var i in tags) {
						searchFilter+=  searchSep + 'tags='+tags[i].externalId;
						searchSep = '&'
					}

					for ( var i in tileTypes) {
						searchFilter+=  searchSep + 'tiletype='+tileTypes[i];
						searchSep = '&'
					}

					if ( searchFilter.length == 0) {searchFilter+='?'}

					var apiParms = searchFilter + searchSep + 'page='+searchCache.page+'&size='+searchCache.pageSize;

                    var promise = $http.get(APP_APIS['tile']+'/tiles'+apiParms)
                        .then(function(response){
                            if ( searchCache.page == 0 ) {
                                //---------------------------------------------//
                                //Check Total Number of Pages in the Response //
                                //---------------------------------------------//
                                searchCache.totalItems = response.data.totalElements;
                                searchCache.totalPages = response.data.totalPages;
                            }

                            var tiles = cacheSearch(response);
                            searchCache.page++;
                            deferred.resolve(tiles);
                        });

                    return deferred.promise;
				},

				getMedia: function(externalId) {
					var deferred = $q.defer();

					$http.get(APP_APIS['tile']+'/events/'+ externalId +'/media')
						.success(function(data){
							deferred.resolve(data);
						})
						.error(function(error){
							console.log(error);
							return error;
						});

					return deferred.promise;
				},

				getOffers: function(externalId) {

					var deferred = $q.defer();

					if ( offerCache.page !=0 && offerCache.page  >= offerCache.totalPages ) {
						// Resolve the deferred $q object before returning the promise
						deferred.resolve([]);
						return deferred.promise;
					}

					var promise = $http.get(APP_APIS['tile']+'/tiles/'+ externalId +'/offers')
						.then(function(response){

							if ( offerCache.page == 0 ) {
								//---------------------------------------------------------------//
								//Not using Paging on this API so get all Elements in first call//
								//--------------------------------------------------------------//
								offerCache.totalItems = response.data.length;
								offerCache.totalPages = 1;
							}

							var offers = cacheOffers(response);
							offerCache.page++;

							deferred.resolve(offers);
						});

					return deferred.promise;


				},

				moreOffers: function(externalId) {

					if ( offerCache.cacheId != externalId) {
						offerCache.cacheId = externalId
						offerCache.cacheSize =  0;
						offerCache.page = 0;
						offerCache.pageSize = 6;
						offerCache.totalPages = 0;
						offerCache.totalItems = 0;
						if ( offerCache.tiles != undefined ) offerCache.tiles.length = 0;
					}

                    return  ( ( offerCache.cacheSize < offerCache.totalItems ) || offerCache.page == 0 )

                },

				moreRadar: function() {

					return  ( ( tileCache.cacheSize < tileCache.totalItems ) || tileCache.page == 0 )

				},

				moreMyTiles: function() {

                    return  ( ( myTilesCache.cacheSize < myTilesCache.totalItems ) || myTilesCache.page == 0 )

                },

                moreNetTiles: function() {

                    return ( ( netTilesCache.cacheSize < netTilesCache.totalItems ) ||  netTilesCache.page == 0  )
                },

                moreSearch: function() {

                    return ( ( searchCache.cacheSize < searchCache.totalItems ) ||  searchCache.page == 0  )
                },

                moreEvents: function() {

                    return ( ( eventCache.cacheSize < eventCache.totalItems ) ||  eventCache.page == 0  )
                }
        	}
        }
})();