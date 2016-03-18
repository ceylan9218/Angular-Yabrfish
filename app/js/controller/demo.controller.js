/**=========================================================
 * Module: demoController
 * Description: Controller for Demo page
 * Author: Ryan - 2016.3.17
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.demo', ["ngSanitize", 'ngAnimate', 'infinite-scroll'])
        .controller('demoController', demoController);

    function demoController($scope, $http) {
    	$scope.people = [
    		{
    			viewerId: 'A10153DA-E739-4978-ADA4-B9765F7DFCEF',
    			avatarUrl: 'app/img/user/14.png',
    			name: 'Andy'
    		},
    		{
    			viewerId: 'B16EF381-81D1-4014-8BFA-AA7B082E0FD7',
    			avatarUrl: 'app/img/user/guy-6.jpg',
    			name: 'Dan'
    		},
    		{
    			viewerId: '9762CB1E-1D32-4473-A93D-0A8F610B4A78',
    			avatarUrl: 'app/img/user/guy-8.jpg',
    			name: 'Mandy'
    		},
    	];

    	$scope.currPerson = $scope.people[0];

    	$scope.sortableOptions = {
            placeholder: '<div class="box-placeholder p0 m0"><div></div></div>',
            forcePlaceholderSize: true
        };

        $scope.selPerson = function(person){
        	$scope.currPerson = person;
        }
    }
})();