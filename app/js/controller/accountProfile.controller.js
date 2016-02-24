/**=========================================================
 * Module: accountProfileController
 * Description: Controller for account profile page.
 * Author: Marcin - 2016-02-09
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('app.account-detail', ['ngAnimate', 'ui.bootstrap', 'ngFileUpload'])
        .controller('accountProfileController', accountProfileController);

    function accountProfileController($scope, $rootScope, APP_APIS, ViewerService, AccountService, LookupService, $state) {

        if(!$rootScope.user)
            return;

        $scope.accountId = $state.params.id;
        $scope.account = {};

        $scope.getAccount = function() {
            $scope.cacheAccounts = AccountService.cacheAccounts();

            if($scope.cacheAccounts.length == 0){
                ViewerService.getAccounts($rootScope.user.externalId).then(function (data) {
                    var cacheCount;
                    for (var i in data) {
                        cacheCount = AccountService.addCache(data[i].account);
                    }

                    $scope.account = AccountService.setCurrentAccount($scope.accountId);
                    setAccountAttr($scope.account);
                }, function (error) {
                    console.log(error);
                    return;
                });
            }else{
                $scope.account = AccountService.setCurrentAccount($scope.accountId);
                setAccountAttr($scope.account);
            }
        }

        var setAccountAttr = function(account){
            LookupService.getAccountTypes().then(function(data){
                for(var i in data){
                    if(data[i].id == account.accountTypeId)
                        $scope.account.type = data[i].fullName;
                }
            }, function(error){
                console.log(error);
                return;
            })

            for(var i in account.accountContacts){
                if(account.accountContacts[i].contactType == 'Web')
                    $scope.account.contact_web = account.accountContacts[i].attributeValueText;
                else if(account.accountContacts[i].contactType == 'eMail')
                    $scope.account.contact_email = account.accountContacts[i].attributeValueText;
                else if(account.accountContacts[i].contactType == 'Phone')
                    $scope.account.contact_phone = account.accountContacts[i].attributeValueText;
            }

            for(var i in account.accountAttributes){
                if(account.accountAttributes[i].attribute == 'BIO')
                    $scope.account.attr_bio = account.accountAttributes[i].attributeValueText;
            }
        }


        // --------------------------------------------------------------------
        // Call Back Function for Image Upload - Used to update Account Panel
        // --------------------------------------------------------------------
        $scope.onComplete = function (creative) {


            var currClub = ViewerService.setCurrentClub(creative.externalId);

            var currAccount = currClub.account;
            //--------------------------------------------------------
            // Update the Image
            //--------------------------------------------------------
            currAccount.accountLogoUrl  = creative.creatives.url;

            AccountService.updateAccount(currAccount).then(function (data) {
                console.log("Successful Update Account");
                ViewerService.UpdateClub(creative.externalId,'accountLogoUrl',creative.creatives.url);
            }, function (error) {
                console.log(error);
                Flash.create('danger', 'Error! Problem Updating Image For The Account');
                return;
            })


        }

    }

})();