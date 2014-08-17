angular.module('app').controller('groupCreateOrEditCtrl', function($scope, $route, $location, $modal, audienceTypes, daysOfTheWeek, statusTypes, groupService, notifierService, identityService, userService, meetingTimes) {
  var groupId = $route.current.params.id;
  $scope.identity = identityService;
  $scope.group = {};
  $scope.leaderIds = [];
  $scope.users = [];

  $scope.audienceTypes = audienceTypes;
  $scope.daysOfTheWeek = daysOfTheWeek;
  $scope.meetingTimes = meetingTimes;
  $scope.statusTypes = statusTypes;

  if (groupId) {
    groupService.getGroup(groupId).$promise.then(function(data) {
      $scope.group = data;
      $scope.leaderIds = [];
      for (var i = 0; i < data.leaders.length; i++) {
        $scope.leaderIds.push(data.leaders[i]._id);
      }
    });
  } else {
    $scope.group.location = "";
    $scope.group.dayOfWeek = "";
    $scope.group.meetingTime = "";
    $scope.group.memberLimit = "";
    $scope.group.audienceType = "";
    $scope.group.childcare = true;
    $scope.leaderIds = [];
  }

  // if the current user is an admin then they have the ability to create a group
  // and assign the leader as another person otherwise the group leader will be
  // set to the person who creates the group
  userService.getUsers().$promise.then(function(data) {
    $scope.users = [];
    for (var i = 0; i < data.length; i++) {
      // create a new user to add to the list of available users
      var user = {};
      user.name = data[i].firstName + " " + data[i].lastName;
      user._id = data[i]._id;
      // get the current user index so that the current user can be added to the beginning of the list
      if ($scope.identity.currentUser._id == data[i]._id) {
        // add the current user to the beginning of the list
        $scope.users.unshift(user);
      }
      // otherwise add the user to the list
      else {
        // add the current user to the end of the list
        $scope.users.push(user);
      }
    }
  });

  $scope.saveGroup = function() {
    // if the form is valid then submit to the server
    if ($scope.groupCreateOrEditForm.$valid) {
      $scope.group.leaders = [];
      for (var i = 0; i < $scope.leaderIds.length; i++) {
        $scope.group.leaders.push($scope.leaderIds[i]);
      }
      groupService.saveGroup($scope.group).then(function(group) {
        if ($scope.group._id) {
          notifierService.notify('Group ' + $scope.group.audienceType + ' has been updated');
          $location.path('/views/groupList/group-list');
        } else {
          notifierService.notify('Group ' + $scope.group.audienceType + ' has been created');
          $location.path('/views/groupList/group-list');
        }
      }, function(reason) {
        notifierService.error(reason);
      })
    }
  }

  $scope.listMemberEmails = function() {
    var modalInstance = $modal.open({
      templateUrl: '/partials/groupCreateOrEdit/list-emails-modal',
      controller: listEmailsCtrl,
      resolve: {
        group: function () {
          return $scope.group;
        },
        title: function() {
          return "Group Member Emails"
        }
      }
    });
  }

  $scope.addMember = function(group) {
    var newMember = {
      firstName: "",
      lastName: "",
      email: "",
      status: "PENDING"
    };
    if (!$scope.group.members) {
      $scope.group.members = [];
    }
    $scope.group.members.push(newMember);
  }

  $scope.removeMember = function(memberToRemove) {
    $scope.memberToRemove = memberToRemove;

    var modalInstance = $modal.open({
      templateUrl: '/partials/groupCreateOrEdit/confirm-remove-member-modal',
      controller: confirmRemoveMemberCtrl,
      resolve: {
        group: function () {
          return $scope.group;
        },
        memberToRemove: function () {
          return $scope.memberToRemove;
        }
      }
    });
    modalInstance.result.then(function() {
      var index = $scope.group.members.indexOf(memberToRemove);
      $scope.group.members.splice(index, 1);
    });
  }
});

var listEmailsCtrl = function($scope, $modalInstance, title, group) {
  $scope.title = title;
  $scope.group = group;

  $scope.ok = function () {
    $modalInstance.close();
  };
};

var confirmRemoveMemberCtrl = function($scope, $modalInstance, group, memberToRemove) {
  $scope.memberToRemove = memberToRemove;
  $scope.confirm = function () {
    $modalInstance.close();
  };
  $scope.cancel = function () {
    $modalInstance.dismiss();
  };
}
