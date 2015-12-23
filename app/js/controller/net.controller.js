/**=========================================================
 * Module: netController
 * Description: Controller for My Net Page
 * Author: Ryan - 2015.10.9
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.nets', ['ngAnimate', 'ui.bootstrap'])
        .controller('netController', netController);

    function netController($scope, $rootScope, $http, $modal, $log, APP_APIS, AuthService, ViewerService) {

      AuthService.getUser().then(function(user){
        ViewerService.getNets(user.externalId).then(function(nets){
          $scope.nets = nets;
        }, function(error){
          console.log(error);
          return;
        });
      }, function(error){
        console.log(error);
        return;
      });
      
      $scope.items = ['item1', 'item2', 'item3'];
      $scope.animationsEnabled = true;
      $scope.openCreateNet = function () {
        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'createNet.html',
          resolve: {
            items: function () {
              return $scope.items;
            }
          }
        });

        modalInstance.result.then(function (selectedItem) {
          $scope.selected = selectedItem;
        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });
      }
    }
})();