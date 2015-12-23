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

        function ViewerService($http, $q, APP_APIS){
        	return{
        		getNets: function(viewerId){
        			var deferred = $q.defer();
					$http.get(APP_APIS['viewer']+'/viewers/'+viewerId+'/nets')
						.success(function(data) {
							deferred.resolve(data.viewerNets);
				        })
				        .error(function(data, status){
				        	deferred.resolve(status);
				        })
				   
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
        			$http.get(APP_APIS['commerce']+'/viewers/'+viewerId+'/membership?type=6')
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