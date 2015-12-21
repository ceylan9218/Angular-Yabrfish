/**=========================================================
 * Module: equipmentController
 * Description: Controller for My Equipment item in Profile menu.
 * Author: Marcin - 2015.12.16
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.equipment', ['ngAnimate', 'ui.bootstrap','flash'])
        .directive('myEnter', function () {
		    return function (scope, element, attrs) {
		        element.bind("keydown keypress", function (event) {
		            if(event.which === 13) {
//		                scope.$apply(function (){
		                    scope.$eval(attrs.myEnter);
//		                });

		                event.preventDefault();
		            }
		        });
		    };
		})
        .controller('equipmentController', equipmentController);

    function equipmentController($scope, $rootScope, $http, RouteHelpers, Flash, APP_APIS, AuthService) {
    	$scope.basepath = RouteHelpers.basepath;
    	$scope.equipments = [];
    	$scope.manufacturers = [];
    	$scope.equipments.unshift('addEquip');

    	$scope.equip = {
    		name: '',
    		classID: null,
    		desc: '',
    		idNum: ''
    	}

    	$scope.equipTypes = [
    		{
    			id: 1,
    			name: "Sail Sailing Boat"    			
    		},
    		{
    			id: 2,
    			name: "Power Power Boat"    			
    		},
    		{
    			id: 3,
    			name: "Dinghy Sailing Dinghy"    			
    		},
    		{
    			id: 4,
    			name: "Paddle Board Paddle Board"    			
    		}
    	];

    	$scope.equipType = {};

    	$scope.setFile = function(element) {
	        $scope.currentFile = element.files[0];
	        var reader = new FileReader();

	        reader.onload = function(event) {
	          $scope.image_source = event.target.result;
	          $scope.$apply();
	        }

	        // when the file is read it triggers the onload event above.
	        reader.readAsDataURL(element.files[0]);
	    }

	    $scope.expandFields = function() {
	    	if($scope.equip.name != ''){	    		
	    		$scope.extendView = true;
	    		$scope.$apply();
	    	}else{
	    		$scope.extendView = false;
	    		$scope.$apply();
	    	}
	    }

	    $scope.getUser = function() {
	        AuthService.getUser().then(function(user){
	        	$rootScope.user = user;
	        })
	    }
	    
	    // Get Equipments via ViewerID
	    $http.get(APP_APIS['viewer']+'/viewer/'+$rootScope.user.externalId+'/equipment')
	    	.success(function(equipments){
	    		for(var i in equipments){
	    			$scope.equipments.push(equipments[i]);
	    		}
	    	}).error(function(status){
	    		console.log(status);
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

	    	$http({
              method: 'POST',
              url: APP_APIS['viewer'] + '/equipment',
              data: JSON.stringify(params),
              headers: {'Content-Type': 'application/json'}
            }).success(function (data, status, headers, config){
            	$http.post(APP_APIS['viewer'] + '/viewer/' + $rootScope.user.externalId + '/equipment/' + data.externalId)
            		.success(function(data){
	            		$scope.equipments.push(data);
//console.log($scope.equipments);
            		}).error(function(status){
            			console.log(status);
            		})
            }).error(function (data, status, headers, config){
            	console.log('Error status: ' + status);
            });
	    }
    }
})();