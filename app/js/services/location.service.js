/**=========================================================
 * Module: LocationService.
 * Description: Service for Location Management.
 * Author: Marcin - 2015.12.24
 =========================================================*/
(function() {
    'use strict';
    
    angular
        .module('app.locationSrv', [])        
        .service('LocationService', LocationService);

        function LocationService($http, $q, APP_APIS){

        	return{

        		getLocation: function(locationId) {
        			var deferred = $q.defer();
					$http.get(APP_APIS['commerce'] + '/locations/' + locationId)
						.success(function(data) {
							deferred.resolve(data);
				        })
				        .error(function(data, status){
				        	deferred.resolve(status);
				        })

					return deferred.promise;
        		},

                createLocation: function(params){
                    var deferred = $q.defer();
                    $http.post(APP_APIS['commerce'] + '/locations', params)
                        .success(function(data) {
                            deferred.resolve(data);
                        })
                        .error(function(data, status){
                            deferred.resolve(status);
                        })

                    return deferred.promise;
                },

                updateLocation: function(locationId, params){
                    var deferred = $q.defer();
                    $http.put(APP_APIS['commerce'] + '/locations/' + locationId, params)
                        .success(function(data) {
                            deferred.resolve(data);
                        })
                        .error(function(data, status){
                            deferred.resolve(status);
                        })

                    return deferred.promise;
                },

                deleteLocation: function(locationId){
                    var deferred = $q.defer();
                    $http.delete(APP_APIS['commerce'] + '/locations/' + locationId)
                        .success(function(data) {
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