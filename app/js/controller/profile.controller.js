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

    function profileController($scope, $rootScope, ViewerService, Flash, COLUMN_WIDTH, ngDialog) {

        if(!$rootScope.user)
            return;

        $scope.scrollPos = 0;

        $scope.monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        // Get profile infos
        ViewerService.getProfileInfo($rootScope.user.externalId).then(function(data){

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

        }, function(error){
          console.log(error);
          return;
        })      

        $scope.updateUser = function(attributeValue, attributeId) {
            if(attributeId == 1){
              // Update Birthday.
              var birthday = attributeValue;
              var dateAry = birthday.split('/');

              var date = parseInt(dateAry[0]);
              if( date < 0 || date > 31){
                Flash.create('danger', 'Date Format should be like "DD/MM/YYYY"!');
                return;
              }else{            
                if(date < 10)
                  date = '0' + date;
              }

              var month = parseInt(dateAry[1]);
              if( month < 0 || month > 12){
                Flash.create('danger', 'Date Format should be like "DD/MM/YYYY"!');
                return;
              }else{
                if(month < 10)
                  month = '0' + month;
              }

              var year = dateAry[2];
              var newDate = Number(new Date(year + '-' + month + '-' + date));

              if(!newDate){
                Flash.create('danger', 'Date Format should be like "DD/MM/YYYY"!');
                return;
              }else{
                var params = {
                  "attribute": attributeId,
                  "attributeValueDate": newDate
                };
                ViewerService.updateProfile($rootScope.user.externalId, attributeId, params).then(function(data){
                  console.log(data);
                }, function(error){
                  console.log(error);
                  return;
                })
              }
            }else{
                // Update other attributes excluding birthday.

                var params = {
                  "attribute": attributeId,
                  "attributeValueDate": 0,
                  "attributeValueText": attributeValue
                };

                ViewerService.updateProfile($rootScope.user.externalId, attributeId, params).then(function(data){
                  console.log(data);
                }, function(error){
                  console.log(error);
                  return;
                })

            }
        }
        
        $scope.sortableOptions = {
            placeholder: '<div class="box-placeholder p0 m0"><div></div></div>',
            forcePlaceholderSize: true
        };

        // Hide Profile Panel Contents on Mobile.
        var width = angular.element('.content-wrapper').width();
        if( width <= COLUMN_WIDTH['one_column'] ){
            $scope.hideAbout = true;
            $scope.hideBio = true;
            $scope.hideClub = true;
            $scope.hideEquip = true;
            $scope.hideAccount = true;
            $scope.hideTiles = true;
            $scope.hidePeople = true;
            $scope.hideSocial = true;
        }


        $scope.addTile = function() {
            $scope.scrollPos = $(window).scrollTop();
            // Set body element top style to current scroll position.
            angular.element('body').css('top', '-'+$scope.scrollPos+'px');

            var dialog = ngDialog.open({ 
                template: 'app/views/partials/tile-new.html',
                className: 'ngdialog-theme-add-tile',
                controller: 'newTileController',
                showClose: true,
                scope: $scope
            });
        }

        // Listen Dialog close event and set scroll position to origin value.
        $rootScope.$on('ngDialog.closed', function (e, $dialog) {
            window.scrollTo(0, $scope.scrollPos);
            angular.element('body').css('top', '');
        });
    }
})();