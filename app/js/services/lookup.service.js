/**=========================================================
 * Module: LookupService.
 * Description: Service for Constant Types.
 * Author: Ryan - 2015.12.21
 =========================================================*/
(function() {
    'use strict';
    
    angular
        .module('app.lookup', [])        
        .service('LookupService', LookupService);

        function LookupService($http, $q, APP_APIS){
        	return {
        		getAccountTypes: function(){
        			var deferred = $q.defer();
        			$http.get(APP_APIS['lookup']+'/accounttypes')
				        .success(function(data){
				        	deferred.resolve(data);
				        })
				        .error(function(status){
				        	deferred.resolve(status);
				        });

				    return deferred.promise;
        		},

                getViewerAttrs: function() {
                    var deferred = $q.defer();
                    $http.get(APP_APIS['lookup']+'/viewerattributes')
                        .success(function(data){
                            deferred.resolve(data);
                        })
                        .error(function(status){
                            deferred.resolve(status);
                        });

                    return deferred.promise;  
                },

                getEventTypes: function() {
                    var deferred = $q.defer();
                    $http.get(APP_APIS['lookup']+'/eventtypes')
                        .success(function(data){
                            deferred.resolve(data);
                        })
                        .error(function(status){
                            deferred.resolve(status);
                        });

                    return deferred.promise;  
                },

                getTileTypes: function() {
                    var deferred = $q.defer();
                    $http.get(APP_APIS['lookup']+'/tiletypes')
                        .success(function(data){
                            deferred.resolve(data);
                        })
                        .error(function(status){
                            deferred.resolve(status);
                        });

                    return deferred.promise;    
                },

                getRelationshipTypes: function() {
                    var deferred = $q.defer();
                    $http.get(APP_APIS['lookup']+'/relationshiptypes')
                        .success(function(data){
                            data.unshift({
                                id: 0,
                                shortCode: "Remove",
                                fullName: "Remove"
                            })
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