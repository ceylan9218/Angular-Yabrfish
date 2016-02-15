/**=========================================================
 * Module: classesController
 * Description: Controller for Classes Panel in Club profile.
 * Author: Marcin - 2016.2.12
 =========================================================*/

(function() {
    'use strict';
angular
    .module('app.profile-classes', ['ngAnimate', 'ui.bootstrap'])
    .directive('classesPanel', function() {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                ownerId: '='
            },
            controller: 'classesController',
            templateUrl: 'app/views/partials/classes-panel.html'
        };
    })
    .controller('classesController', classesController)
    .directive('classesItem', function() {
        return {
            require: '^classesPanel',
            restrict: 'E',
            transclude: true,
            scope: {
                clubClass: '='
            },
            link: function(scope, element, attrs, classesController) {

            },
            templateUrl: 'app/views/partials/classes-item.html'
        };
    })

    function classesController($scope, $rootScope, TileService, $timeout) {
        // $scope.bClassesScrollDisabled = false;
        // $scope.loading = false;
        $scope.clubClasses = [];
        $scope.panelWidth = 0;

        var setClassesWidth = function(classes){
            $timeout(function(){
                var panelWidth = angular.element('.panel-item').width();
                $scope.panelWidth = classes.length * panelWidth + 'px';
            })
        }

        // Get classes for a club.
        $scope.getClasses = function() {

            TileService.getClubClasses($scope.ownerId).then(function(classes){
                $scope.clubClasses = classes;
                
                for(var i in $scope.clubClasses) {
                    var flag = "http://img.yabrfish.com/cdn/flags/"+$scope.clubClasses[i].classFlag.toLowerCase()+".jpg";
                    $scope.clubClasses[i].flag = flag;
                }

                setClassesWidth($scope.clubClasses);
            }, function(error){
                console.log(error);
                return;
            });            
        }

    }
})();