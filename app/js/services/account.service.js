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
            var clubMembersCache = {"cacheId": null, "cacheSize" : 0, "page" : 0, "pageSize" : 6, "totalPages" : 0, "totalItems" : 0, members:[]};
            var productCache = {"cacheId": null, "cacheSize" : 0, "page" : 0, "pageSize" : 6, "totalPages" : 0, "totalItems" : 0, products:[]};
            var serviceCache = {"cacheId": null, "cacheSize" : 0, "page" : 0, "pageSize" : 5, "totalPages" : 0, "totalItems" : 0, services:[]};

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

            var updateCache = function (object, value, replacevalue){

                for(var x in object){
                    if(typeof object[x] == 'object'){
                        findAndReplace(object[x], value, replacevalue);
                    }
                    if(object[x] == value){
                        object["name"] = replacevalue;
                        // break; // uncomment to stop after first replacement
                    }
                }
            };

            //--------------------------------------------------------------------------------------------
            // Process Response and cache club members from Account Service
            //--------------------------------------------------------------------------------------------
            var cacheClubMembers = function(response) {

                var members = [];
                members = response.data;

                for (var i in members) {
                    if(!members[i].avatarUrl || members[i].avatarUrl == '')
                        members[i].avatarUrl = 'app/img/user/default.png';
                    clubMembersCache.members[clubMembersCache.cacheSize++] = members[i];
                }

                return members;
            };

            //--------------------------------------------------------------------------------------------
            // Process Response and cache products from Account Service
            //--------------------------------------------------------------------------------------------
            var cacheProducts = function(response) {

                var products = [];
                products = response.data;

                for (var i in products) {                    
                    productCache.products[productCache.cacheSize++] = products[i];
                }

                return products;
            };

            //--------------------------------------------------------------------------------------------
            // Process Response and cache services from Account Service
            //--------------------------------------------------------------------------------------------
            var cacheServices = function(response) {

                var services = [];
                services = response.data.content;

                for (var i in services) {
                    serviceCache.services[serviceCache.cacheSize++] = services[i];
                }

                return services;
            };

        	return{

                cacheClubMembersSize : function () { return clubMembersCache.cacheSize },
                cacheProductsSize : function () { return productCache.cacheSize },
                cacheServicesSize : function () { return serviceCache.cacheSize },

                cacheAccounts: function () { return accCache.Accounts},
                cacheClubMembers: function () { return clubMembersCache.members},
                cacheProducts: function () { return productCache.products},
                cacheServices: function () { return serviceCache.services},

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

                removeSearch: function(account) {

                    for (var i in searchAccCache.Accounts) {
                        // Check If the New Request is in the Search String
                        if (searchAccCache.Accounts[i].externalId == account.externalId ) {
                            searchAccCache.Accounts.splice(i,1);
                            searchAccCache.cacheSize--;
                        }
                    }

                    return searchAccCache.Accounts;

                },

                trimSearch: function(cacheId, trimBase) {

                    if ( searchAccCache.cacheId != cacheId ) {
                        searchAccCache.cacheId = cacheId;
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

                    if ( accountTypes.length > 0 ) {
                        var accTypes = accountTypes.split(",");
                        for (var i in accTypes) {
                            searchFilter += searchSep + 'type=' + accTypes[i];
                        }
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
                },

                getClubMembers: function(accountId){

                    console.log("SERVICE Page " + clubMembersCache.page + " count " + clubMembersCache.totalPages + " total " + clubMembersCache.cacheSize);

                    var deferred = $q.defer();
                    
                    if ( clubMembersCache.page !=0 && clubMembersCache.page  >= clubMembersCache.totalPages ) {
                        // Resolve the deferred $q object before returning the promise
                        deferred.resolve([]);
                        return deferred.promise;
                    }
                    
                    //var promise = $http.get(APP_APIS['commerce']+'/accounts/'+ accountId +'/memberships&page='+clubMembersCache.page+'&size='+clubMembersCache.pageSize)                    
                    var promise = $http.get(APP_APIS['commerce']+'/accounts/'+ accountId +'/memberships')
                        .then(function(response){

                            if ( clubMembersCache.page == 0 ) {
                                //---------------------------------------------//
                                //Check Total Number of Pages in the Response //
                                //---------------------------------------------//
                                clubMembersCache.totalItems = response.data.totalElements;
                                clubMembersCache.totalPages = response.data.totalPages;
                            }

                            var members = cacheClubMembers(response);
                            clubMembersCache.page++;

                            console.log("SERVICE THEN count " + clubMembersCache.totalItems + " total " + clubMembersCache.totalItems);

                            deferred.resolve(members);
                        });
                    
                    
                    return deferred.promise;
                },

                moreClubMembers: function() {

                    return  ( ( clubMembersCache.cacheSize < clubMembersCache.totalItems ) || clubMembersCache.page == 0 )

                },

                getProducts: function(accountId){

                    console.log("SERVICE Page " + productCache.page + " count " + productCache.totalPages + " total " + productCache.cacheSize);

                    var deferred = $q.defer();
                    
                    if ( productCache.page !=0 && productCache.page  >= productCache.totalPages ) {
                        // Resolve the deferred $q object before returning the promise
                        deferred.resolve([]);
                        return deferred.promise;
                    }
                    
                    //var promise = $http.get(APP_APIS['commerce']+'/accounts/'+ accountId +'/products&page='+productCache.page+'&size='+productCache.pageSize)
                    var promise = $http.get(APP_APIS['commerce']+'/accounts/'+ accountId +'/products')
                        .then(function(response){

                            if ( productCache.page == 0 ) {
                                //---------------------------------------------//
                                //Check Total Number of Pages in the Response //
                                //---------------------------------------------//
                                productCache.totalItems = response.data.totalElements;
                                productCache.totalPages = response.data.totalPages;
                            }

                            var products = cacheProducts(response);
                            productCache.page++;

                            console.log("SERVICE THEN count " + productCache.totalItems + " total " + productCache.totalItems);

                            deferred.resolve(products);
                        });
                    
                    
                    return deferred.promise;
                },

                moreProducts: function() {

                    return  ( ( productCache.cacheSize < productCache.totalItems ) || productCache.page == 0 )

                },

                getServices: function(accountId){

                    console.log("SERVICE Page " + serviceCache.page + " count " + serviceCache.totalPages + " total " + serviceCache.cacheSize);

                    var deferred = $q.defer();
                    
                    if ( serviceCache.page !=0 && serviceCache.page  >= serviceCache.totalPages ) {
                        // Resolve the deferred $q object before returning the promise
                        deferred.resolve([]);
                        return deferred.promise;
                    }
                    
                    var promise = $http.get(APP_APIS['commerce']+'/accounts/'+ accountId +'/services?page='+serviceCache.page+'&size='+serviceCache.pageSize)
                    
                        .then(function(response){

                            if ( serviceCache.page == 0 ) {
                                //---------------------------------------------//
                                //Check Total Number of Pages in the Response //
                                //---------------------------------------------//
                                serviceCache.totalItems = response.data.totalElements;
                                serviceCache.totalPages = response.data.totalPages;
                            }

                            var services = cacheServices(response);
                            serviceCache.page++;

                            console.log("SERVICE THEN count " + services.length + " total " + serviceCache.services.length);

                            deferred.resolve(services);
                        });
                    
                    
                    return deferred.promise;
                },

                moreServices: function() {

                    return  ( ( serviceCache.cacheSize < serviceCache.totalItems ) || serviceCache.page == 0 )

                },

            }
        }
})();