/**=========================================================
 * accountController: Controller for a Profile Accounts page
 * used in Profile Accounts page.
 * Author: Marcin - 2015.11.23
 =========================================================*/
 (function() {
    'use strict';

    angular
        .module('app.profile-accounts', ['ngAnimate', 'ui.bootstrap'])        
        .controller('accountController', accountController);

    function accountController($scope, $http, RouteHelpers, APP_APIS) {
      $scope.basepath = RouteHelpers.basepath;
      $scope.accounts = [];
      $scope.accountTypes = [];
      $scope.newAccount = {
        accountType: '',
        imageUrl: '',
        title: '',
        description: ''
      };
     
      // Get Roles by viewer.
      $http.get(APP_APIS['commerce']+'/viewers/B16EF381-81D1-4014-8BFA-AA7B082E0FD7/roles')
        .success(function(data){
          for(var i in data){
            $scope.accounts.push(data[i].account);
          }
        });

      // Get Account Type
      $http.get(APP_APIS['lookup']+'/accounttypes')
        .success(function(data){
          $scope.accountTypes = data;
          $scope.newAccount.accountType = $scope.accountTypes[0].fullName;
        });

      $scope.extendAccount = function(element){
        if(element.extendWrap){
          element.extendWrap = false;
        }
        else{
          element.extendWrap = true;
        }
      }
    }
})();