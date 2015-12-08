/**=========================================================
 * Module: tileController
 * Description: Controller for My Tiles
 * Author: Ryan - 2015.11.20
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.tiles', ['ngAnimate', 'ui.bootstrap', 'ui.select', 'ngFileUpload', 'stripe.checkout'])
        .controller('tileController', tileController);

    function tileController($scope, $http, $rootScope, RouteHelpers, APP_APIS, Upload, TileService) {
      $scope.tiles = [];
      $scope.basepath = RouteHelpers.basepath;
      $scope.tileTypes = [];
      $scope.tileType = {};
      $scope.newTile = {
        title: '',
        description: '',
        tileType: '',
        accountExternalId: '',
        organizationExternalId: ''
      };
      $scope.accounts = [];
      $scope.account = {};
      $scope.organizations = [];
      $scope.organization = {};
      $scope.diffInstances = 0;
      $scope.enablement = true;

      // Get Tile Types
      $http.get(APP_APIS['lookup']+'/tiletypes')
        .success(function(data){
          $scope.tileTypes = data;
        })
        .error(function(status){
          console.log(status);
        })

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

        if($scope.index == 0)
          $scope.enablement = true;

        if($scope.index == 1 && $scope.diffInstances == 0)
          $scope.enablement = false;
      }
      
      // Preview upload Image.
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
      
      if(!$rootScope.user)
        return;
      
      // Get Current User's Roles
      $http.get(APP_APIS['commerce']+'/viewers/'+$rootScope.user.externalId+'/roles')
        .success(function(data){
          for(var i in data){            
            $scope.accounts.push(data[i].account);
          }
        });

      $scope.changeAccount = function(item){
        $scope.organizations = item.organizations;
        var accountId = item.externalId;

        // Get Enablements.
        $http.get(APP_APIS['commerce']+'/accounts/'+accountId+'/enablements?productType=Tiles')
          .success(function(data){
            var enablements = data;
            var maxInstances = 0;
            var instanceCounts = 0;

            for(var i in enablements){
              maxInstances += enablements[i].maximumInstances;
              instanceCounts += enablements[i].instanceCount;
            }

            $scope.diffInstances = maxInstances - instanceCounts;
            if($scope.diffInstances <= 0)
              $scope.enablement = false;
            else
              $scope.enablement = true;
          });
      }

      $scope.createTile = function() {
        if(!$scope.newTile.description) $scope.newTile.description = '';
        if(!$scope.newTile.title) $scope.newTile.title = '';
        if(!$rootScope.user.externalId) $rootScope.user.externalId = '';
        
        if(Object.keys($scope.tileType).length == 0) 
          $scope.newTile.tileType = '';
        else
          $scope.newTile.tileType = $scope.tileType.selected.shortCode;

        if(Object.keys($scope.account).length == 0) 
          $scope.newTile.accountExternalId = '';
        else
          $scope.newTile.accountExternalId = $scope.account.selected.externalId;

        if(Object.keys($scope.organization).length == 0) 
          $scope.newTile.organizationExternalId = '';
        else
          $scope.newTile.organizationExternalId = $scope.organization.selected.externalId;

        $scope.newTile.tileType = $scope.newTile.tileType.toUpperCase();       

        // File Upload
        var creativesExternalId = '';
        var params = {
          "description": $scope.newTile.description,
          "name": $scope.newTile.title,
          "accountExternalId": $scope.newTile.accountExternalId,
          "tileType": $scope.newTile.tileType,
          "organizationExternalId": $scope.newTile.organizationExternalId,
          "viewerExternalId": $rootScope.user.externalId,
          "isDeleted": false
        };

        Upload.upload({
            url: APP_APIS['media'] + '/images',
            data: {file: $scope.currentFile}
        }).then(function (resp) {
            creativesExternalId = resp.data.externalId;
            $http({
              method: 'POST',
              url: APP_APIS['tile'] + '/tiles',
              data: JSON.stringify(params),
              headers: {'Content-Type': 'application/json'}
            }).success(function (data, status, headers, config){
              var tileId = data.externalId;

              // Add Creatives to Given Tile
              $http.post(APP_APIS['tile'] + '/tiles/' + tileId + '/creatives/' + creativesExternalId)
                .success(function(response){
                  console.log(response);
                });
            }).error(function (data, status, headers, config){
              console.log(status);
            })
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });        
      }

      // Get My Tiles.
      $scope.getTiles = function() {
        $http.get(APP_APIS['tile']+'/tiles/owners?viewerExternalId='+ $rootScope.user.externalId)
          .success(function(tiles){
            $scope.tiles = tiles.tileList;
            for(var i in $scope.tiles){
              //Get and change lowercase Tile Type.              
              $scope.tiles[i].tileType = $scope.tiles[i].tileType.toLowerCase();
              $scope.tiles[i].publishedDate = TileService.getTimeDiff($scope.tiles[i].publishedDate);
            }
            console.log(tiles);
          })
      }

      // Get Packs of type = Tile
      $http.get(APP_APIS['commerce']+'/products?type=TILES')
        .success(function(data){
          $scope.products = data;
        })

      $scope.selectOffer = function(offer) {
        $scope.selected = offer;
        $scope.offerDescription = offer.description;
        $scope.offerAmount = offer.grossPrice * 100;
        $scope.offerName = offer.name;
      }

      $scope.isSelected = function(offer) {
        return $scope.selected === offer;
      }

      $scope.doCheckout = function(token) {
        console.log(token.id);
      }
    }
})();