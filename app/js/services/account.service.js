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
        	return{
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
                }
        	}
        }
})();