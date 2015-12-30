/**=========================================================
 * Module: EquipmentService.
 * Description: Service for Equipment Management.
 * Author: Marcin - 2015.12.28
 =========================================================*/
(function() {
    'use strict';
    
    angular
        .module('app.equip', [])        
        .service('EquipmentService', EquipmentService);

        function EquipmentService($http, $q, APP_APIS){
        	return{
        		getEquipments: function(viewerId) {
        			var deferred = $q.defer();
        			$http.get(APP_APIS['viewer']+'/viewer/'+ viewerId +'/equipment')
				        .success(function(data) {
				            deferred.resolve(data);
				        })
				        .error(function(status){
				        	deferred.resolve(status);
				        });

				    return deferred.promise;
        		},

        		createEquipment: function(params){
        			var deferred = $q.defer();
					$http({
						method: 'POST',
						url: APP_APIS['viewer'] + '/equipment',
						data: JSON.stringify(params),
						headers: {'Content-Type': 'application/json'}
					}).success(function (data){
						deferred.resolve(data);
					}).error(function (status){
						deferred.resolve(status);
					});

                    return deferred.promise;
        		},

        		setEquipToViewer: function(equipId, viewerId) {
        			var deferred = $q.defer();
        			$http.post(APP_APIS['viewer'] + '/viewer/' + viewerId + '/equipment/' + equipId)
	            		.success(function(data){
	            			deferred.resolve(data);
	            		}).error(function(status){
	            			deferred.resolve(status);
	            		})

            		return deferred.promise;
        		}
        	}
        }
})();