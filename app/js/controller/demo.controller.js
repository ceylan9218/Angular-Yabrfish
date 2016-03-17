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
    }
})();