/**=========================================================
 * Module: ViewerService.
 * Description: Service for Viewer Management.
 * Author: Ryan - 2015.12.21
 =========================================================*/
(function() {
    'use strict';
    
    angular
        .module('app.viewer', [])        
        .service('ViewerService', ViewerService);

		var netsCache = {"cacheSize" : 0, "page" : 0, "pageSize" : 6, "totalPages" : 0, "totalItems" : 0, nets:[]};
		var clubsCache = {"cacheSize" : 0, "page" : 0, "pageSize" : 6, "totalPages" : 0, "totalItems" : 0, clubs:[]};

		var cacheNets = function(response) {

			var nets = [];

			nets = response.data.viewerNets;

			for (var i in nets) {
				//-------------------------------------------------------------//
				// Add Tiles to Cache
				//------------------------------------------------------------//
				netsCache.nets[netsCache.cacheSize++] = nets[i];
			}

			return nets;

		};

		var cacheClubs = function(response) {

			var clubs = [];

			clubs = response.data;

			for (var i in clubs) {
				clubsCache.clubs[clubsCache.cacheSize++] = clubs[i];
			}

			return clubs;

		};


        function ViewerService($http, $q, APP_APIS){


        	return{

				cacheClubs: function() { return clubsCache.clubs},

                cacheNetSize: function() { return netsCache.cacheSize },

                cacheNets: function () { return netsCache.nets},

                moreNets: function() {

                    return  ( ( netsCache.cacheSize < netsCache.totalItems ) || netsCache.page == 0 )

                },

				moreClubs: function() {

					return  ( ( clubsCache.cacheSize < clubsCache.totalItems ) || clubsCache.page == 0 )

				},

				addClubCache: function(club) {

					clubsCache.clubs.push({
						account: club
					});

					clubsCache.totalItems++;
					clubsCache.cacheSize++;

				},

				setCurrentClub: function  (externalId) {

					for ( var i in clubsCache.clubs ) {
						if ( clubsCache.clubs[i].externalId == externalId ) {
							return clubsCache.clubs[i];
						}
					}

					return {};
				},

				getNets: function(viewerId){


					var deferred = $q.defer();

					if ( netsCache.page !=0 && netsCache.page  >= netsCache.totalPages ) {
						// Resolve the deferred $q object before returning the promise
						deferred.resolve([]);
						return deferred.promise;
					}

					var promise = $http.get(APP_APIS['viewer']+'/viewers/'+viewerId+'/nets?page='+netsCache.page+'&size='+netsCache.pageSize)
						.then(function(response){
							if ( netsCache.page == 0 ) {
								//---------------------------------------------//
								//Check Total Number of Pages in the Response //
								//---------------------------------------------//
								netsCache.totalItems = response.data.totalElements;
								netsCache.totalPages = response.data.totalPages;
							}

							var nets = cacheNets(response);
							netsCache.page++;

							console.log("NETS THEN count " + netsCache.totalItems + " total " + netsCache.totalItems);

							deferred.resolve(nets);
						});

					return deferred.promise;
				},

        		getTilesByNetId: function(netId){
        			var deferred = $q.defer();
        			$http.get(APP_APIS['viewer']+'/nets/'+ netId +'/tiles')
				        .success(function(data) {
				            deferred.resolve(data.tileList);
				        })
				        .error(function(status){
				        	deferred.resolve(status);
				        });

				    return deferred.promise;
        		},

        		getAccounts: function(viewerId){
        			var deferred = $q.defer();
        			$http.get(APP_APIS['commerce']+'/viewers/'+viewerId+'/roles')
			            .success(function(data){
			            	deferred.resolve(data);
			            })
			            .error(function(status){
			            	deferred.resolve(status);
			            });

					return deferred.promise;
        		},

        		getClubs: function(viewerId){

					var deferred = $q.defer();

					if ( clubsCache.page !=0 && clubsCache.page  >= clubsCache.totalPages ) {
						// Resolve the deferred $q object before returning the promise
						deferred.resolve([]);
						return deferred.promise;
					}

					var promise = $http.get(APP_APIS['commerce']+'/viewers/'+viewerId+'/clubs?page='+clubsCache.page+'&size='+clubsCache.pageSize)
						.then(function(response){

							if ( clubsCache.page == 0 ) {
								//---------------------------------------------//
								//No Pages on this response //
								//---------------------------------------------//
								clubsCache.totalItems = response.data.length;
								clubsCache.totalPages = 1;
							}

							var clubs = cacheClubs(response);
							clubsCache.page++;

							console.log("CLUBS THEN cache size count " + clubs.length + " total " + clubsCache.clubs.length);

							deferred.resolve(clubs);
						});

					return deferred.promise;

        		},

        		updateRelation: function(viewerId, accountId, relationId){
        			var deferred = $q.defer();
        			$http.post(APP_APIS['commerce']+'/viewers/'+viewerId+'/clubs/'+accountId+'/relation/'+relationId)
			            .success(function(data){
			            	deferred.resolve(data);
			            })
			            .error(function(status){
			            	deferred.resolve(status);
			            });

					return deferred.promise;	
        		},

        		removeMembership: function(viewerId, accountId) {
        			var deferred = $q.defer();
        			$http.delete(APP_APIS['commerce']+'/viewers/'+viewerId+'/membership/'+accountId)
			            .success(function(data){
			            	deferred.resolve(data);
			            })
			            .error(function(status){
			            	deferred.resolve(status);
			            });

					return deferred.promise;
        		},

        		removeRelation: function(viewerId, accountId) {
        			var deferred = $q.defer();
        			$http.delete(APP_APIS['commerce']+'/viewers/'+viewerId+'/clubs/'+accountId)
			            .success(function(data){
			            	deferred.resolve(data);
			            })
			            .error(function(status){
			            	deferred.resolve(status);
			            });

					return deferred.promise;
        		}
        	}
        }
})();