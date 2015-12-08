/**=========================================================
 * Module: productService.
 * Description: Service for Product managements.
 * Author: Ryan - 2015.12.8
 =========================================================*/
 (function() {
    'use strict';
    
    angular
        .module('app.product', [])
        .service('productService', productService)

        function productService($http, APP_APIS) {
        	return {
        		getProducts: function(type){
        			var type = type.toUpperCase();
        			$http.get(APP_APIS['commerce']+'/products?type='+type)
				        .success(function(data){
				        	var products = data;
				        })
				    return products;
        		}
        	}
        }
})();