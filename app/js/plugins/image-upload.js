/**=========================================================
 * Module: imageUpload Directive.
 * Description: Directive for choose and upload Image.
 * Author: Marcin - 2015.12.28
 =========================================================*/
 (function() {
    'use strict';

    angular
        .module('app.img-upload', [])
        .directive("imgUpload", function() {
        	return {
        		restrict: 'E',        		
        		template: '<label for="file-input"><img src="app/img/upload-photo.png"/ ng-src="{{source}}"></label>' +
                          '<input id="file-input" class="file" type="file" uploader="form.uploader" onchange="angular.element(this).scope().setFile(this)" accept="image/*"/>',
        		link: function(scope, elem, attrs) {
                    scope.setFile = function(element) {
                        scope.currentFile = element.files[0];
                        var reader = new FileReader();

                        reader.onload = function(event) {
                          scope.source = event.target.result;
                          scope.$apply();
                        }

                        // when the file is read it triggers the onload event above.
                        reader.readAsDataURL(element.files[0]);

                        scope.$parent.$emit('file', scope.currentFile);
                    }
                }
            }
        })
})();        
