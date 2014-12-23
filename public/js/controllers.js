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
      text: 'User ' + data.name + ' has joined.'
    });
    $scope.users.push(data.name);
  });

  socket.on('change:name', function (data) {
    changeName(data.oldName, data.newName);
  });

  socket.on('create:story', function (data) {
    $scope.stories.push({
      id: data.id,
      name: data.name
    });
  });

  // add a message to the conversation when a user disconnects or leaves the room
  socket.on('user:left', function (data) {
    var i, user;
    for (i = 0; i < $scope.users.length; i++) {
      user = $scope.users[i];
      if (user === data.name) {
        $scope.users.splice(i, 1);
        break;
      }
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

  $scope.createStory = function() {
    socket.emit('create:story', {
      name : $scope.newStoryName
    }, function(newStory){
        $scope.stories.push({
        id: newStory.id,
        name: newStory.name
      });
    });
    $scope.newStoryName = '';
  };


}
