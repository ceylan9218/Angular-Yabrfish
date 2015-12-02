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

    function tileController($scope, $http, $rootScope, $location, RouteHelpers, APP_APIS, $timeout, $window) {
      $scope.viewerId = 'B16EF381-81D1-4014-8BFA-AA7B082E0FD7';
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

      // var file, data;
      // $scope.onFile = function(blob) {
      //   Cropper.encode((file = blob)).then(function(dataUrl) {
      //     $scope.dataUrl = dataUrl;
      //     $timeout(showCropper);  // wait for $digest to set image's src
      //   });        
      //   angular.element('.cropper-canvas img').attr('src', $scope.dataUrl);
      //   $route.reload();
      // };

      // $scope.cropper = {};
      // $scope.cropperProxy = 'cropper.first';

      // $scope.preview = function() {
      //   if (!file || !data) return;
      //   Cropper.crop(file, data).then(Cropper.encode).then(function(dataUrl) {
      //     ($scope.preview || ($scope.preview = {})).dataUrl = dataUrl;
      //   });
      // };

      // $scope.clear = function(degrees) {
      //   if (!$scope.cropper.first) return;
      //   $scope.cropper.first('clear');
      // };

      // $scope.scale = function(width) {
      //   Cropper.crop(file, data)
      //     .then(function(blob) {
      //       return Cropper.scale(blob, {width: width});
      //     })
      //     .then(Cropper.encode).then(function(dataUrl) {
      //       ($scope.preview || ($scope.preview = {})).dataUrl = dataUrl;
      //     });
      // }

      // $scope.options = {
      //   maximize: false,
      //   aspectRatio: 16 / 9,
      //   crop: function(dataNew) {
      //     data = dataNew;
      //   }
      // };
      
      // $scope.showEvent = 'show';
      // $scope.hideEvent = 'hide';

      // function showCropper() { $scope.$broadcast($scope.showEvent); }
      // function hideCropper() { $scope.$broadcast($scope.hideEvent); }

      var scope = this;

      $scope.setFile = function(element) {
        $scope.currentFile = element.files[0];
         var reader = new FileReader();

        reader.onload = function(event) {
          $scope.image_source = event.target.result;
          scope.imageSrc = event.target.result;

          $timeout(function () {
            scope.initJcrop();
          });
          
          $scope.$apply();          
        }
        // when the file is read it triggers the onload event above.
        reader.readAsDataURL(element.files[0]);
      }

      scope.file = {};

      $scope.$on("fileProgress", function(e, progress) {
        $scope.progress = progress.loaded / progress.total;
      });

      scope.initJcrop = function () {
        console.log('init jcrop');
        $window.jQuery('img.aj-crop').Jcrop({
          onSelect: function () {
            //$scope.$apply();
            console.log('onSelect', arguments);
          }
        , onChange: function () {
            //$scope.$apply();
            console.log('onChange', arguments);
          }
        , trackDocument: true
        , aspectRatio: 16 / 9
        });
      };

      // http://plnkr.co/edit/Iizykd7UORy3po1h5mfm?p=preview
      scope.cropOpts = {
        ratioW: 1
      , ratioH: 1
      };
      $scope.selected = function (cords) {
        var scale;

        $scope.picWidth = cords.w;
        $scope.picHeight = cords.h;

        console.log('scale');
        if ($scope.picWidth > 400) {
          scale = (400 / $scope.picWidth);
          console.log($scope.picHeight);
          $scope.picHeight *= scale;
          $scope.picWidth *= scale;
          console.log(scale);
        }

        if ($scope.picHeight > 400) {
          scale = (400 / $scope.picHeight);
          $scope.picHeight *= scale;
          $scope.picWidth *= scale;
          console.log(scale);
        }

        console.log('[cords]', $scope.picWidth / $scope.picHeight);
        console.log(cords);
        $scope.cropped = true;

        var rx = $scope.picWidth / cords.w
          , ry = $scope.picHeight / cords.h
          , canvas = document.createElement("canvas")
          , context = canvas.getContext('2d')
          , imageObj = $window.jQuery('img#preview')[0]
          ;


        $window.jQuery('.canvas-preview').children().remove();
        canvas.width = cords.w;
        canvas.height = cords.h;
        context.drawImage(imageObj, cords.x, cords.y, cords.w, cords.h, 0, 0, cords.w, cords.h);
        $window.jQuery('.canvas-preview').append(canvas);


        $window.jQuery('img#preview').css({
          width: Math.round(rx * cords.bx) + 'px',
          height: Math.round(ry * cords.by) + 'px',
          marginLeft: '-' + Math.round(rx * cords.x) + 'px',
          marginTop: '-' + Math.round(ry * cords.y) + 'px'
        });
      };


      // Get Current User's Roles
      $http.get(APP_APIS['commerce']+'/viewers/'+$scope.viewerId+'/roles')
        .success(function(data){
          for(var i in data){            
            $scope.accounts.push(data[i].account);
          }
        });

      $scope.$watch('accountExternalId', function(newVal, oldVal){
        var accountId = newVal;
        for(var i in $scope.accounts){
          if( $scope.accounts[i].externalId == accountId )
            $scope.organizations = $scope.accounts[i].organizations;
        }
      });

      $scope.createTile = function() {
        // File Upload
        var file = $scope.currentFile;
console.log($scope.image_source);
        var params = {
          'file': $scope.image_source
        }

        $http({
          method: 'POST',
          url: APP_APIS['media']+'/images/',
          data: params,
          headers: {'Content-Type': 'multipart/form-data'}
        }).success(function(data, status, headers, config){
          console.log(data);
        }).error(function(data, status, headers, config){
          console.log(status);
        });
        
        if(!$scope.newTile.description) $scope.newTile.description = '';
        if(!$scope.newTile.title) $scope.newTile.title = '';
        if(!$scope.newTile.tileType) $scope.newTile.tileType = '';
        if(!$scope.viewerId) $scope.viewerId = '';
        if(!$scope.accountExternalId) $scope.accountExternalId = '';
        if(!$scope.organizationExternalId) $scope.organizationExternalId = '';

        $scope.newTile.tileType = $scope.newTile.tileType.toUpperCase();
        var params = {
          "description": $scope.newTile.description,
          "name": $scope.newTile.title,
          "accountExternalId": $scope.accountExternalId,
          "tileType": $scope.newTile.tileType,
          "organizationExternalId": $scope.organizationExternalId,
          "viewerExternalId": $scope.viewerId,
          "isDeleted": false
        };

        // $http({
        //   method: 'POST',
        //   url: APP_APIS['tile'] + '/tiles',
        //   data: JSON.stringify(params),
        //   headers: {'Content-Type': 'application/json'}
        // }).success(function (data, status, headers, config){
        //   var tileId = data.externalId;

        //   // Add Creatives to Given Tile
        //   $http.post(APP_APIS['tile'] + '/tiles/' + tileId + '/creatives/' + data.viewerExternalId)
        //     .success(function(response){
        //       console.log(response);
        //       //$location.path('app/tiles');
        //     });
        // }).error(function (data, status, headers, config){
        //   console.log(status);
        // })
      }

      $scope.getTiles = function() {
        $http.get(APP_APIS['tile']+'/tiles/pure/'+ $scope.viewerId)
          .success(function(tiles){
            $scope.tiles = tiles;
            for(var i in $scope.tiles){
              //Get and change lowercase Tile Type.              
              $scope.tiles[i].tileType = $scope.tiles[i].tileType.toLowerCase();
            }
            console.log(tiles);
          })
      }
    }
})();