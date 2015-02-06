var users = (function() {
  var users = [];
  var nextId = 0;

  var getNewUser = function() {
    var user = {};
    user.id = nextId++;
    user.name = 'Guest_'+user.id;
    user.isAdmin = users.length == 0 ? true : false;
    users.push(user);
    return user;
  };

  var getAll = function() {
    return users;
  };

  var free = function(id) {
    var newAdminId = -1;
    for (var i = users.length - 1; i >= 0; i--) {
      if (users[i].id==id) {
        //check if we need a new admin
        newAdmin = users[i].isAdmin && users.length > 1
        //remove
        users.splice(i, 1);
        //make new admin to the new first user
        if (newAdmin) {
          users[0].isAdmin = true;
          newAdminId = users[0].id;
        }
        break;
      }
    }
    return newAdminId;
  };

  return {
    free: free,
    getAll: getAll,
    getNewUser: getNewUser
  };
}());


//TODO REMOVE THIS: Stories
var stories = (function() {
  var stories = [];
  var lastIndex = 0;

  var openedStoryIndex = -1;

  var create = function(name) {
    var story = {};
    story.name = name;
    story.id = lastIndex++;
    story.polls = [];
    stories[story.id] = story;
    return story;
  };

  var open = function(id) {
    if (id < lastIndex) {
      openedStoryIndex = id;
      //Initialize new poll
      stories[openedStoryIndex].polls.push({results: []});
    }
  };

  var close = function() {
    openedStoryIndex = -1;
  };

  var get = function() {
    return stories;
  };

  return {
    create: create,
    get: get,
    open: open,
    close: close
  };
}());
var rooms = require('./commons/rooms');
// export function for listening to the socket
module.exports = function (socket) {

  socket.on('user:join', function(data, fn){
    var board_id = data.board_id;
    var room = rooms.get_room(board_id);
    if (room) {
      socket.join(board_id);
      socket.board_id = board_id;
      // var user = users.getNewUser();
      var user = room.createUser();
      fn({
        user: user,
        room: room
      });
      // notify other clients that a new user has joined
      socket.broadcast.to(board_id).emit('user:join', {
        user: user
      });
    } else {
      //TODO: Board doesn't exists error.
      console.log("Board doesn't exist: "+board_id);
    }
  });

  //Story creation
  socket.on('create:story', function (data, fn){
    var room = rooms.get_room(socket.board_id);
    var story = room.createStory(data.name);
    //Notify all that a new story has been created
    socket.broadcast.to(socket.board_id).emit('create:story', story);
    fn(story);
  });

  //Story Open
  socket.on('open:story', function (data, fn){
    var room = rooms.get_room(socket.board_id);
    room.openStory(data.id);
    //Notify that the story has been opened
    socket.broadcast.to(socket.board_id).emit('open:story', {
      id:data.id
    });
    fn(true);
  });

  //Story Close
  socket.on('close:story', function(data){
    // stories.close();
    var room = rooms.get_room(socket.board_id);
    room.closeStory(data.storyId);
    //Notify that the story has been closed
    socket.broadcast.to(socket.board_id).emit('close:story');
  });

  //Story vote
  socket.on('vote:story', function(data){
    var room = rooms.get_room(socket.board_id);
    var story = room.getStory(data.storyId);
    story.vote(data.vote);
    //Notify others clients.
    socket.broadcast.to(socket.board_id).emit('vote:story', {
      storyId: data.storyId,
      vote: data.vote
    });
  
  });

  // broadcast a user's message to other users
  socket.on('send:message', function (data) {
    socket.broadcast.emit('send:message', {
      user: user.name,
      text: data.message
    });
  });

  // validate a user's name change, and broadcast it on success
  socket.on('change:name', function (data, fn) {
    user.name = data.name;
    socket.broadcast.emit('change:name', {
      id: user.id,
      newName: user.name
      });


    fn(true);
  });

  // clean up when a user leaves, and broadcast it to other users
  socket.on('disconnect', function () {
    var newAdminId = users.free(user.id);
    socket.broadcast.emit('user:left', {
      id: user.id,
      newAdminId: newAdminId
    });
  });
};