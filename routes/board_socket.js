var rooms = require('./commons/rooms');
// export function for listening to the socket
module.exports = function (socket) {

  var user;

  socket.on('user:join', function(data, fn){
    var board_id = data.board_id;
    var room = rooms.get_room(board_id);
    if (room) {
      socket.join(board_id);
      socket.board_id = board_id;
      // var user = users.getNewUser();
      user = room.createUser();
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
    socket.broadcast.to(socket.board_id).emit('send:message', {
      user: user.name,
      text: data.message
    });
  });

  // validate a user's name change, and broadcast it on success
  socket.on('change:name', function (data, fn) {
    var room = rooms.get_room(socket.board_id);
    room.changeUserName(data.userId, data.name);

    socket.broadcast.to(socket.board_id).emit('change:name', {
      id: data.userId,
      newName: data.name
      });

    fn(true);
  });

  // clean up when a user leaves, and broadcast it to other users
  socket.on('disconnect', function () {
    var room = rooms.get_room(socket.board_id);
    var newAdminId = room.removeUser(user.id);
    socket.broadcast.emit('user:left', {
      id: user.id,
      newAdminId: newAdminId
    });
  });
};