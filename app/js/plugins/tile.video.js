/**=========================================================
 * Module: tileVideo Directive.
 * Description: Directive for video function of a tile.
 * Author: Marcin - 2016.1.15
 =========================================================*/
 (function() {
    'use strict';

    angular
		.module('app.tile-video', ["com.2fdevs.videogular", "com.2fdevs.videogular.plugins.controls", "info.vietnamcode.nampnq.videogular.plugins.youtube"])
		.directive("tileVideo", function($sce, $timeout) {
			return {
				restrict: 'E',
				scope: {
					tileId: '='
				},
				templateUrl: 'app/views/partials/tile-video.html',
				link: function(scope, elem, attrs) {

					scope.youtube = {};
					scope.youtubePlay = false;

					var clearBitdash = function() {
						angular.element('.player').each(function(){
							var vid = angular.element(this).attr('id');
							bitdash(vid).destroy();
						})						
					}

					clearBitdash();

					// Listen for event of Bitmovin video.
					scope.$on('video', function(event, data){

						if(!data)
							return;

						scope.youtubePlay = false;

						// Bitmovin Video player setting.
						clearBitdash();

						var videoUrl = data.clientPlayBackUrl + data.url;
						var conf = {
                          	key:       '9dfc435e221ba94fd0cdbacda4c656cf',
                          	playback: {
                            	autoplay : true
                          	},
                          	source: {
                            	hls: videoUrl
                          	},
                          	events: {
                            	onReady : function(data) { }
                          	}
                      	};
                      	bitdash(scope.tileId).setup(conf);

						angular.element('.tile-image').show();
						angular.element('#tile_'+scope.tileId+' .tile-image').hide();

						angular.element('.tileVideo').hide();
						angular.element('#tile_'+scope.tileId+' .tileVideo').show();

						angular.element('.close-btn').hide();
						angular.element('#tile_'+scope.tileId+' .close-btn').show();

						angular.element('.video-list-wrapper');
						angular.element('#tile_'+scope.tileId+' .video-list-wrapper').hide();

						angular.element('.youtubeVideo-wrap').hide();
					})
					
					scope.$on('youtube', function(event, data){

						var vid = data.externalRefs[0].externalContentId;
						
						scope.youtubePlay = true;

						clearBitdash();

						scope.youtube.config = {
							preload: "none",
							autoPlay: true,
							sources: [
								{src: "https://www.youtube.com/watch?v=" + vid},
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

						$timeout(function(){
							angular.element('.tile-image').show();
							angular.element('#tile_'+scope.tileId+' .tile-image').hide();

							angular.element('.youtubeVideo-wrap').hide();
							angular.element('#tile_'+scope.tileId+' .youtubeVideo-wrap').show();

							angular.element('.close-btn').hide();
							angular.element('#tile_'+scope.tileId+' .close-btn').show();

							angular.element('.video-list-wrapper');
							angular.element('#tile_'+scope.tileId+' .video-list-wrapper').hide();

							angular.element('.tileVideo').hide();
						}, 1000)						
					})

					scope.hideVideo = function() {
						bitdash(scope.tileId).destroy();
						angular.element('#tile_'+scope.tileId+' .tile-image').show();
						angular.element('#tile_'+scope.tileId+' .video-player').hide();
						angular.element('#tile_'+scope.tileId+' .close-btn').hide();
						angular.element('#tile_'+scope.tileId+' .video-list-wrapper').hide();
					}
				}
			}
		})
})();