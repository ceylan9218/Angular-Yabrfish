/**=========================================================
 * Module: tileImage Directive.
 * Description: Directive for Image function of a tile.
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
                    imageSrc: '=',
                    tileId: '=',
                    tile: '=',
                    onComplete: '&'
                },
                templateUrl: 'app/views/partials/tile-image.html',
        		link: function(scope, elem, attrs) {
                    scope.loading = [];

                    scope.setFile = function(element) {

                        scope.currentFile = element.files[0];
                        scope.loading[scope.tileId] = true;
                        var reader = new FileReader();

                        reader.onload = function(event) {
                            scope.source = event.target.result;                           
                            scope.$apply();

                            Upload.upload({
                                url: APP_APIS['media'] + '/images',
                                data: {file: scope.currentFile},
                                headers: {'Content-Range': 'bytes 42-1233/*'}
                            }).then(function (resp) {

                                var creative = {
                                    externalId: scope.externalId,
                                    creatives: resp.data
                                }

                                scope.onComplete({creative:creative});

                                scope.loading[scope.tileId] = false;

                                angular.element('.upload-img label'+'#img_'+scope.tileId).css({'height': '100%', 'width': '100%', 'margin-top': '0', 'margin-left': '0', 'padding': '0'});
                            }, function (evt) {
                                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                                console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                            });
                        }

                        // when the file is read it triggers the onload event above.
                        reader.readAsDataURL(element.files[0]);

                        scope.$parent.$emit('file', scope.currentFile);
                    }

                    scope.showVideoList = function() {
                        scope.$parent.$broadcast('showVideoList', true);
                    }
                }
            }
        })
})();
