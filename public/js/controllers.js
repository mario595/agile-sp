function AppCtrl($scope, socket, info) {
  //Initialize Socket
  socket.connect('/board');

  // Socket listeners
  // ================

  socket.on('connect', function() {
    socket.emit('user:join', 
                {board_id:$scope.boardId},
                function(data) {
                  $scope.currentUserId = data.user.id;
                  $scope.users = data.room.users,
                  $scope.stories = data.room.stories;
                });
  });

  socket.on('init', function (data) {
    $scope.currentUserId = data.user.id;
    $scope.users = data.room.users;
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
    changeName(data.id, data.newName);
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
    if (data.newAdminId) {
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
      result[0].polls.push({results: []});
      //Show the opened story
      $scope.selectedStory = result[0];
    }
  });

  socket.on('close:story', function(data){
    var result = $scope.stories.filter(function(obj){
      return obj.open;
    });

    if (result.length > 0) {
      var story = result[0];
      //Save my vote
      var lastPollIndex = story.polls.length - 1;
      story.polls[lastPollIndex].results.push($scope.myVote);
      //Send vote
      socket.emit('vote:story', {
        storyId: story.id,
        vote: $scope.myVote
      });
      //Close Story
      story['open'] = false;
    }
  });

  socket.on('vote:story', function(data) {
    var result = $scope.stories.filter(function(obj){
      return obj.id==data.storyId;
    });

    if(result.length > 0) {
      var story = result[0]
      var lastPollIndex = story.polls.length - 1;
      story.polls[lastPollIndex].results.push(data.vote);
    }
  });

  // Private helpers
  // ===============

  var changeName = function (id, newName) {
    // rename user in list of users
    var i;
    var oldName;
    for (i = 0; i < $scope.users.length; i++) {
      if ($scope.users[i].id === id) {
        oldName = $scope.users[i].name;
        $scope.users[i].name = newName;
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
  $scope.currentUserId = -1;
  $scope.valueOptions = [0,1,2,3,5,8,13,20];
  $scope.alerts = [];
  $scope.users = [];
  $scope.currentPoll = 1;
  $scope.boardId=info.boardId;


  $scope.showNewStoryTab = function () {
    $('#tabs a[href="#create-story"]').tab('show');
  };

  $scope.changeName = function () {
    //Change name
    var result = $scope.users.filter(function(obj){
      return obj.id == $scope.currentUserId;
    });
    if (result.length > 0) {
      result[0].name = $scope.newName;
    }
    //Notify server name change
    socket.emit('change:name', {
      name: $scope.newName,
      userId: $scope.currentUserId
    }, function (result) {
      if (!result) {
        alert('There was an error changing your name');
      } else {

        changeName($scope.name, $scope.newName);

        $scope.name = $scope.newName;
        $scope.newName = '';
      }
    });
    $scope.showChangeNameForm = false;
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
    $scope.addNewStory = false;
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
          $scope.selectedStory.polls.push({results: []});
          $scope.currentPoll = $scope.selectedStory.polls.length;
          $scope.selectedStory['open'] = true;  
        }
      });
    } else {
      $scope.alerts.push({type:'danger', msg: 'You cannot open more than one story!'});
    }
  };

  $scope.currentUser = function() {
    var result = $scope.users.filter(function(obj){
      return obj.id == $scope.currentUserId;
    });
    if (result.length > 0) {
      return result[0];
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
      var lastPollIndex = storyToClose.polls.length - 1;
      storyToClose.polls[lastPollIndex].results.push($scope.myVote);
      //Notify close story to server (TODO include on this calling my vote0)
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

//Controller for the landing page
function startCtrl($scope, $window, socket){
  //Initialize Socket
  socket.connect('/home');
  $scope.rooms = [];
  //TO BE REMOVED: Get list of all rooms created
  socket.on('init', function (data) {
    $scope.rooms = data.rooms;
  });

  $scope.createBoard = function() {
    socket.emit('create:room', {}, function(room){
      $scope.rooms.push(room);
      $window.location.href = '/board/'+room.id;
    });
  };
}
