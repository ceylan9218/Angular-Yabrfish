/**=========================================================
 * Module: netController
 * Description: Controller for My Net Page
 * Author: Ryan - 2015.10.9
 =========================================================*/
(function () {
  'use strict';

  angular
      .module('app.nets', ['ngAnimate', 'ui.bootstrap'])
      .controller('netController', netController);

  function netController($scope, $rootScope, $http, $modal, $log, APP_APIS, RouteHelpers, AuthService, ViewerService) {

      $scope.inMotion = false;
      $scope.loading = false;
      $scope.basepath = RouteHelpers.basepath;
      $scope.nets = [];
      $scope.CurrNet = [];


      $scope.getNets = function() {

          //---------------------------------------------------------//
          // Load Single Page of Nets
          //--------------------------------------------------------//

          if ( $scope.inMotion || ! ViewerService.moreNets() ) {
              //---------------------------------------------------------------
              // Check Cache Size of Controller if navigation has left the View
              //---------------------------------------------------------------
              if ( $scope.nets.length < ViewerService.cacheNetSize() ) {
                  $scope.tiles = ViewerService.cacheNets();
              }
              return;
          }

          $scope.inMotion = true;
          $scope.loading = true;

          if ( ! ViewerService.moreNets() ) {
              $scope.loading = false;
              $scope.inMotion = true;
          } else {
              ViewerService.getNets($rootScope.user.externalId).then(function (nets) {
                  $scope.nets = ViewerService.cacheNets();
                  $scope.loading = false;
                  $scope.inMotion = false;
              }, function (error) {
                  console.log(error);
                  return;
              })
          }
      }

  }

})();