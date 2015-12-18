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

    function profileController($scope, $rootScope, $http, $modal, $log, Flash, APP_APIS, FacebookAuthService) {
      if(!$rootScope.user)
        return;

      $scope.monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

      // Get profile Attributes
      $http.get(APP_APIS['lookup']+'/viewerattributes')
        .success(function(data) {
          $scope.attrs = data;
        });

      // Get profile infos
      FacebookAuthService.getUser().then(function(user){
        $http.get(APP_APIS['commerce']+'/viewers/'+user.externalId+'/attributes')
          .success(function(data) {
            $scope.infos = data;
  
            for(var i in $scope.infos){
              if( $scope.infos[i].attribute == 1 ){
                // Get Birthday
                $scope.birthday = new Date($scope.infos[i].attributeValueDate);
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
              }else if( $scope.infos[i].attribute == 2 ){
                // Get Job
                $scope.job = $scope.infos[i].attributeValueText;
              }else if( $scope.infos[i].attribute == 3 ){
                // Get Sex
                $scope.sex = $scope.infos[i].attributeValueText;
              }else if( $scope.infos[i].attribute == 4 ){
                // Get Location
                $scope.location = $scope.infos[i].attributeValueText;
              }else if( $scope.infos[i].attribute == 5 ){
                // Get Bio Text
                $scope.bio = $scope.infos[i].attributeValueText;
              }
            }
          }).error(function(status){
            console.log(status);
          });
      })      

      // Update profile infos
      $scope.updateProfile = function(){
        FacebookAuthService.getUser().then(function(user){
            // Update Birthday.
            var birthday = $scope.birthday;
            var dateAry = birthday.split(' ');
            var date = parseInt(dateAry[0].substring(0, dateAry[0].length-2));
            var month = $scope.monthNames.indexOf(dateAry[1]) + 1;
            
            if(date < 10)
              date = '0' + date;

            if(month < 10)
              month = '0' + month;

            var newDate = Number(new Date(dateAry[2] + '-' + month + '-' + date));

            if(!newDate){
              Flash.create('danger', 'Date Format Error!');
              return;
            }else{
              var params = {
                "attribute": 1,
                "attributeValueDate": newDate
              };
              $http({
                  method: 'PUT',
                  url: APP_APIS['commerce']+'/viewers/'+user.externalId+'/attributes/1',
                  data: JSON.stringify(params),
                  headers: {'Content-type': 'application/json'}
                }).success(function (data, status, headers, config) {
                    console.log(data);
                }).error(function (data, status, headers, config) {
                    console.log(status);
                });
            }

            // Update Job.
            if($scope.job){
              var params = {
                "attribute": 2,
                "attributeValueDate": 0,
                "attributeValueText": $scope.job
              };
              $http({
                  method: 'PUT',
                  url: APP_APIS['commerce']+'/viewers/'+user.externalId+'/attributes/2',
                  data: JSON.stringify(params),
                  headers: {'Content-type': 'application/json'}
                }).success(function (data, status, headers, config) {
                    console.log(data);
                }).error(function (data, status, headers, config) {
                    console.log(status);
                });
            }

            // Update Sex.
            if($scope.sex){
              var params = {
                "attribute": 3,
                "attributeValueDate": 0,
                "attributeValueText": $scope.sex
              };
              $http({
                  method: 'PUT',
                  url: APP_APIS['commerce']+'/viewers/'+user.externalId+'/attributes/3',
                  data: JSON.stringify(params),
                  headers: {'Content-type': 'application/json'}
                }).success(function (data, status, headers, config) {
                    console.log(data);
                }).error(function (data, status, headers, config) {
                    console.log(status);
                });
            }

            // Update Location.
            if($scope.location){
              var params = {
                "attribute": 4,
                "attributeValueDate": 0,
                "attributeValueText": $scope.location
              };
              $http({
                  method: 'PUT',
                  url: APP_APIS['commerce']+'/viewers/'+user.externalId+'/attributes/4',
                  data: JSON.stringify(params),
                  headers: {'Content-type': 'application/json'}
                }).success(function (data, status, headers, config) {
                    console.log(data);
                }).error(function (data, status, headers, config) {
                    console.log(status);
                });
            }

            // Update Bio.
            if($scope.bio){
              var params = {
                "attribute": 5,
                "attributeValueDate": 0,
                "attributeValueText": $scope.bio
              };
              $http({
                  method: 'PUT',
                  url: APP_APIS['commerce']+'/viewers/'+user.externalId+'/attributes/5',
                  data: JSON.stringify(params),
                  headers: {'Content-type': 'application/json'}
                }).success(function (data, status, headers, config) {
                    console.log(data);
                }).error(function (data, status, headers, config) {
                    console.log(status);
                });
            }
        })
      }      
    }
})();