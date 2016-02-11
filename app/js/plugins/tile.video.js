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
					tileId: '=',
					viewMode: '='
				},
				templateUrl: 'app/views/partials/tile-video.html',
				link: function(scope, elem, attrs) {

					scope.youtube = {};

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

						// Clear Youtube Video player
						scope.$parent.$emit('youtubeVideo', scope.tileId, 'close');

						// Bitmovin Video player setting.
						clearBitdash();

						var videoUrl = data.clientPlayBackUrl + data.url;

						var conf = {
                          	key:       '0bd009b1-35eb-4407-9115-9bbae70af5c3',
                          	playback: {
                            	autoplay : true
                          	},
                          	source: {
                            	hls: videoUrl
                          	},
                          	events: {
                            	onReady : function(data) { }
                          	},
                          	skin: {
                          		screenLogoImage : ""                          		
                          	},
                          	adaptation: {
					            mobile: {
					                bitrates: {
					                    minSelectableAudioBitrate  : '0',
					                    maxSelectableAudioBitrate  : Infinity,
					                    minSelectableVideoBitrate  : '300kbps',
					                    maxSelectableVideoBitrate  : Infinity
					                }
					            },
					            desktop: {
					                bitrates: {
					                    minSelectableAudioBitrate  : '0',
					                    maxSelectableAudioBitrate  : Infinity,
					                    minSelectableVideoBitrate  : '300kbps',
					                    maxSelectableVideoBitrate  : Infinity
					                }
					            }
							}
                      	};

                      	bitdash(data.viewMode+'_'+scope.tileId).setup(conf);

                      	if( data.viewMode == 'normal' ){
                      		angular.element('#tile_'+scope.tileId+' .video-player').show();

							angular.element('.tile-image').show();
							angular.element('#tile_'+scope.tileId+' .tile-image').hide();

							angular.element('.tileVideo').hide();
							angular.element('#tile_'+scope.tileId+' .tileVideo').show();

							angular.element('.close-btn').hide();
							angular.element('#tile_'+scope.tileId+' .close-btn').show();

							angular.element('.youtubeVideo-wrap').hide();	
                      	}else if( data.viewMode == 'modal' ){
                      		angular.element('.tile-detail-modal .video-player').show();
							angular.element('.tile-detail-modal .tile-image').hide();
							angular.element('.tile-detail-modal .tileVideo').show();
							angular.element('.tile-detail-modal .close-btn').show();
							angular.element('.youtubeVideo-wrap').hide();	
                      	}
                      	
					})
					
					scope.$on('youtube', function(event, data){

						var vid = data.externalRefs[0].externalContentId;

						if(data.viewMode == 'normal')
							scope.$parent.$emit('youtubeVideo', scope.tileId, 'open');
						else if (data.viewMode == 'modal')
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
							if( data.viewMode == 'normal' ){
								angular.element('#tile_'+scope.tileId+' .video-player').show();

								angular.element('.tile-image').show();
								angular.element('#tile_'+scope.tileId+' .tile-image').hide();

								angular.element('.youtubeVideo-wrap').hide();
								angular.element('#tile_'+scope.tileId+' .youtubeVideo-wrap').show();

								angular.element('.close-btn').hide();
								angular.element('#tile_'+scope.tileId+' .close-btn').show();

								angular.element('.tileVideo').hide();
							}else if( data.viewMode == 'modal' ){
								angular.element('.tile-detail-modal .video-player').show();
								angular.element('.tile-detail-modal .tile-image').hide();
								angular.element('.tile-detail-modal .youtubeVideo-wrap').show();
								angular.element('.tile-detail-modal .close-btn').show();
								angular.element('.tileVideo').hide();
							}							
						}, 1000)						
					})

					scope.hideVideo = function(mode) {
						clearBitdash();
						
						if( mode == 'normal' ){
							scope.$parent.$emit('youtubeVideo', scope.tileId, 'close');

							angular.element('#tile_'+scope.tileId+' .tile-image').show();
							angular.element('#tile_'+scope.tileId+' .video-player').hide();
							angular.element('#tile_'+scope.tileId+' .close-btn').hide();
							angular.element('#tile_'+scope.tileId+' .video-list-wrapper').hide();							
						}else if( mode == 'modal' ){
							scope.$parent.$emit('youtubeVideo', scope.tileId, 'close');

							angular.element('.tile-detail-modal .tile-image').show();
							angular.element('.tile-detail-modal .video-player').hide();
							angular.element('.tile-detail-modal .close-btn').hide();
							angular.element('.tile-detail-modal .video-list-wrapper').hide();
						}						
					}
				}
			}
		})
})();