/**=========================================================
 * Module: imageUpload Directive.
 * Description: Directive for choose and upload Image.
 * Author: Marcin - 2015.12.28
 =========================================================*/
 (function() {
    'use strict';

    angular
        .module('app.img-upload', [])
        .directive("imgUpload", function(Upload, APP_APIS, Flash, AccountService) {
        	return {
        		restrict: 'E',
                scope: {
                    account: '='
                },
        		template: '<label for="file-input"><img src="app/img/upload-photo.png"/ ng-src="{{source}}"></label>' +
                          '<input id="file-input" class="file" type="file" uploader="form.uploader" onchange="angular.element(this).scope().setFile(this)" accept="image/*"/>',
        		link: function(scope, elem, attrs) {
                    scope.setFile = function(element) {

                        scope.currentFile = element.files[0];
                        var reader = new FileReader();

                        reader.onload = function(event) {
                            scope.source = event.target.result;
                            scope.$apply();

                            Upload.upload({
                                url: APP_APIS['media'] + '/images',
                                data: {file: scope.currentFile},
                                headers: {'Content-Range': 'bytes 42-1233/*'}
                            }).then(function (resp) {
                                var params = {
                                    accountTypeId: scope.account.accountTypeId,
                                    externalId: scope.account.externalId, 
                                    name: scope.account.name,
                                    accountLogoUrl: resp.data.url,
                                    services: scope.account.services,
                                    organizations: scope.account.organizations,
                                    active: scope.account.active
                                }

                                AccountService.updateAccount(params).then(function(data){
                                    console.log("Successful Update Account");
                                }, function(error){
                                    console.log(error);
                                    return;
                                })
                            }, function (resp) {
                                console.log('Error status: ' + resp.status);
                                Flash.create('danger', 'Error! Cannot create new account.');
                            }, function (evt) {
                                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                                console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                            });
                        }

                        // when the file is read it triggers the onload event above.
                        reader.readAsDataURL(element.files[0]);

                        scope.$parent.$emit('file', scope.currentFile);
                    }
                }
            }
        })
})();        
