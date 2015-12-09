/**=========================================================
 * Module: FileService.
 * Description: Service for File management.
 * Author: Ryan - 2015.12.8
 =========================================================*/
 (function() {
    'use strict';
    
    angular
        .module('app.file', [])
        .service('FileService', FileService)

        function FileService($http, APP_APIS, $q){
        	return{
        		upload: function(file){

        		}
        	}
        }

})();