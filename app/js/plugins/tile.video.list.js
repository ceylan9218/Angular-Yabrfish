/**=========================================================
 * Module: tileVideoList Directive.
 * Description: Directive for video list of a tile.
 * Author: Marcin - 2016.1.15
 =========================================================*/
 (function() {
    'use strict';

    angular
		.module('app.tile-videoList', [])
		.directive("tileVideoList", function(TileService) {
			return {
				restrict: 'E',
				scope: {
					tileId: '='
				},
				templateUrl: 'app/views/partials/tile-videoList.html',
				link: function(scope, elem, attrs) {
					scope.showList = false;

					scope.$on('showVideoList', function(event, data){

						if(!data)
							return;
                        
                        scope.showList = true;
						scope.loading = true;
						scope.videoList = [];
						scope.videoTitles = [];
						scope.videoImages = [];
						scope.videoType = '';

						scope.youtube = {
							config: {}
						}

						TileService.getTileContent(scope.tileId).then(function(data){
							
							var contentList = data.contentList;

							if(data.contentList && data.contentList.length>0){
                                scope.videoType = data.contentList[0].externalRefs[0].providerCode.toLowerCase();
                                if(scope.videoType == 'youtube'){
                                    
                                    scope.vid = data.contentList[0].externalRefs[0].externalContentId;
									scope.videoList = data.contentList;
                                    
                                    for( var i in data.contentList ){
                                        scope.videoTitles[i] = data.contentList[i].title;
                                    }
                                }else if (scope.videoType == 'syco') {
                                    for( var i = 0; i < data.contentList.length; i++ ){
                                        var vid = data.contentList[i].externalRefs[0].externalContentId;

                                        TileService.getSycoVideoList(vid).then(function(data){
                                            if(data.resources[0].medias[0].hostId){
                                                scope.videoList.push(data.resources[0].medias[0]);
                                            }
											
											if(contentList.length == 1){
												scope.$parent.$broadcast('video', scope.videoList[0]);
											}
                                        }, function(error){
                                            console.log(error);
                                        })

                                        scope.videoTitles.push(data.contentList[i].title);
                                        scope.videoImages.push(data.contentList[i].creatives[0].url);
                                    }
                                }
                            }

                            scope.loading = false;
                        }, function(error){
                            console.log(error);
                        })

						angular.element('#tile_'+scope.tileId+' .video-list-wrapper').show();
                    })

					scope.videoPlay = function(video){
						scope.$parent.$broadcast('video', video);
					}

					scope.youtubeVideoPlay = function(video) {
						scope.$parent.$broadcast('youtube', video);
					}
				}
			}
		})
})();