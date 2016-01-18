/**=========================================================
 * Module: tileImage Directive.
 * Description: Directive for management of Video and Image of a tile.
 * Author: Marcin - 2016.1.13
 =========================================================*/
 (function() {
    'use strict';

    angular
        .module('app.tile-image', [])
        .directive("tileImage", function(Upload, Flash, APP_APIS, TileService) {
        	return {
        		restrict: 'E',
                scope: {
                    tile: '='
                },
                templateUrl: 'app/views/partials/tile-image.html',
        		link: function(scope, elem, attrs) {
                    
                    scope.getVideoList = function(){
                        var tileId = scope.tile.externalId;

                        scope.loading = true;
                        scope.videoList = [];
                        scope.videoTitles = [];
                        scope.videoImages = [];
                        scope.videoType = '';

                        scope.youtube = {
                            config: {}
                        }                      

                        TileService.getTileContent(tileId).then(function(data){
                            if(data.contentList && data.contentList.length>0){
                                scope.videoType = data.contentList[0].externalRefs[0].providerCode.toLowerCase();
                                if(scope.videoType == 'youtube'){
                                    scope.tile.vid = data.contentList[0].externalRefs[0].externalContentId;
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
                    }
                }
            }
        })
})();
