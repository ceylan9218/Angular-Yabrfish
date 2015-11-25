/**=========================================================
 * tileController: Controller for My Tiles
 * used in My Tiles
 * Author: Ryan - 2015.11.20
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.tiles', ['ngAnimate', 'ui.bootstrap'])        
        .controller('tileController', tileController);

    function tileController($scope, $http, $rootScope, RouteHelpers, APP_APIS) {
      $scope.tiles = [];
      $scope.basepath = RouteHelpers.basepath;
      $scope.tileType = ['Event', 'Content', 'Offer', 'Sale', 'Business', 'Job', 'Swap', 'Poll'];
      $scope.newTile = {
        tileType: $scope.tileType[0],
        imageUrl: '',
        title: '',
        description: ''
      };
      $scope.accounts = [];
      $scope.organizations = [];

      // Slide Tile Creation Steps.
      var step_count = 3;
      $scope.stepWidth = angular.element('.new-tile-wrap').width();
      $scope.sliderWidth = angular.element('.new-tile-wrap').width() * step_count;
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

      $scope.setFile = function(element) {
        $scope.currentFile = element.files[0];
         var reader = new FileReader();

        reader.onload = function(event) {
          $scope.image_source = event.target.result
          $scope.$apply()

        }
        // when the file is read it triggers the onload event above.
        reader.readAsDataURL(element.files[0]);
      }

      // Get Current User's Roles
      $http.get(APP_APIS['commerce']+'/viewers/B16EF381-81D1-4014-8BFA-AA7B082E0FD7/roles')
        .success(function(data){
          for(var i in data){            
            $scope.accounts.push(data[i].account);
            $scope.organizations.push(data[i].organization);
          }
        })

      $scope.createTile = function() {
        // File Upload
        var fd = new FormData();
        //Take the first selected file
        fd.append("file", $scope.currentFile);

        // $http.post('http://img.yabrfish.com/cdn/', fd, {
        //     withCredentials: true,
        //     headers: {'Content-Type': undefined },
        //     transformRequest: angular.identity
        // }).success( console.log('all right!')).error(console.log('..damn!...'));
        $scope.newTile.tileType = $scope.newTile.tileType.toUpperCase();
        var params = {
          "description": $scope.newTile.description,
          "name": $scope.newTile.title,
          "tileType": $scope.newTile.tileType,
          "isDeleted": false
        };

        $http({
          method: 'POST',
          url: APP_APIS['tile'] + '/tiles',
          data: JSON.stringify(params),
          headers: {'Content-Type': 'application/json'}
        }).success(function (data, status, headers, config){
          console.log(data);
        }).error(function (data, status, headers, config){
          console.log(status);
        })
      }
    }
})();