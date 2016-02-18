/**=========================================================
 * Module: productController
 * Description: Controller for My Products in Profile page.
 * Author: Marcin - 2016-2-16
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.profile-products', ['ngAnimate', 'ui.bootstrap'])
        .directive('productPanel', function() {
            return {
                restrict: 'E',
                transclude: true,
                scope: {
                    ownerId: '='
                },
                controller: 'productController',
                templateUrl: 'app/views/partials/product-panel.html'
            };
        })
        .controller('productController', productController)
        .directive('productItem', function() {
            return {
                require: '^productPanel',
                restrict: 'E',
                transclude: true,
                scope: {
                    product: '='
                },
                link: function(scope, element, attrs, productController) {
                },
                templateUrl: 'app/views/partials/product-item.html'
            };
        });

    function productController($rootScope, $scope, AccountService, $timeout) {
        // $scope.loading = false;
        // $scope.bProductScrollDisabled = false;
        $scope.myProducts = [];
        $scope.productsWidth = 0;

        var setProdsWidth = function(products){
            $timeout(function(){
                var productWidth = angular.element('.panel-item').width();
                $scope.productsWidth = products.length * productWidth + 'px';
            })
        }

        // Use total number of Records or Page Size
        // If a large number of items.
        $scope.getProducts = function () {

            AccountService.getProducts($scope.ownerId).then(function (data) {
                $scope.myProducts = data;

                setProdsWidth($scope.myProducts);
            }, function (error) {
                console.log(error);
                return;
            });


        }
    }

})();
