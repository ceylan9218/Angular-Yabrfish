/**=========================================================
 * Module: tileController
 * Description: Controller for a tile
 * Author: Ryan - 2016.1.6
 =========================================================*/
(function() {
    'use strict';

    angular
		.module('app.tile', ["com.2fdevs.videogular", "com.2fdevs.videogular.plugins.controls", "info.vietnamcode.nampnq.videogular.plugins.youtube", 'ngMap', 'flash'])
		.directive('sycovideo', function(){
            return {
              restrict: 'E',
              template: '<div id="{{id}}" class="player"></div>',
              scope: {
                hls_source: "=hls",
                id: "=id"
              },
              link: function(scope, elm, attr) {
                scope.$on('linkChanged', function(event, val, id) {
                  if(scope.id == id) {
                    angular.element('.player').each(function(){
                      var vid = angular.element(this).attr('id');
                      bitdash(vid).destroy();                      
                    });
                    if(val) {
                      var conf = {
                          key:       '9dfc435e221ba94fd0cdbacda4c656cf',
                          playback: {
                            autoplay : true
                          },
                          source: {
                            hls: val,
                          },
                          events: {
                            onReady : function(data) {
                            }                          
                          }
                      };
                      bitdash(scope.id).setup(conf);
                    }
                  }
                });
              }
            }
        })
		.controller('tileController', tileController);

	function tileController($rootScope, $scope, $http, $sce, RouteHelpers, APP_APIS, TileService, ViewerService, Flash) {

		$rootScope.youtubePlay = false;

		$scope.offers = [];
		$scope.bOffersScrollDisabled = false;
		$scope.bTileNetScrollDisabled = false;
		$scope.nets = [];


		$scope.getuser = function(element) {
		}

		$scope.getTileNets = function(tile) {

			// Hide other tiles Net content. -- Emit to TileService.
			$rootScope.$emit('currTile', tile);

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
				})
			}, function(error){
				console.log(error);
			});
			$scope.bTileNetScrollDisabled = false;
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

		$scope.getVideoList = function(element){

			var uid = element.externalId;
			$scope.loading = true;
			element.videoList = [];
			element.videoTitles = [];
			element.videoImages = [];
			element.videoType = '';

			element.youtube = {
				config: {}
			}

			var video_list = angular.element("#tile_"+element.externalId+ " .video-list");
			if(video_list[0])
				video_list[0].style.display = 'block';

			$http.get(APP_APIS['tile']+'/tiles/' + uid + '/content')
				.success(function(data){
					if(data.contentList && data.contentList.length>0){
						element.videoType = data.contentList[0].externalRefs[0].providerCode.toLowerCase();
						if(element.videoType == 'youtube'){
							element.vid = data.contentList[0].externalRefs[0].externalContentId;
							for( var i in data.contentList ){
								element.videoTitles[i] = data.contentList[i].title;
							}
						}else if (element.videoType == 'syco') {
							for( var i = 0; i < data.contentList.length; i++ ){
								var vid = data.contentList[i].externalRefs[0].externalContentId;
								$http.get('http://api1.syndicatecontent.com/Sc.Content.Api.External/ScContentExt/inventory/'+vid+'?mediaformatid=9&vendortoken=B9C333B9-54F3-40B6-8C34-7A6512955B98')
									.success(function(data) {
										if(data.resources[0].medias[0].hostId){
											element.videoList.push(data.resources[0].medias[0]);
										}
									});
								element.videoTitles.push(data.contentList[i].title);
								element.videoImages.push(data.contentList[i].creatives[0].url);
							}
						}
					}
					$scope.loading = false;
				})
		}

        $scope.videoPlay = function(element, video) {
			$rootScope.youtubePlay = false;
			if(element.videoType == 'syco'){
				element.hls_source = video.clientPlayBackUrl + video.url;
				$rootScope.$broadcast( "linkChanged", element.hls_source, element.externalId);
			}

			var tileVideo = angular.element("#tile_"+element.externalId+ " .tileVideo");
			var tileImg = angular.element("#tile_"+element.externalId+ " .tileImg");
			var video_list = angular.element("#tile_"+element.externalId+ " .video-list");
			var ribbon = angular.element("#tile_"+element.externalId+ " .ribbon");

			tileVideo.height(tileImg.height());

			angular.element(".tileImg").css('display', 'inline-block');
			angular.element(".tileVideo").css('display', 'none');
			angular.element(".youtubeVideo-wrap").css('display', 'none');        
			angular.element(".video-list").css('display', 'none');

			tileVideo[0].style.display = 'inline-block';
			tileImg[0].style.display = 'none';
			video_list[0].style.display = 'block';

			if(ribbon[0])
				ribbon[0].style.display = 'none';
        }

        $scope.youtubeVideoPlay = function(element) {
			element.showYoutube = true;
			$rootScope.youtubePlay = true;
			$rootScope.$broadcast( "linkChanged", element.hls_source, element.externalId);

			element.youtube.config = {
				preload: "none",
				autoPlay: true,
				sources: [
					{src: "https://www.youtube.com/watch?v=" + element.vid},
					{src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.webm"), type: "video/webm"},
					{src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.ogg"), type: "video/ogg"}
				],
				theme: {
					url: "http://www.videogular.com/styles/themes/default/latest/videogular.css"
				},
				plugins: {
					controls: {
						autoHide: true,
						autoHideTime: 5000
					}
				}
			};

			var youtubeVideo = angular.element("#tile_"+element.externalId+ " .youtubeVideo-wrap");
			var tileImg = angular.element("#tile_"+element.externalId+ " .tileImg");
			var video_list = angular.element("#tile_"+element.externalId+ " .video-list");
			var ribbon = angular.element("#tile_"+element.externalId+ " .ribbon");

			youtubeVideo.height(tileImg.height());

			angular.element(".tileImg").css('display', 'inline-block');
			angular.element(".tileVideo").css('display', 'none');
			angular.element(".youtubeVideo-wrap").css('display', 'none');
			angular.element(".video-list").css('display', 'none');

			youtubeVideo[0].style.display = 'inline-block';
			tileImg[0].style.display = 'none';
			video_list[0].style.display = 'block';

			if(ribbon[0])
				ribbon[0].style.display = 'none';
        }

        $scope.hideVideo = function(element) {
			$rootScope.$broadcast( "linkChanged", element.hls_source, element.externalId);
			$rootScope.youtubePlay = false;

			var tileVideo = angular.element("#tile_"+element.externalId+ " .tileVideo");
			var youtubeVideo = angular.element("#tile_"+element.externalId+ " .youtubeVideo-wrap");
			var tileImg = angular.element("#tile_"+element.externalId+ " .tileImg");
			var ribbon = angular.element("#tile_"+element.externalId+ " .ribbon");

			tileVideo[0].style.display = 'none';
			youtubeVideo[0].style.display = 'none';
			tileImg[0].style.display = 'inline-block';
		
			if(ribbon[0])
				ribbon[0].style.display = 'inline-block';
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
    }
})();