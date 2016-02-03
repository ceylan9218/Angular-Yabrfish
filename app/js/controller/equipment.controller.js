/**=========================================================
 * Module: equipmentController
 * Description: Controller for My Equipment item in Profile menu.
 * Author: Marcin - 2015.12.16
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.equipment', ['ngAnimate', 'ui.bootstrap'])
        .controller('equipmentController', equipmentController);

    function equipmentController($scope, $rootScope, $http, RouteHelpers, APP_APIS, LookupService, EquipmentService) {

    	if(!$rootScope.user)
    		return;

    	$scope.basepath = RouteHelpers.basepath;
    	$scope.equipments = [];
    	$scope.manufacturers = [];
    	$scope.equipments.unshift('addEquip');
    	$scope.equipType = {};

		$scope.services = [{id:1,name:"Insurance"},{id:2,name:"Storage/Marina"},{id:3,name:"Maintenance"},{id:4,name:"Parts"},{id:5,name:"Cleaning"}];

    	$scope.equip = {
    		name: '',
    		classID: null,
    		desc: '',
    		idNum: ''
    	}

		// Get Service
		//LookupService.getServiceTypes().then(function(data){
		//	$scope.services = data;
		//}, function(error){
		//	console.log(error);
		//	return;
		//});

    	// Get Equipment Types
    	LookupService.getEquipmentTypes().then(function(data){
    		$scope.equipTypes = data;
    	}, function(error){
    		console.log(error);
    		return;
    	});

    	$scope.$on('file', function(e, data){
    		$scope.currentFile = data;
    	})

	    $scope.$watch('equip.name', function(newVal){
	    	if(newVal != ''){	    		
	    		$scope.extendView = true;
	    	}else{
	    		$scope.extendView = false;
	    	}
	    })
	    
	    // Get Equipments via ViewerID
	    EquipmentService.getEquipments($rootScope.user.externalId).then(function(data){
	    	for(var i in data){
	    		$scope.equipments.push(data[i]);
	    	}
	    }, function(error){
	    	console.log(error);
	    	return;
	    })

	    $scope.search_manufacturer = '';
		// Search Manufacturers
		$scope.$watch('search_manufacturer', function(newVal){
			if(newVal != ''){
				$http.get(APP_APIS['commerce']+'/accounts?name='+newVal)
					.success(function(data){
						$scope.manufacturers = data;
					})
			}else{
				$scope.manufacturers = [];
			}
		});

		// Set Manufacturer Name in Search box.
		$scope.selectManu = function(id, text){
			$scope.search_manufacturer = text;
			$scope.manufacturerAccountExternalID = id;
			$scope.manufacturers = [];
		}

	    $scope.createEquip = function() {
	        $scope.equipments.push("addEquip");

	    	var params = {
	    		classID: $scope.equip.classID,
	    		description: $scope.equip.desc,
	    		equipmentType: $scope.equipType.selected.id,
	    		identificationNumber: $scope.equip.idNum,
	    		manufacturerAccountExternalID: $scope.manufacturerAccountExternalID,
	    		name: $scope.equip.name
	    	};

	    	EquipmentService.createEquipment(params).then(function(data){
	    		EquipmentService.setEquipToViewer(data.externalId, $rootScope.user.externalId).then(function(data){
	    			$scope.equipments.push(data);
	    		}, function(error){
	    			console.log(error);
	    			return;
	    		})
	    	}, function(error){
	    		console.log(error);
	    		return;
	    	});
 	    }
    }
})();