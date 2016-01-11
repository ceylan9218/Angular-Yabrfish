/**=========================================================
 * accountController: Controller for a Profile Accounts page
 * used in Profile Accounts page.
 * Author: Marcin - 2015.11.23
 =========================================================*/
 (function() {
    'use strict';

    angular
        .module('app.profile-accounts', ['ngAnimate', 'ui.bootstrap', 'ngSanitize', 'ui.select', 'flash'])
        .filter('propsFilter', function() {
          return function(items, props) {
            var out = [];

            if (angular.isArray(items)) {
              items.forEach(function(item) {
                var itemMatches = false;

                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                  var prop = keys[i];
                  var text = props[prop].toLowerCase();
                  if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                    itemMatches = true;
                    break;
                  }
                }

                if (itemMatches) {
                  out.push(item);
                }
              });
            } else {
              // Let the output be the input untouched
              out = items;
            }

            return out;
          }
        })
        .controller('accountController', accountController);

    function accountController($scope, $rootScope, $http, RouteHelpers, APP_APIS, Flash, ProductService, AuthService, ViewerService, LookupService, AccountService) {


        $scope.basepath = RouteHelpers.basepath;
        $scope.accounts = [];
        $scope.accountTypes = [];
        $scope.accountType = {};

        // Place Holder For New Account Creation
        $scope.newAccount = {
            accountType: '',
            imageUrl: '',
            title: '',
            description: ''
        };

        $scope.location = [{"lat": 51.50013, "lon": -0.126305}];
        $scope.search_option = 'Name';
        $scope.searchType = 1;
        $scope.search_accounts = [];
        $scope.search_account = '';
        $scope.searchToken = '';
        //$scope.countries = LookupService.getCountries();
        $scope.country = {};
        $scope.areaCountry = {};

        // Slide Tile Creation Steps.
        var step_count = 3;
        $scope.stepWidth = angular.element('.new-account-wrap').width();
        $scope.sliderWidth = angular.element('.new-account-wrap').width() * step_count;
        $scope.transform = '';
        var translate = 0;
        $scope.index = 0;

        $scope.slideWrap = function (dir) {
            if (dir === 'next') {
                $scope.index++;
                translate -= $scope.stepWidth;
                $scope.transform = "translate(" + translate + "px, 0px)";
            } else {
                $scope.index--;
                translate += $scope.stepWidth;
                $scope.transform = "translate(" + translate + "px, 0px)";
            }
        }

        // --------------------------------------------------------------------
        // Call Back Function for Image Upload - Used to update Account Panel
        // --------------------------------------------------------------------
        $scope.onComplete = function (creative) {

            var currAccount = AccountService.setCurrentAccount(creative.externalId);

            currAccount.accountLogoUrl  = creative.creatives.url;

            AccountService.updateAccount(currAccount).then(function (data) {
                console.log("Successful Update Account");
            }, function (error) {
                console.log(error);
                Flash.create('danger', 'Error! Problem Updating Image For The Account');
                return;
            })

        }

        //-------------------------------------------------------------------------------
        // Get Accounts based on Viewer Roles
        //------------------------------------------------------------------------------

        $scope.getAccounts = function () {

            // Get Roles by viewer.

            ViewerService.getAccounts($rootScope.user.externalId).then(function (data) {
                var cacheCount;
                for (var i in data) {
                    $scope.accounts.push(data[i].account);
                    cacheCount = AccountService.addCache(data[i].account);
                }
            }, function (error) {
                console.log(error);
                return;
            });

        }


        //-------------------------------------------------------------------------------
        // Create New Account
        //------------------------------------------------------------------------------
        $scope.createAccount = function () {

        }

        //-------------------------------------------------------------------------------
        // Get Account Type
        //------------------------------------------------------------------------------

        LookupService.getAccountTypes().then(function (types) {
            $scope.accountTypes = types;
        }, function (error) {
            console.log(error);
            return;
        });

        ProductService.getProducts('account').then(function (products) {
            $scope.products = products;
        })


            // Show/Hide extend wrap.
        $scope.extendAccount = function(element) {
            var accountId = element.externalId;
            var zoomVal = 17;
            var defaultMapPos = {lat: 51.50013, lng: -0.126305};

            if(element.extendWrap){
              element.extendWrap = false;
            }
            else{
              element.extendWrap = true;
            }
        }

        // Get Products of type = Account
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

        $scope.showNewAccount = function() {
            if($scope.accounts.indexOf('new-account') < 0)
                $scope.accounts.unshift('new-account');
        }

        //--------------------------------------------------------------------
        // Toggle the Account Types Based on the Selector For Name or Service
        //--------------------------------------------------------------------

        $scope.selectOpt = function(txt){
            $scope.search_option = txt;
            if(txt == 'Name')
                $scope.searchType = 1;
            else
                $scope.searchType = 2;
        }

        //--------------------------------------------------------------------
        // Watch Search Request new Request After 3 Chars
        //--------------------------------------------------------------------

        $scope.$watch('search_account', function(newVal){

            if(newVal.length > 3) {
                // Check if adding new Chars Trims the Search to Zero Rows If it does
                // Run a New Search / Cache
                if ( AccountService.trimSearch($scope.searchToken, newVal) == 0 )  {
                    $scope.searchToken='ACCOUNT'+ new Date().getTime();
                    $scope.search_account=newVal;
                    $scope.searchAccounts();
                } else {
                    $scope.search_accounts = AccountService.cacheSearch();
                }
            }

        });

        //--------------------------------------------------------------------
        // Search for Accounts supporting Cache and Unique Search with a Token
        //--------------------------------------------------------------------
        $scope.searchAccounts = function() {

            //---------------------------------------------------------//
            // Load Single Page Search
            //--------------------------------------------------------//
            if ( $scope.inMotion || ! AccountService.moreSearch($scope.searchToken) ) {
                //---------------------------------------------------------------
                // Check Cache Size of Controller if navigation has left the View
                //---------------------------------------------------------------
                if ( $scope.search_accounts.length < AccountService.searchCacheSize()) {
                    $scope.search_accounts.length = 0;
                    $scope.search_accounts = AccountService.cacheSearch();
                }
                return;
            }

            $scope.inMotion = true;
            $scope.loading = true;

            if ( ! AccountService.moreSearch($scope.searchToken) ) {
                $scope.loading = false;
                $scope.inMotion = true;
            } else {
                AccountService.searchAccounts($scope.searchToken, $scope.searchType, $scope.search_account,'').then(function (searchRes) {
                    $scope.search_accounts = AccountService.cacheSearch();
                    $scope.loading = false;
                    $scope.inMotion = false;
                }, function (error) {
                    console.log(error);
                    return;
                })
            }
        }

        //----------------------------------------------------------------------------
        // Set Account into the View for Optional Creating A Relationship
        //----------------------------------------------------------------------------

        $scope.selectAccount = function(account){

            console.log(account);
            for(var i in $scope.accounts){
                if($scope.accounts[i].externalId == account.externalId){
                    Flash.create('danger', 'Its Already Saved For You');
                    return;
                }
            }

            $scope.accounts.push(account);
            var cacheCount = AccountService.addCache(account);
            $scope.search_accounts = AccountService.removeSearch(account);

        }

    }
})();



