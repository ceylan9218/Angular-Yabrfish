/**=========================================================
 * Module: tileController
 * Description: Controller for My Tiles
 * Author: Ryan - 2015.11.20
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.tiles', ['ngAnimate', 'ui.bootstrap', 'ui.select', 'ngFileUpload', 'stripe.checkout', 'flash', 'ui.bootstrap.datetimepicker'])
        .directive("checkboxGroup", function() {
            return {
                restrict: "A",
                link: function(scope, elem, attrs) {
                    // Determine initial checked boxes
                    if (scope.checkedWeekDays.indexOf(scope.day.id) !== -1) {
                        elem[0].checked = true;
                    }

                    // Update array on click
                    elem.bind('click', function() {
                        var index = scope.checkedWeekDays.indexOf(scope.day.id);
                        // Add if checked
                        if (elem[0].checked) {
                            if (index === -1) scope.checkedWeekDays.push(scope.day.id);
                        }
                        // Remove if unchecked
                        else {
                            if (index !== -1) scope.checkedWeekDays.splice(index, 1);
                        }
                        // Sort and update DOM display
                        scope.$apply(scope.checkedWeekDays.sort(function(a, b) {
                            return a - b
                        }));
                    });
                }
            }
        })
        .controller('tileController', tileController);

    function tileController($scope, $http, $rootScope, RouteHelpers, APP_APIS, Upload, TileService, ProductService, Flash, FacebookAuthService) {
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
      $scope.enablement = false;
      $scope.enableCreate = true;
      $scope.showNewTile = false;

      $scope.getUser = function() {
        FacebookAuthService.getUser().then(function(user){
          $rootScope.user = user;
          // Get Current User's Roles
          $http.get(APP_APIS['commerce']+'/viewers/'+$rootScope.user.externalId+'/roles')
            .success(function(data){
              for(var i in data){            
                $scope.accounts.push(data[i].account);
              }
              $scope.accounts.unshift({
                name: 'Just For Me'
              });
            });
        })
      }

      if(!$rootScope.user)
        return;

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

      $scope.changeAccount = function(item){        
        $scope.organizations = item.organizations;
        var accountId = item.externalId;
        var accountName = item.name;

        if (accountName == 'Just For Me'){
          $scope.enablement = true;
        }else{
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
              if($scope.diffInstances > 0)
                $scope.enablement = true;
              else
                $scope.enablement = false;
            });
        }        
      }

      $scope.createTile = function() {
        $scope.enableCreate = false;
        if(!$scope.currentFile){
          Flash.create('danger', 'Please select an image.');
          $scope.slideWrap('prev');
          $scope.enableCreate = true;
          return;
        }

        if(Object.keys($scope.tileType).length == 0){
          Flash.create('danger', 'Please select tile type.');
          $scope.slideWrap('prev');
          $scope.enableCreate = true;
          return;
        } 
        else{
          $scope.newTile.tileType = $scope.tileType.selected.shortCode;
          $scope.newTile.tileType = $scope.newTile.tileType.toUpperCase();
        }

        if(!$scope.newTile.title || $scope.newTile.title == ''){
          Flash.create('danger', 'Please input title.');
          $scope.slideWrap('prev');
          return;
        }

        if(!$scope.newTile.description || $scope.newTile.description == ''){
          Flash.create('danger', 'Please input description.');
          $scope.slideWrap('prev');
          return;
        }
        
        if(!$rootScope.user.externalId) $rootScope.user.externalId = '';        

        if(Object.keys($scope.account).length == 0) 
          $scope.newTile.accountExternalId = null;
        else
          $scope.newTile.accountExternalId = $scope.account.selected.externalId;

        if(Object.keys($scope.organization).length == 0) 
          $scope.newTile.organizationExternalId = null;
        else
          $scope.newTile.organizationExternalId = $scope.organization.selected.externalId;

        // File Upload
        var creativesExternalId = '';
        var params = {
          "description": $scope.newTile.description,
          "name": $scope.newTile.title,
          "accountExternalId": $scope.newTile.accountExternalId,
          "tileType": $scope.newTile.tileType,
          "organizationExternalId": $scope.newTile.organizationExternalId,
          "viewerExternalId": $rootScope.user.externalId
        };

        Upload.upload({
            url: APP_APIS['media'] + '/images',
            data: {file: $scope.currentFile},
            headers: {'Content-Range': 'bytes 42-1233/*'}
        }).then(function (resp) {
            creativesExternalId = resp.data.externalId;
            $http({
              method: 'POST',
              url: APP_APIS['tile'] + '/tiles',
              data: JSON.stringify(params),
              headers: {'Content-Type': 'application/json'}
            }).success(function (data, status, headers, config){
              var tileId = data.externalId;
              $scope.newTile = data;
              $scope.newTile.creatives = [];
              // Add Creatives to Given Tile
              $http.post(APP_APIS['tile'] + '/tiles/' + tileId + '/creatives/' + creativesExternalId)
                .success(function(response){
                  $scope.showNewTile = true;
                  $scope.newTile.creatives.push(response);
                  $scope.newTile.publishedDate = TileService.getTimeDiff($scope.newTile.publishedDate);
                  $scope.slideWrap('next');                  
                  Flash.create('success', 'Successfully created new tile.');
                  $scope.enableCreate = true;
                });
            }).error(function (data, status, headers, config){
              console.log('Error status: ' + resp.status);
              Flash.create('danger', 'Error! Cannot create new tile.');
              $scope.enableCreate = true;
            })
        }, function (resp) {
            console.log('Error status: ' + resp.status);
            Flash.create('danger', 'Error! Cannot create new tile.');
            $scope.enableCreate = true;
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
            console.log($scope.tiles);
          })
      }

      // Get Products of type = Tiles
      ProductService.getProducts('tiles').then(function(products){
        $scope.products = products;
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

      // Get Event Tile Type
      $http.get(APP_APIS['lookup']+'/eventtypes')
        .success(function(eventtypes){
          $scope.eventtypes = eventtypes;
        });

      // Calendar Controller
      var in10Days = new Date();
      in10Days.setDate(in10Days.getDate() + 10);
      
      $scope.dates = {
        startDate: new Date(),
        finishDate: new Date()
      };
      
      $scope.open = {
        startDate: false,
        finishDate: false
      };
      
      // Disable weekend selection
      $scope.disabled = function(date, mode) {
        return (mode === 'day' && (new Date().toDateString() == date.toDateString()));
      };

      $scope.dateOptions = {
        showWeeks: false,
        startingDay: 1
      };
      
      $scope.timeOptions = {
        readonlyInput: false,
        showMeridian: false
      };
      
      $scope.dateModeOptions = {
        minMode: 'year',
        maxMode: 'year'
      };
      
      $scope.openCalendar = function(e, date) {
          $scope.open[date] = true;
      };
      
      // $scope.$on('$destroy', function() {
      //   $scope.calculateWatch();
      // });

      /*-------------------------------------Add / Save Event - Ryan(12.15)--------------------------------------------*/
      $scope.events = {
        name: '',
        count: 1,
        selectedAll: false,
        eventsAry: []
      };
      $scope.eventStep = 1;
      $scope.checkedWeekDays = [1,2];
      var days = $scope.checkedWeekDays.length - 1;

      $scope.weekDays = [{
        "id": 1,
        "value": 'Sat'
      }, {
        "id": 2,
        "value": 'Sun'
      }, {
        "id": 3,
        "value": 'Mon'
      }, {
        "id": 4,
        "value": 'Tue'
      }, {
        "id": 5,
        "value": 'Wed'
      }, {
        "id": 6,
        "value": 'Thu'
      }, {
        "id": 7,
        "value": 'Fri'
      }];

      $scope.$watch('events.count', function(newVal){
        if(newVal == null || newVal < 0){
          Flash.create('danger', 'Please input positive number!');
          return;
        }
      })

      // Initial Checked boxes
      angular.forEach($scope.weekDays, function (item) {
          angular.forEach($scope.checkedWeekDays, function (day) {
            if(item.id == day){
              item.Selected = true;
            }
          });
      });

      $scope.checkAll = function() {
        if ($scope.events.selectedAll) {
            $scope.events.selectedAll = true;
            $scope.checkedWeekDays = [1,2,3,4,5,6,7];
        } else {
            $scope.events.selectedAll = false;
            $scope.checkedWeekDays = [];
        }
        angular.forEach($scope.weekDays, function (item) {
            item.Selected = $scope.events.selectedAll;
        });
      }

      // Initial Setting for Start Date & Finish Date.      
      var endOfWeek = function() {
        var today = new Date();
        return new Date( 
            today.getFullYear(), 
            today.getMonth(), 
            today.getDate() + 6 - today.getDay() 
        );
      }
      $scope.dates.startDate = endOfWeek();
      $scope.dates.finishDate = new Date($scope.dates.startDate.getTime() + days * 24 * 60 * 60 * 1000);

      // Set finish Date when change start Date or check week days.
      $scope.$watch('dates.startDate', function(newVal){
          $scope.dates.finishDate = new Date(newVal.getTime() + days * 24 * 60 * 60 * 1000);
      })

      $scope.$watch('checkedWeekDays', function(newVal){
console.log(newVal);        
        angular.forEach($scope.weekDays, function (weekday) {
          if(weekday.id == $scope.checkedWeekDays[0]){
            var diffDay = '';
            switch(weekday.id) {
                case 1:
                  diffDay = 6;
                  break;
                case 2:
                  diffDay = 7;
                  break;
                case 3:
                  diffDay = 1;
                  break;
                case 4:
                  diffDay = 2;
                  break;
                case 5:
                  diffDay = 3;
                  break;
                case 6:
                  diffDay = 4;
                  break;
                case 7:
                  diffDay = 5;
                  break;
                default:
                  diffDay = 6;
            } 

            $scope.dates.startDate = new Date(
              $scope.dates.startDate.getFullYear(),
              $scope.dates.startDate.getMonth(),
              $scope.dates.startDate.getDate() + diffDay - $scope.dates.startDate.getDay()
            );
          }
        })
      })
      
      // Click Next button of Event.
      var tempStartDate = '';
      $scope.addEvent = function() {
        if($scope.eventStep >= $scope.events.count)
          return;

        if(tempStartDate == $scope.dates.startDate){
          Flash.create('danger', 'Please select different start date.');
          return;
        }

        tempStartDate = $scope.dates.startDate;
        $scope.dates.startDate = new Date($scope.dates.startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

        $scope.events.eventsAry.push({
          id: $scope.eventStep,
          name: $scope.events.name + $scope.eventStep,
          startDate: $scope.dates.startDate,
          finishDate: $scope.dates.finishDate
        })

        $scope.eventStep++;
      }

      // Click Prev button of Event.
      $scope.popEvent = function() {
        if($scope.eventStep <= 1)
          return;
        
        tempStartDate = '';
        $scope.dates.startDate = new Date($scope.dates.startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        $scope.events.eventsAry.pop();
        $scope.eventStep--;
      }

      // Click Skip Date button of Event.
      $scope.skipDate = function() {
        $scope.dates.startDate = new Date($scope.dates.startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
//        $scope.dates.finishDate = new Date($scope.dates.startDate.getTime() + 24 * 60 * 60 * 1000);
      }

      $scope.save = function() {
        Flash.create('success', 'Successfully saved.');
      }
      /*-------------------------------------Add / Save Event End--------------------------------------------*/
    }
})();