/**=========================================================
 * Module: ProductService.
 * Description: Service for Product managements.
 * Author: Ryan - 2015.12.8
 =========================================================*/
 (function() {
    'use strict';
    
    angular
        .module('app.product', [])
        .service('ProductService', ProductService)

        function ProductService($http, APP_APIS, $q) {
        	var products = [];
        	return {
        		getProducts: function(type){
        			var type = type.toUpperCase();
        			var deferred = $q.defer();

        			$http.get(APP_APIS['commerce']+'/products?type='+type)
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