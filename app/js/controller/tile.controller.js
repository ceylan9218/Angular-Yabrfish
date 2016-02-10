/**=========================================================
 * Module: tileController
 * Description: Controller for a tile
 * Author: Ryan - 2016.1.6
 =========================================================*/
(function() {
    'use strict';

    angular
		.module('app.tile', ["com.2fdevs.videogular", "com.2fdevs.videogular.plugins.controls", "info.vietnamcode.nampnq.videogular.plugins.youtube", 'ngMap', 'flash', 'ngDialog'])
		// .directive('sycovideo', function(){
  //           return {
  //             restrict: 'E',
  //             template: '<div id="{{id}}" class="player"></div>',
  //             scope: {
  //               hls_source: "=hls",
  //               id: "=id"
  //             },
  //             link: function(scope, elm, attr) {
  //               scope.$on('linkChanged', function(event, val, id) {
  //                 if(scope.id == id) {
  //                   angular.element('.player').each(function(){
  //                     var vid = angular.element(this).attr('id');
  //                     bitdash(vid).destroy();                      
  //                   });
  //                   if(val) {
  //                     var conf = {
  //                         key:       '9dfc435e221ba94fd0cdbacda4c656cf',
  //                         playback: {
  //                           autoplay : true
  //                         },
  //                         source: {
  //                           hls: val,
  //                         },
  //                         events: {
  //                           onReady : function(data) {
  //                           }                          
  //                         }
  //                     };
  //                     bitdash(scope.id).setup(conf);
  //                   }
  //                 }
  //               });
  //             }
  //           }
  //       })
		.controller('tileController', tileController);

	function tileController($rootScope, $scope, $http, $sce, RouteHelpers, APP_APIS, TileService, ViewerService, Flash, ngDialog) {

		$rootScope.youtubePlay = false;

		$scope.offers = [];
		$scope.bOffersScrollDisabled = false;
		$scope.bTileNetScrollDisabled = false;
		$scope.nets = [];
		$rootScope.currExternalId = '';
		$scope.netsLoading = false;


		$scope.getuser = function(element) {
		}

		$scope.loadNets = function(tile) {
			$scope.netsLoading = true;

			if ($rootScope.currExternalId == tile.externalId) {
				$scope.netsLoading = false;
				return false;
			}

			$rootScope.currExternalId = tile.externalId;

			// Close other Tiles that may be open
			$rootScope.$emit('currTile', tile);

			getTileNets(tile);

			return true;

		}

		var getTileNets = function(tile) {
			var tileId = tile.externalId;

 			// Get List of Nets
			ViewerService.getNets($rootScope.user.externalId).then(function(data){				
				$scope.nets = ViewerService.cacheNets();

				// Get List of nets for a tile
				ViewerService.getTileNets(tileId, $rootScope.user.externalId).then(function(nets){
					if(nets.length > 0){
							// Check if the tile is in any of the Nets
							$scope.nets.forEach(function(net){
								for(var i in nets) {
									if( nets[i].externalId == net.externalId ){
										net.opt = 'remove';
										break;
									}else{
										net.opt = 'add';
									}
								}
							});
					}else {
						for(var i in $scope.nets){
							$scope.nets[i].opt = 'add';
						}
					}

					$scope.netsLoading = false;
				})
			}, function(error){
				console.log(error);
			});
			$scope.bTileNetScrollDisabled = false;
		}

		$scope.getTileNets = function(tile) {
			getTileNets(tile);
		}

		$scope.updateTileToNet = function(net, tileId, opt) {

			var netId = net.externalId;
			
			if(opt == 'add') {
				ViewerService.addTileToNet(netId, tileId).then(function(data){
					if(data.error == "Conflict"){
						Flash.create('danger', 'The current tile was already added to this Net.');
						return;
					}else{
						net.opt = 'remove';
						Flash.create('success', 'The current tile was added to this net successfully.');
					}
				}, function(error){
					console.log(error);
				})
			} else if(opt == 'remove') {
				ViewerService.removeTileFromNet(netId, tileId).then(function(data){
					net.opt = 'add';
					Flash.create('success', 'The current tile was removed from this net successfully.');
				}, function(error){
					console.log(error);
				})
			}
		}

		$scope.getTileEvents = function(element) {
			console.log("Events Logging")
		}

		$scope.getOffers = function(element) {

			if ( $scope.bOffersScrollDisabled ) {
				return;
			}

			$scope.bOffersScrollDisabled = true;

			if ( TileService.moreOffers(element.externalId)) {
				TileService.getOffers(element.externalId).then(function (data) {
					$scope.offers = data;
					$scope.bOffersScrollDisabled = false;
				}, function (error) {
					console.log(error);
					return;
				})
			} else {
				$scope.offers = TileService.cacheOffers();
				// Make bScopeLoading = True to Turn off Loading
				$scope.bOffersScrollDisabled = true;
				console.log("Offer Cache Done")
			}


		}

        $scope.extendTile = function(element){
        	if(element.extendWrap){
        		element.extendWrap = false;
        		element.moreImg = 'app/img/more.png';
        	}
			else{
				element.extendWrap = true;
				element.moreImg = 'app/img/less.png';
			}

			if(element.tileType == 'offer'){

            }
        }

        $scope.$on('results', function(e, data){
			$scope.results = data;
        })


      	$scope.openTileMore = function (tile) {
      		$scope.tile = tile;
      		
      		if(tile.tileType == 'event'){
				ngDialog.open({ 
					template: 'app/views/tile-detail-modal.html',
					className: 'ngdialog-theme-tile-detail',
					controller: 'eventController',
					scope: $scope
				});
      		}
		}
    }
})();