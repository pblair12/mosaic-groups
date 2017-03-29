/* global angular */
angular.module('app').controller('groupListCtrl', function ($scope, $window, $location, $filter, $q, $modal, ngTableParams, audienceTypes, daysOfTheWeek, availableTopics, groupService, identityService, notifierService, settingsService) {
    $scope.identityService = identityService;
    $scope.data = undefined;

    $scope.audienceTypes = angular.copy(audienceTypes, $scope.audienceTypes);
    $scope.audienceTypes.unshift("");
    $scope.audienceTypesFilter = $scope.audienceTypes[0];

    $scope.daysOfTheWeek = angular.copy(daysOfTheWeek, $scope.daysOfTheWeek);
    $scope.daysOfTheWeek.unshift("");
    $scope.dayOfTheWeekFilter = [];

    $scope.moreInfoSections = [{
        label: 'Host',
        details: 'Hey! Not ready to lead a group, but you\'ve got space to host one? Awesome! Let us know by emailing <a href="mailto:jessica@mosaicchristian.org"> jessica@mosaicchristian.org</a>'
    },
    {
        label: 'Lead',
        details: 'Hey! Interested in leading a growth group? Awesome! Fill out the application here: <br />' +
        '<a href="https://www.mosaicchristian.org/leadagroup"> www.mosaicchristian.org/leadagroup </a>' +
        '<br />We\'re looking forward to hearing from you!'
    },
    {
        label: 'Childcare',
        details: 'Hey! Looking to make some extra cash on the side? Join our team of background checked babysitters, and help make it possible for parents to connect each and every semester! Let us know by emailing <a href="mailto:jessica@mosaicchristian.org"> jessica@mosaicchristian.org</a>'
    }];

    $scope.openFilter = false;

    //populate the filter with all current days
    $scope.daysOfTheWeek.forEach(function (dayOfTheWeek) {
        if (typeof (dayOfTheWeek.id) != "undefined") {
            $scope.dayOfTheWeekFilter.push({
                id: dayOfTheWeek.id
            });
        }
    });


    $scope.availableTopics = angular.copy(availableTopics, $scope.availableTopics);
    $scope.availableTopics.unshift('');
    $scope.topicsFilter = $scope.availableTopics[0];

    $scope.childcareTypes = [
        {
            label: "Yes",
            value: true
        },
        {
            label: "No",
            value: false
        }
    ];
    $scope.childcareFilter = $scope.childcareTypes[0];

    $scope.settings = {
        disableGroups: true,
        showNextSemesterMsg: false,
        nextSemesterMsg: 'Next Semester Growth Groups Coming Soon!'
    };

    $scope.showNextSemesterMsg = function () {
        return $scope.settings.showNextSemesterMsg;
    };

    $scope.setShowNextSemesterMsg = function (value) {
        //        var settings = {};
        //        angular.copy($scope.settings, settings);
        $scope.settings.showNextSemesterMsg = value;
        settingsService.saveSettings($scope.settings).then(function (data) {
            $scope.settings = data;
        }, function (reason) {
            notifierService.error(reason);
        });
    };

    $scope.setNextSemesterMessage = function (msg) {
        //        var settings = {};
        //        angular.copy($scope.settings, settings);
        $scope.settings.nextSemesterMsg = msg;
        settingsService.saveSettings($scope.settings).then(function (data) {
            $scope.settings = data;
            notifierService.notify("The new message: '" + msg + "' will be shown to everyone")
        }, function (reason) {
            notifierService.error(reason);
        });
    };

    $scope.setDatesMessage = function (msg) {
        //        var settings = {};
        //        angular.copy($scope.settings, settings);
        $scope.settings.datesMsg = msg;
        settingsService.saveSettings($scope.settings).then(function (data) {
            $scope.settings = data;
            notifierService.notify("The new date message: '" + msg + "' will be shown to everyone")
        }, function (reason) {
            notifierService.error(reason);
        });
    };

    $scope.tableFilter = {};
    $scope.tableFilterStrict = {};
    $scope.updateFilter = function (filterName, filterValue) {
        if (filterValue === "" || filterValue === "ALL" || filterValue === "EITHER") {
            delete $scope.tableFilter[filterName];
            delete $scope.tableFilterStrict[filterName];
        } else if (filterName === "audienceType" || filterName === "childcare" || filterName === "topics") {
            $scope.tableFilterStrict[filterName] = filterValue;
        } else if (filterName === "open") {
            $scope.openFilter = filterValue;
        } else {
            $scope.tableFilter[filterName] = filterValue;
        }

        $scope.tableParams.reload();
    };


    $scope.$watch(function (scope) {
        return scope.dayOfTheWeekFilter;
    }, function () {
        console.log('dowFilterChanged', $scope.dayOfTheWeekFilter);
        $scope.tableParams.reload();
    }, true);

    $scope.tableParams = new ngTableParams({
        page: 1, // show first page
        count: 100, // count per page
        sorting: function (data) {
            switch (data.dayOfTheWeek) {
                case "6-Week Groups":
                    return 1;
                    break;
                case "Sunday":
                    return 2;
                    break;
                case "Monday":
                    return 3;
                    break;
                case "Tuesday":
                    return 4;
                    break;
                case "Wednesday":
                    return 5;
                    break;
                case "Thursday":
                    return 6;
                    break;
                case "Friday":
                    return 7;
                    break;
                case "Saturday":
                    return 8;
                    break;
            }
        }
    }, {
            counts: [],
            total: 0, // length of $scope.groups
            groupBy: 'dayOfTheWeek',
            getData: function ($defer, params) {
                groupService.getGroups().$promise.then(function (data) {
                    $scope.data = data;
                    params.total(data.total);

                    // apply sorting
                    var orderedData = params.sorting() ?
                        $filter('orderBy')(data, $scope.tableParams.sorting()) :
                        data;

                    // apply filtering/searching based on any text in the given column
                    orderedData = params.filter() ?
                        $filter('filter')(orderedData, $scope.tableFilter, "false") :
                        orderedData;
                    // apply the strict filters
                    orderedData = params.filter() ?
                        $filter('filter')(orderedData, $scope.tableFilterStrict, function (a, e) {
                            return a === e;
                        }) :
                        orderedData;

                    // apply the day of the week filter
                    orderedData = params.filter() ?
                        $filter('filter')(orderedData, function (group) {

                            var shouldDisplay = false;

                            $scope.dayOfTheWeekFilter.forEach(function (dayOfTheWeekFilterElem) {
                                if (dayOfTheWeekFilterElem.id || dayOfTheWeekFilterElem.id > -1) {
                                    var dayOfTheWeekLabel = daysOfTheWeek[dayOfTheWeekFilterElem.id].label;

                                    if (dayOfTheWeekLabel === group.dayOfTheWeek) {
                                        shouldDisplay = true;
                                    }
                                }
                            });

                            return shouldDisplay;
                        }) :
                        orderedData;

                    // apply openFilter. If the checkbox is checked, then we 
                    // should be not showing groups that are disabled or full
                    orderedData = params.filter() ?
                        $filter('filter')(orderedData, function (group) {

                            if ($scope.openFilter === false) {
                                return true;
                            } else {
                                return (!$scope.groupIsFull(group) && !$scope.groupIsDisabled(group));
                            }

                        }) :
                        orderedData;

                    $defer.resolve(
                        orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count())
                    );
                });
            }
        });

    // weird fix for the bug: typeerror cannot set property $groups of null
    // See http://stackoverflow.com/questions/22892908/ng-table-typeerror-cannot-set-property-data-of-null
    $scope.tableParams.settings().$scope = $scope;

    $scope.joinGroup = function (group) {
        $location.path('/views/groupJoin/group-join/' + group._id);
    };

    $scope.showGroupFull = function (group) {
        $location.path('/views/groupJoin/group-full/' + group._id);
    };

    $scope.editGroup = function (group) {
        $location.path('/views/groupCreateOrEdit/group-create-or-edit/' + group._id);
    };

    $scope.deleteGroup = function (group) {
        var modalInstance = $modal.open({
            templateUrl: '/partials/groupList/confirm-delete-group-modal',
            controller: confirmDeleteGroupCtrl,
            resolve: {
                group: function () {
                    return group;
                }
            }
        });
        modalInstance.result.then(function () {
            $scope.tableParams.reload();
        });
    };

    $scope.canEdit = function (group) {
        var canEditGroup = false;
        if (!identityService.isAuthenticated()) {
            canEditGroup = false;
        } else if (identityService.isAdmin()) {
            canEditGroup = true;
        } else if ($scope.userIsLeaderOfGroup(identityService.currentUser, group)) {
            canEditGroup = true;
        }
        return canEditGroup;
    };

    $scope.groupIsDisabled = function (group) {
        return group.disabled;
    };

    $scope.groupIsFull = function (group) {
        return group.members.length >= group.memberLimit;
    };

    $scope.groupsDisabled = function () {
        return $scope.settings.disableGroups;
    };

    $scope.userIsLeaderOfGroup = function (user, group) {
        var canEditGroup = false;
        for (var i = 0; i < group.leaders.length; i++) {
            var leader = group.leaders[i];
            if (user._id === leader._id) {
                canEditGroup = true;
            }
        }
        return canEditGroup;
    };

    $scope.emailGroupReportToSelf = function () {
        groupService.emailGroupReportToSelf().$promise.then(function () {
            notifierService.notify('Group Report email sent');
            $scope.tableParams.reload();
        }, function (reason) {
            notifierService.error(reason);
        });
    };

    $scope.emailUniqueReportToSelf = function () {
        groupService.emailUniqueReportToSelf().$promise.then(function () {
            notifierService.notify('Unique Member Report email sent');
            $scope.tableParams.reload();
        }, function (reason) {
            notifierService.error(reason);
        });
    };

    $scope.getSettings = function () {
        settingsService.getSettings().$promise.then(function (data) {
            $scope.settings = data;
        }, function (reason) {
            notifierService.error(reason);
        });
    };

    $scope.disableGroups = function (disable) {
        //        var settings = {};
        //        angular.copy($scope.settings, settings);
        $scope.settings.disableGroups = disable;
        settingsService.saveSettings($scope.settings).then(function (data) {
            $scope.settings = data;
        }, function (reason) {
            notifierService.error(reason);
        });
    };

    var inArray = Array.prototype.indexOf ?
        function (val, arr) {
            return arr.indexOf(val);
        } :
        function (val, arr) {
            var i = arr.length;
            while (i--) {
                if (arr[i] === val) return i;
            }
            return -1;
        };

    $scope.getSettings();

    $scope.startNewSemester = function (semesterName) {
        groupService.startNewSemester(semesterName)
            .then(function () {
                $window.location.reload();
            })
            .catch(function (err) { notifierService.error(err); });
    };

    groupService.getCurrentSemester()
        .then(function (name) {
            $scope.semesterName = name;
        });

    $scope.moreInfo = function (info) {
        $modal.open({
            template: '<div>' +
            '<div class="modal-header"><h3>{{info.label}}</h3></div>' +
            '<div class="modal-body" ng-bind-html="info.details"></div>' +
            '<div class="modal-footer"><button class="btn" ng-click="ok()">Ok</button></div>' +
            '</div>',
            controller: function ($scope, $modalInstance, $sanitize) {
                $scope.info = info;

                $scope.ok = function () {
                    $modalInstance.close();
                };
            },
            resolve: {
                group: function () {
                    return $scope.group;
                },
                memberToRemove: function () {
                    return $scope.memberToRemove;
                }
            }
        });

    };
});

var confirmDeleteGroupCtrl = function ($scope, $modalInstance, groupService, notifierService, group) {
    $scope.group = group;
    $scope.confirm = function () {
        groupService.deleteGroup(group).then(function () {
            notifierService.notify('Group \'' + group.title + '\' has been deleted');
        }, function (reason) {
            notifierService.error(reason);
        });
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
};

