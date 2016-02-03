/**=========================================================
 * Module: clubController
 * Description: Controller for Club item in Profile menu.
 * Author: Marcin - 2015-11-19
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.profile-equipment', ['ngAnimate', 'ui.bootstrap','flash'])
        .directive('equipmentPanel', function() {
            return {
                restrict: 'E',
                transclude: true,
                scope: {},
                controller: 'equipmentController',
                templateUrl: 'app/views/partials/equipment-panel.html'
            };
        })
        .controller('equipmentController', equipmentController)
        .directive('equipmentItem', function() {
            return {
                require: '^equipmentPanel',
                restrict: 'E',
                transclude: true,
                scope: {
                    equipment: '='
                },
                link: function(scope, element, attrs, equipmentController) {
//                    clubController.addItem(scope);
                },
                templateUrl: 'app/views/partials/equipment-item.html'
            };
        });

    function equipmentController($rootScope, $scope, $sce, RouteHelpers, ViewerService, EquipmentService,  Flash) {

        $scope.myEquipment = [];
        $scope.loading = false;
        $scope.bEquipmentScrollDisabled = false;

        $scope.getEquipment = function () {
console.log(123);

            console.log("Get Equipment Called " + $scope.myEquipment.length + "Loading " + $scope.loading + "Scroll " + $scope.bEquipmentScrollDisabled)

            if ($scope.loading) {
                return;
            }

            $scope.loading = true;

            // Get Equipments via ViewerID
            EquipmentService.getEquipments($rootScope.user.externalId).then(function(data){
                for(var i in data){
                    $scope.myEquipment.push(data[i]);
                    $scope.loading = false;
                }
            }, function(error){
                console.log(error);
                return;
            })

        }
    }

})();
