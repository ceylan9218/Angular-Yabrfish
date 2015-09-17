(function() {
    'use strict';

    angular
        .module('app.lazyload')
        .constant('APP_REQUIRES', {
          // jQuery based and standalone scripts
          scripts: {
            'modernizr':          ['vendor/modernizr/modernizr.js'],
            'flot-chart':         ['vendor/Flot/jquery.flot.js'],
            'flot-chart-plugins': ['vendor/flot.tooltip/js/jquery.flot.tooltip.min.js',
                                   'vendor/Flot/jquery.flot.resize.js',
                                    'vendor/Flot/jquery.flot.pie.js',
                                    'vendor/Flot/jquery.flot.time.js',
                                    'vendor/Flot/jquery.flot.categories.js',
                                    'vendor/flot-spline/js/jquery.flot.spline.min.js'],
              // jquery core and widgets

             'classyloader':       ['vendor/jquery-classyloader/js/jquery.classyloader.min.js'],
             'sparklines':         ['app/vendor/sparklines/jquery.sparkline.min.js'],

             'weather-icons':      ['vendor/weather-icons/css/weather-icons.min.css'],

             'icons':              ['vendor/fontawesome/css/font-awesome.min.css',
                                   'vendor/simple-line-icons/css/simple-line-icons.css'],
             'spinkit':            ['vendor/spinkit/css/spinkit.css']
          },
          // Angular based script (use the right module name)
          modules: [
              {name: 'akoenig.deckgrid',          files: ['vendor/angular-deckgrid/angular-deckgrid.js']}
          ]
        })
        ;

})();
