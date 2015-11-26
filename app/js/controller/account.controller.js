/**=========================================================
 * accountController: Controller for a Profile Accounts page
 * used in Profile Accounts page.
 * Author: Marcin - 2015.11.23
 =========================================================*/
 (function() {
    'use strict';

    angular
        .module('app.profile-accounts', ['ngAnimate', 'ui.bootstrap', 'ngSanitize', 'ui.select'])
        .filter('propsFilter', function() {
          return function(items, props) {
            var out = [];

            if (angular.isArray(items)) {
              items.forEach(function(item) {
                var itemMatches = false;

                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                  var prop = keys[i];
                  var text = props[prop].toLowerCase();
                  if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                    itemMatches = true;
                    break;
                  }
                }

                if (itemMatches) {
                  out.push(item);
                }
              });
            } else {
              // Let the output be the input untouched
              out = items;
            }

            return out;
          }
        })
        .controller('accountController', accountController);

    function accountController($scope, $http, RouteHelpers, APP_APIS) {
      $scope.basepath = RouteHelpers.basepath;
      $scope.accounts = [];
      $scope.accountTypes = [];
      $scope.accountType = {};
      $scope.newAccount = {
        accountType: '',
        imageUrl: '',
        title: '',
        description: ''
      };

      // Slide Tile Creation Steps.
      var step_count = 3;
      $scope.stepWidth = angular.element('.new-account-wrap').width();
      $scope.sliderWidth = angular.element('.new-account-wrap').width() * step_count;
      $scope.transform = '';
      var translate = 0;
      $scope.index = 0;

      $scope.slideWrap = function(dir){
        if(dir === 'next'){
          $scope.index ++;
          translate -= $scope.stepWidth;
          $scope.transform = "translate("+translate+"px, 0px)";
        }else{
          $scope.index --;
          translate += $scope.stepWidth;
          $scope.transform = "translate("+translate+"px, 0px)";
        }
      }
      
      $scope.getAccounts = function() {
        // Get Roles by viewer.
        $http.get(APP_APIS['commerce']+'/viewers/B16EF381-81D1-4014-8BFA-AA7B082E0FD7/roles')
          .success(function(data){
            for(var i in data){
              $scope.accounts.push(data[i].account);
            }
          });        
      }

      $scope.createAccount = function() {
        console.log($scope.accountType);
        var params = {

        }
      }

      // Get Account Type
      $http.get(APP_APIS['lookup']+'/accounttypes')
        .success(function(data){
          $scope.accountTypes = data;
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