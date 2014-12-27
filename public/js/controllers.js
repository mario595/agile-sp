function AppCtrl($scope, socket) {

  // Socket listeners
  // ================

  socket.on('init', function (data) {
    $scope.name = data.name;
    $scope.users = data.users;
    $scope.stories = data.stories;
  });

  socket.on('user:join', function (data) {
    $scope.messages.push({
      user: 'log',
      text: 'User ' + data.user.name + ' has joined.'
    });
    $scope.users.push(data.user);
  });

  socket.on('change:name', function (data) {
    changeName(data.oldName, data.newName);
  });

  socket.on('create:story', function (data) {
    $scope.stories.push(data);
  });

  // add a message to the conversation when a user disconnects or leaves the room
  socket.on('user:left', function (data) {
    var i, user;
    //Find the user that left and remove from the scope
    for (i = 0; i < $scope.users.length; i++) {
      user = $scope.users[i];
      if (user.id === data.id) {
        $scope.users.splice(i, 1);
        break;
      }
    }
    //check if we have a new admin
    if (data.newAdminId > -1) {
      var result = $scope.users.filter(function(obj){
        return obj.id == data.newAdminId;
      });
      if (result.length > 0) {
        result[0].isAdmin = true;
      }
    }

  });

  socket.on('open:story', function(data){
    var result = $scope.stories.filter(function(obj){
      return obj.id==data.id;
    });
    if (result.length > 0) {
      result[0]['open'] = true;
      $scope.selectedStory = result[0];
    }
  });

  socket.on('close:story', function(data){
    var result = $scope.stories.filter(function(obj){
      return obj.open;
    });

    if (result.length > 0) {
      //Save my vote
      result[0].votes.push($scope.myVote);
      //Send vote
      socket.emit('vote:story', {
        storyId: result[0].id,
        vote: $scope.myVote
      });
      //Close Story
      result[0]['open'] = false;
    }
  });

  socket.on('vote:story', function(data) {
    var result = $scope.stories.filter(function(obj){
      return obj.id==data.storyId;
    });

    if(result.length > 0) {
      result[0].votes.push(data.vote);
    }
  });

  // Private helpers
  // ===============

  var changeName = function (oldName, newName) {
    // rename user in list of users
    var i;
    for (i = 0; i < $scope.users.length; i++) {
      if ($scope.users[i] === oldName) {
        $scope.users[i] = newName;
      }
    }
    $scope.messages.push({
      user: 'log',
      text: 'User ' + oldName + ' is now known as ' + newName + '.'
    });
  }

// Methods published to the scope
  // ==============================
  //Initialize scope
  $scope.messages = [];
  $scope.stories = [];
  $scope.selectedStory;
  $scope.valueOptions = [0,1,2,3,5,8,13,20]
  $scope.alerts = []

  $scope.showNewStoryTab = function () {
    $('#tabs a[href="#create-story"]').tab('show');
  };

  $scope.changeName = function () {
    socket.emit('change:name', {
      name: $scope.newName
    }, function (result) {
      if (!result) {
        alert('There was an error changing your name');
      } else {

        changeName($scope.name, $scope.newName);

        $scope.name = $scope.newName;
        $scope.newName = '';
      }
    });
  };

  $scope.showCurrentStory = function() {
    return $scope.selectedStory !==undefined;
  };

  $scope.createStory = function() {
    socket.emit('create:story', {
      name : $scope.newStoryName
    }, function(newStory){
        $scope.stories.push(newStory);
    });
    $scope.newStoryName = '';
  };

  $scope.selectStory = function(story) {
    $scope.selectedStory = story;
  }

  $scope.openStory = function() {
    //Check if there is already a opened story
    var result = $scope.stories.filter(function(obj){
      return obj.open;
    });
    if(result.length==0) {
      //Notify open story to server
      socket.emit('open:story', {
        id:$scope.selectedStory.id
      }, function (success) {
        if(success) {
          $scope.selectedStory['open'] = true;  
        }
      });
    } else {
      $scope.alerts.push({type:'danger', msg: 'You cannot open more than one story!'});
    }
  };

  $scope.closeStory = function() {
    //Search open story
    var result = $scope.stories.filter(function(obj){
      return obj.open;
    });
    if(result.length > 0) {
      var storyToClose = result[0];
      //Save my vote
      storyToClose.votes.push($scope.myVote);
      //Notify close story to server
      socket.emit('close:story',{
        storyId: storyToClose.id
      });
      //Close local story
      storyToClose.open = false;
      //Send my vote
      socket.emit('vote:story', {
        storyId: storyToClose.id,
        vote: $scope.myVote
      });
    }
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

}
