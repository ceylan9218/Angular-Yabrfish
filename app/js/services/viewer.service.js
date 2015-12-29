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
        			$http.get(APP_APIS['commerce']+'/viewers/'+viewerId+'/clubs')
			            .success(function(data){
			            	deferred.resolve(data);
			            })
			            .error(function(status){
			            	deferred.resolve(status);
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