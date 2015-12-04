/**=========================================================
 * netController: Controller for My Net Page
 * used in My Nets page.
 * Author: Ryan - 2015.10.9
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.nets', ['ngAnimate', 'ui.bootstrap'])
        .controller('netController', netController);

    function netController($scope, $rootScope, $http, $modal, $log, APP_APIS) {
      if(!$rootScope.user)
        return;
      
      $http.get(APP_APIS['viewer']+'/viewers/'+$rootScope.user.externalId+'/nets')
        .success(function(data) {
            $scope.nets = data.viewerNets;
        });      

      $scope.items = ['item1', 'item2', 'item3'];
      $scope.animationsEnabled = true;
      $scope.openCreateNet = function () {
        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'createNet.html',
//          controller: 'ModalInstanceCtrl',
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