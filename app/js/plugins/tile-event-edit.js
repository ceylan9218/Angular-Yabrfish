/**=========================================================
 * Module: eventEdit Directive.
 * Description: Directive for Event Edit of a Tile.
 * Author: Ryan - 2015.12.23
 =========================================================*/
 (function() {
    'use strict';

    angular
        .module('app.event-edit', [])
        .directive("eventEdit", ['$http', '$location', 'APP_APIS', 'LookupService', 'Flash', function($http, $location, APP_APIS, LookupService, Flash) {
            return {
                restrict: "E",
                templateUrl: "app/views/partials/event-edit.html",
                link: function(scope, elem, attrs) {
                    scope.$on('event', function(e, data){
                        scope.event = data.event;
                        scope.eventCount = data.length;
                        scope.editable = data.editable;
                        scope.enableEvent = data.enableEvent;
                        scope.eventStep = 1;
                        scope.selectedAll = false;

                        if(scope.event == 'addEvent'){
                            scope.eventName = '';
                            scope.startDate = new Date();
                            scope.setEndDate(scope.startDate);
                        }else{
                            scope.eventName = scope.event.name;
                            scope.startDate = scope.event.startDate;
                            scope.endDate = scope.event.endDate;
                        }
                    });

                    // Get Event Tile Type
                    LookupService.getEventTypes().then(function(eventtypes){
                        scope.eventtypes = eventtypes;
                    }, function(error){
                        console.log(error);
                        return;
                    })
                    
                    scope.eventsAry = [];
                    scope.checkedWeekDays = [1,2];
                    //var days = scope.checkedWeekDays.length - 1;

                    scope.weekDays = [{
                      "id": 1,
                      "value": 'Sat'
                    }, {
                      "id": 2,
                      "value": 'Sun'
                    }, {
                      "id": 3,
                      "value": 'Mon'
                    }, {
                      "id": 4,
                      "value": 'Tue'
                    }, {
                      "id": 5,
                      "value": 'Wed'
                    }, {
                      "id": 6,
                      "value": 'Thu'
                    }, {
                      "id": 7,
                      "value": 'Fri'
                    }];

                    // Initial Checked boxes
                    angular.forEach(scope.weekDays, function (item) {
                        angular.forEach(scope.checkedWeekDays, function (day) {
                          if(item.id == day){
                            item.Selected = true;
                          }
                        });
                    });

                    scope.checkAll = function() {
                      if (scope.selectedAll) {
                          scope.selectedAll = false;
                          scope.checkedWeekDays = [1,2,3,4,5,6,7];
                      } else {
                          scope.selectedAll = true;
                          scope.checkedWeekDays = [];
                      }
                      angular.forEach(scope.weekDays, function (item) {
                          item.Selected = scope.selectedAll;
                      });
                    }

                    scope.open = {
                        startDate: false,
                        finishDate: false
                    };

                    scope.openCalendar = function(e, date) {
                        scope.open[date] = true;
                    };

                    // Click Next button of Event.
                    var tempStartDate = '';    
                    scope.addEvent = function() {
                        if(scope.eventStep >= scope.eventCount)
                            return;

                        if(tempStartDate == scope.startDate){
                            Flash.create('danger', 'Please select different start date.');
                            return;
                        }

                        tempStartDate = scope.startDate;
                        scope.startDate = new Date(scope.startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
                        scope.setEndDate(scope.startDate);

                        scope.eventName = scope.eventName.replace(scope.eventStep, '');
                        scope.eventName = scope.eventName + parseInt(scope.eventStep + 1);

                        scope.eventsAry.push({
                            id: scope.eventStep,
                            name: scope.eventName,
                            startDate: scope.startDate,
                            finishDate: scope.endDate
                        })

                        scope.eventStep++;
                    }

                    // Click Prev button of Event.
                    scope.popEvent = function() {
                        if(scope.eventStep <= 1)
                            return;

                        tempStartDate = '';
                        scope.startDate = new Date(scope.startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                        scope.setEndDate(scope.startDate);
                        scope.eventsAry.pop();
                        scope.eventStep--;
                    }

                    // Set finish Date when change start Date or check week days.
                    scope.setEndDate = function(date) {
                      scope.endDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
                    }

                    scope.checkEvtCount = function(){
                      if(!eventCount || eventCount < 0){
                        Flash.create('danger', 'Please input positive number!');
                        return;
                      }
                    }

                    // Click Skip Date button of Event.
                    scope.skipDate = function() {
                        scope.startDate = new Date(scope.startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
                    }

                    scope.save = function() {
                        Flash.create('success', 'Successfully saved.');
                    }
                }
            }
        }])
        .directive("checkboxGroup", function() {
            return {
                restrict: "A",
                link: function(scope, elem, attrs) {
                    // Determine initial checked boxes
                    if (scope.checkedWeekDays.indexOf(scope.day.id) !== -1) {
                        elem[0].checked = true;
                    }

                    // Update array on click
                    elem.bind('click', function() {
                        var index = scope.checkedWeekDays.indexOf(scope.day.id);
                        // Add if checked
                        if (elem[0].checked) {
                            if (index === -1) scope.checkedWeekDays.push(scope.day.id);
                        }
                        // Remove if unchecked
                        else {
                            if (index !== -1) scope.checkedWeekDays.splice(index, 1);
                        }
                        // Sort and update DOM display
                        scope.$apply(scope.checkedWeekDays.sort(function(a, b) {
                            return a - b
                        }));
                    });
                }
            }
        })
})();