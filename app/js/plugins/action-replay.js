/**=========================================================
 * Module: actionReplay Directive.
 * Description: Directive for action replay panel of Tile Event.
 * Author: Marcin - 2016.1.8
 =========================================================*/
 (function() {
    'use strict';

    angular
        .module('app.action-replay', [])
        .directive("actionReplay", function(TileService) {
        	return {
        		restrict: 'E',
        		templateUrl: "app/views/partials/action-replay.html",
        		link: function(scope, elem, attrs) {
        			scope.medias = [];

        			var getMedia = function(eventId) {
        				TileService.getMedia(eventId).then(function(data){
        					scope.medias = data;
                            
                            // Set Media list height if media.length > 0
                            if(scope.medias.length > 0)
                                angular.element('.video-list ul').addClass('lists');
                            else
                                angular.element('.video-list ul').removeClass('lists');

        				}, function(error){
        					console.log(error);
        					return;
        				})
        			}

        			scope.$on('event', function(e, data){
            			scope.eventId = data.eventId;
						getMedia(scope.eventId);
            		})

                    scope.playMedia = function(media){
                        // If media is image...
                        if( media.content == null ){
                            var image = media.creatives.url;
                            scope.$parent.$parent.$parent.$parent.$broadcast('tileImg', image);
                        }else {
                            if(media.content.externalRefs[0].providerName == 'Sail TV'){
                                var vid = media.content.externalRefs[0].externalContentId;
                                TileService.getSycoVideoList(vid).then(function(data){
                                    var video = {};
                                    if(data.resources[0].medias[0].hostId){
                                        video = data.resources[0].medias[0];
                                    }

                                    video.viewMode = 'modal';
                                    scope.$parent.$parent.$parent.$parent.$broadcast('video', video);
                                }, function(error){
                                    console.log(error);
                                })
                            }else{
                                var video = media.content;
                                video.viewMode = 'modal';
                                scope.$parent.$parent.$parent.$parent.$broadcast('youtube', video);
                            }
                        }
                    }
        		}
        	}
        })
})();