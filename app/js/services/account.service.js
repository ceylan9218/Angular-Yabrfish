/**=========================================================
 * Module: AccountService.
 * Description: Service for Account Management.
 * Author: Marcin - 2015.12.24
 =========================================================*/
(function() {
    'use strict';
    
    angular
        .module('app.account', [])        
        .service('AccountService', AccountService);

        function AccountService($http, $q, APP_APIS){

            var SearchAccCache = {"cacheId": null, "cacheSize" : 0, "page" : 0, "pageSize" : 6, "totalPages" : 0, "totalItems" : 0, Accounts:[]};

            var cacheSearch = function(cacheID, response) {

                var searches = [];

                searches = response.data.accounts;

                for (var i in searches) {
                    SearchAccCache.Accounts[SearchAccCache.cacheSize++] = searches[i];
                }

                return searches;
            };

        	return{

                searchCacheSize : function () { return SearchAccCache.cacheSize },

                cacheSearch: function () { return SearchAccCache.Accounts},

                trimSearch: function(cacheId, trimBase) {

                    if ( SearchAccCache.cacheId != cacheId ) {
                        SearchAccCache.cacheId = cacheId
                        SearchAccCache.cacheSize =  0;
                        SearchAccCache.page = 0;
                        SearchAccCache.pageSize = 6;
                        SearchAccCache.totalPages = 0;
                        SearchAccCache.totalItems = 0;
                        if ( SearchAccCache.Accounts != undefined ) SearchAccCache.Accounts.length = 0;
                        return 0;
                    }

                    for (var i in SearchAccCache.Accounts) {
                        // Check If the New Request is in the Search String
                        if (SearchAccCache.Accounts[i].name.indexOf(trimBase) == -1 ) {
                            SearchAccCache.Accounts.splice(i,1);
                            SearchAccCache.cacheSize--;
                        }
                    }

                    return SearchAccCache.cacheSize;

                },

                moreSearch: function(cacheId) {

                    if ( SearchAccCache.cacheId != cacheId ) {
                        SearchAccCache.cacheId = cacheId
                        SearchAccCache.cacheSize =  0;
                        SearchAccCache.page = 0;
                        SearchAccCache.pageSize = 6;
                        SearchAccCache.totalPages = 0;
                        SearchAccCache.totalItems = 0;
                        if ( SearchAccCache.Accounts != undefined ) SearchAccCache.Accounts.length = 0;
                    }

                    return  ( ( SearchAccCache.cacheSize < SearchAccCache.totalItems ) || SearchAccCache.page == 0 )

                },

                searchAccounts: function(cacheId, searchType, searchParams, accountTypes ) {


                    //--------------------------------------------------------------------------
                    // Get List of Accounts Search - Initialise Cache based on the cacheID
                    // CacheID based on Controller generated token
                    //--------------------------------------------------------------------------

                    if ( SearchAccCache.cacheId != cacheId ) {
                        SearchAccCache.cacheId = cacheId
                        SearchAccCache.cacheSize =  0;
                        SearchAccCache.page = 0;
                        SearchAccCache.pageSize = 6;
                        SearchAccCache.totalPages = 0;
                        SearchAccCache.totalItems = 0;
                        if ( SearchAccCache.Accounts != undefined ) SearchAccCache.Accounts.length = 0;
                    }

                    var deferred = $q.defer();

                    if ( SearchAccCache.page !=0 && SearchAccCache.page  >= SearchAccCache.totalPages ) {
                        // Resolve the deferred $q object before returning the promise
                        deferred.resolve([]);
                        return deferred.promise;
                    }

                    //------------------------------------------------------------------------------------------------
                    // Search Type = 1 = Name 2 = Services use this to determine what params are created for the URL
                    //------------------------------------------------------------------------------------------------

                    var searchFilter = '';
                    var searchSep = '?';

                    if ( searchType == 1 ) {
                        // Add Names To Search Filter
                        var names = searchParams.split(",");
                        for ( var i in names) {
                            searchFilter+=  searchSep + 'name='+names[i];
                            searchSep = '&'
                        }
                    } else {
                        var services = searchParams.split(",");
                        for ( var i in services) {
                            searchFilter+=  searchSep + 'serviceName='+services[i];
                            searchSep = '&'
                        }
                    }

                    var accTypes = accountTypes.split(",");
                    for ( var i in accTypes) {
                        searchFilter+=  searchSep + 'type='+accTypes[i];
                    }

                    var apiParms = searchFilter + '&page='+SearchAccCache.page+'&size='+SearchAccCache.pageSize;

                    var promise = $http.get(APP_APIS['commerce']+'/accounts'+apiParms)
                        .then(function(response){

                            if ( SearchAccCache.page == 0 ) {
                                //---------------------------------------------//
                                //Check Total Number of Pages in the Response //
                                //---------------------------------------------//
                                SearchAccCache.totalItems = response.data.totalElements;
                                SearchAccCache.totalPages = response.data.totalPages;
                            }

                            var Accounts = cacheSearch(cacheId, response);
                            SearchAccCache.page++;
                            deferred.resolve(Accounts);
                        }, function(error){
                            console.log(error);
                            return;
                        });

                    return deferred.promise;
                },

                getLocation: function(accountId) {
                    var deferred = $q.defer();
                    $http.get(APP_APIS['commerce'] + '/accounts/' + accountId + '/locations')
                        .success(function(data) {
                            deferred.resolve(data);
                        })
                        .error(function(data, status){
                            deferred.resolve(status);
                        })

                    return deferred.promise;
                },

                setLocation: function(accountId, locationId){
                    var deferred = $q.defer();
                    $http.post(APP_APIS['commerce'] + '/accounts/' + accountId + '/locations/' + locationId)
                        .success(function(data) {
                            deferred.resolve(data);
                        })
                        .error(function(data, status){
                            deferred.resolve(status);
                        })

                    return deferred.promise;
                },

                updateAccount: function(params) {
                    var deferred = $q.defer();
                    $http.put(APP_APIS['commerce'] + '/accounts/' + params.externalId, params)
                        .success(function(data){
                            console.log(data);
                        })
                        .error(function(data, status){
                            console.log(status);
                        })

                    return deferred.promise;
                }

            }
        }
})();