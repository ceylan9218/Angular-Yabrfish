/**=========================================================
 * Module: masonry-deck.js
 * Demo for Angular Deck
 =========================================================*/

(function() {
    'use strict';

    angular
        .module('app.elements')
        .controller('MasonryDeckController', MasonryDeckController)
        .directive('imageloaded', imageloaded); // required by demo

    MasonryDeckController.$inejct = ['RouteHelpers'];
    function MasonryDeckController(RouteHelpers) {
        var vm = this;

        activate();

        ////////////////

        function activate() {

          vm.basepath = RouteHelpers.basepath;

          vm.photos = [
              {id: 'photo-1', name: 'Awesome photo', src: 'http://lorempixel.com/400/300/abstract', desc:'AAAAAAA'},
              {id: 'photo-2', name: 'Great photo', src: 'http://lorempixel.com/450/400/city', desc:'BBBBB'},
              {id: 'photo-3', name: 'Strange photo', src: 'http://lorempixel.com/400/300/people', desc:'CCCCCCCCCC'},
              {id: 'photo-4', name: 'A photo?', src: 'http://lorempixel.com/400/300/transport', desc:'DDDDDDDDDDDDDD'},
          ];
        }
    }

    // Add class to img element when source is loaded
    function imageloaded () {
        // Copyright(c) 2013 André König <akoenig@posteo.de>
        // MIT Licensed
        var directive = {
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
          var cssClass = attrs.loadedclass;

          element.bind('load', function () {
              angular.element(element).addClass(cssClass);
          });
        }
    }

})();


