/**=========================================================
 * Module: signupController
 * Description: Controller for a Sign Up page
 * Author: Ryan - 2015.11.15
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.signup', ['ngAnimate', 'ui.bootstrap', 'ng-bootstrap-datepicker', 'ngFileUpload', 'flash'])
        .controller('signupController', signupController);

    function signupController($scope, $http, APP_APIS, Upload, Flash) {
      $scope.register = {
        avatarUrl: '',
        username: '',
        password1: '',
        password2: '',
        firstname: '',
        surname: '',
        email: '',
        date: '',
        agreements: ''
      }

      $scope.slideSignup = function(dir){
        var formWidth = angular.element('.signup-form').width();

        if (dir === 'next') {
          formWidth = formWidth * -1;
          $scope.transform = "translate("+formWidth+"px, 0px)";
        }else {
          $scope.transform = "translate(0px, 0px)";
        }
      }

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

      $scope.today = function() {
        $scope.dt = new Date();
      };
      $scope.today();

      $scope.clear = function () {
        $scope.dt = null;
      };

      // Disable weekend selection
      $scope.disabled = function(date, mode) {
        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
      };

      $scope.toggleMin = function() {
        $scope.minDate = $scope.minDate ? null : new Date();
      };
      $scope.toggleMin();

      $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
      };

      $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
      };

      $scope.initDate = new Date('2019-10-20');
      $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
      $scope.format = $scope.formats[0];

      $scope.uploadPhoto = function() {
        if(!$scope.currentFile){
          Flash.create('danger', 'Please select an image.');
          return;
        }

        Upload.upload({
            url: APP_APIS['media'] + '/images',
            data: {file: $scope.currentFile},
            headers: {'Content-Range': 'bytes 42-1233/*'}
        }).then(function (resp) {
          $scope.register.avatarUrl = resp.data.url;
          console.log($scope.register.avatarUrl);
        }, function (resp) {
            console.log('Error status: ' + resp.status);
            Flash.create('danger', 'Error! Photo upload Failed!');
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });
      }

      $scope.createUser = function(){
        if(!$scope.register.agreements){
          Flash.create('danger', 'Error! Please read and agree the terms!');
          return;
        }

        var params = {
          avatarUrl: $scope.register.avatarUrl,
          forename: $scope.register.firstname,
          nickname: $scope.register.username,
          surname: $scope.register.surname,
          viewerIdentities: [
            {
              identityService: "EMAIL",
              identityId: $scope.register.email,
              passwordSalt: $scope.register.password2
            }
          ]
        }
console.log(params);        
        $http({
          method: 'POST',
          url: APP_APIS['commerce'] + '/viewers',
          data: JSON.stringify(params),
          headers: {'Content-Type': 'application/json'}
        }).success(function (data, status, headers, config){
          console.log(data);
        }).error(function(data, status, headers, config){
          console.log(status);
        })
      }
    }
})();