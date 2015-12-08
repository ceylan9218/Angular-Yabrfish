/**=========================================================
 * Module: profileController
 * Description: Controller for About item in Profile menu.
 * Author: Marcin - 2015.11.11
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.profile', ['ngAnimate', 'ui.bootstrap','flash', 'xeditable'])
        .run(function(editableOptions) {
          editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
        })
        .controller('profileController', profileController);

    function profileController($scope, $rootScope, $http, $modal, $log, Flash, APP_APIS) {
      if(!$rootScope.user)
        return;

      $scope.monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

      // Get profile Attributes
      $http.get(APP_APIS['lookup']+'/viewerattributes')
        .success(function(data) {
          $scope.attrs = data;
        });

      // Get profile infos
      $http.get(APP_APIS['commerce']+'/viewers/'+$rootScope.user.externalId+'/attributes')
        .success(function(data) {
          $scope.infos = data;
          // Get Birthday          
          $scope.birthday = new Date($scope.infos[0].attributeValueDate);
          var birth_date = $scope.birthday.getDate();
          if(birth_date>3 && birth_date<21){
            birth_date = birth_date + 'th';
          }else{
            switch (birth_date % 10) {
                case 1:  birth_date = birth_date + "st";
                case 2:  birth_date = birth_date + "nd";
                case 3:  birth_date = birth_date + "rd";
                default: birth_date = birth_date + "th";
            }
          }
          var birth_month = $scope.monthNames[$scope.birthday.getMonth()];
          var birth_year = $scope.birthday.getFullYear();
          $scope.birthday = birth_date + " " + birth_month + " " + birth_year;

          // Get Sex
          $scope.sex = $scope.infos[2].attributeValueText;

          // Get Job
          $scope.job = $scope.infos[1].attributeValueText;

          // Get Location
          $scope.location = $scope.infos[3].attributeValueText;

          // Get Bio Text
          $scope.bio = $scope.infos[4].attributeValueText;
        });

      // Update profile infos
      $scope.updateProfile = function(){
        var data = {};
        // Update Job.
        if($scope.job != $scope.infos[1].attributeValueText){
          var params = {
              "attribute": 2,
              "attributeValueDate": 0,
              "attributeValueText": $scope.job
            };
          $http({
              method: 'PUT',
              url: APP_APIS['commerce']+'/viewers/'+$rootScope.user.externalId+'/attributes/2',
              data: JSON.stringify(params),
              headers: {'Content-type': 'application/json'}
            }).success(function (data, status, headers, config) {
                console.log(data);
            }).error(function (data, status, headers, config) {
                console.log(data, status, headers, config);
            });
        }

        // Update Sex.
        if($scope.sex != $scope.infos[2].attributeValueText){
          data = $.param({
            attributeType: 0,
            attributeValueDate: 0,
            attributeValueText: $scope.sex,
            externalId: 'string'
          });
          $http({
              method: 'PUT',
              url: APP_APIS['commerce']+'/viewers/'+$rootScope.user.externalId+'/attributes/3',
              data: JSON.stringify(params),
              headers: {'Content-type': 'application/json'}
            }).success(function (data, status, headers, config) {
                console.log(data);
            }).error(function (data, status, headers, config) {
                console.log(data, status, headers, config);
            });
        }

        // Update Location.
        if($scope.location != $scope.infos[3].attributeValueText){
          data = $.param({
            attributeType: 0,
            attributeValueDate: 0,
            attributeValueText: $scope.location,
            externalId: 'string'
          });
          $http({
              method: 'PUT',
              url: APP_APIS['commerce']+'/viewers/'+$rootScope.user.externalId+'/attributes/4',
              data: JSON.stringify(params),
              headers: {'Content-type': 'application/json'}
            }).success(function (data, status, headers, config) {
                console.log(data);
            }).error(function (data, status, headers, config) {
                console.log(data, status, headers, config);
            });
        }

        // Update Bio.
        if($scope.bio != $scope.infos[4].attributeValueText){
          data = $.param({
            attributeType: 0,
            attributeValueDate: 0,
            attributeValueText: $scope.bio,
            externalId: 'string'
          });
          $http({
              method: 'PUT',
              url: APP_APIS['commerce']+'/viewers/'+$rootScope.user.externalId+'/attributes/5',
              data: JSON.stringify(params),
              headers: {'Content-type': 'application/json'}
            }).success(function (data, status, headers, config) {
                console.log(data);
            }).error(function (data, status, headers, config) {
                console.log(data, status, headers, config);
            });
        }
      }      
    }
})();