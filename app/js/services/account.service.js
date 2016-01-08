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

            var accCache = {"cacheId": null, "cacheSize" : 0, "page" : 0, "pageSize" : 6, "totalPages" : 0, "totalItems" : 0, Accounts:[]};
            var searchAccCache = {"cacheId": null, "cacheSize" : 0, "page" : 0, "pageSize" : 6, "totalPages" : 0, "totalItems" : 0, Accounts:[]};

            var currAccount = {
                accountTypeId: null,
                externalId: null,
                name: null,
                accountLogoUrl: null,
                services: null,
                organizations: null,
                active: null
            };

            var cacheSearch = function(cacheID, response) {

                var searches = [];

                searches = response.data.accounts;

                for (var i in searches) {
                    searchAccCache.Accounts[searchAccCache.cacheSize++] = searches[i];
                }

                return searches;
            };

        	return{

                addCache : function (account) {

                    accCache.Accounts.push(account);
                    accCache.cacheSize++;

                    return accCache.cacheSize;
                },

                setCurrentAccount: function  (externalId) {

                    for ( var i in accCache.Accounts ) {
                        if ( accCache.Accounts[i].externalId == externalId ) {
                            return accCache.Accounts[i];
                        }
                    }

                    return {};
                },

                searchCacheSize : function () { return searchAccCache.cacheSize },

                cacheSearch: function () { return searchAccCache.Accounts},

                trimSearch: function(cacheId, trimBase) {

                    if ( searchAccCache.cacheId != cacheId ) {
                        searchAccCache.cacheId = cacheId
                        searchAccCache.cacheSize =  0;
                        searchAccCache.page = 0;
                        searchAccCache.pageSize = 6;
                        searchAccCache.totalPages = 0;
                        searchAccCache.totalItems = 0;
                        if ( searchAccCache.Accounts != undefined ) searchAccCache.Accounts.length = 0;
                        return 0;
                    }

                    for (var i in searchAccCache.Accounts) {
                        // Check If the New Request is in the Search String
                        if (searchAccCache.Accounts[i].name.indexOf(trimBase) == -1 ) {
                            searchAccCache.Accounts.splice(i,1);
                            searchAccCache.cacheSize--;
                        }
                    }

                    return searchAccCache.cacheSize;

                },

                moreSearch: function(cacheId) {

                    if ( searchAccCache.cacheId != cacheId ) {
                        searchAccCache.cacheId = cacheId
                        searchAccCache.cacheSize =  0;
                        searchAccCache.page = 0;
                        searchAccCache.pageSize = 6;
                        searchAccCache.totalPages = 0;
                        searchAccCache.totalItems = 0;
                        if ( searchAccCache.Accounts != undefined ) searchAccCache.Accounts.length = 0;
                    }

                    return  ( ( searchAccCache.cacheSize < searchAccCache.totalItems ) || searchAccCache.page == 0 )

                },

                searchAccounts: function(cacheId, searchType, searchParams, accountTypes ) {


                    //--------------------------------------------------------------------------
                    // Get List of Accounts Search - Initialise Cache based on the cacheID
                    // CacheID based on Controller generated token
                    //--------------------------------------------------------------------------

                    if ( searchAccCache.cacheId != cacheId ) {
                        searchAccCache.cacheId = cacheId
                        searchAccCache.cacheSize =  0;
                        searchAccCache.page = 0;
                        searchAccCache.pageSize = 6;
                        searchAccCache.totalPages = 0;
                        searchAccCache.totalItems = 0;
                        if ( searchAccCache.Accounts != undefined ) searchAccCache.Accounts.length = 0;
                    }

                    var deferred = $q.defer();

                    if ( searchAccCache.page !=0 && searchAccCache.page  >= searchAccCache.totalPages ) {
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

                    var apiParms = searchFilter + '&page='+searchAccCache.page+'&size='+searchAccCache.pageSize;

                    var promise = $http.get(APP_APIS['commerce']+'/accounts'+apiParms)
                        .then(function(response){

                            if ( searchAccCache.page == 0 ) {
                                //---------------------------------------------//
                                //Check Total Number of Pages in the Response //
                                //---------------------------------------------//
                                searchAccCache.totalItems = response.data.totalElements;
                                searchAccCache.totalPages = response.data.totalPages;
                            }

                            var Accounts = cacheSearch(cacheId, response);
                            searchAccCache.page++;
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
                            deferred.resolve(data);
                        })
                        .error(function(data, status){
                            deferred.resolve(status);
                        })

                    return deferred.promise;
                }

            }
        }
})();