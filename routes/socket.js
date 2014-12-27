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


//Stories
var stories = (function() {
  var stories = [];
  var lastIndex = 0;

  var openedStoryIndex = -1;

  var create = function(name) {
    var story = {};
    story.name = name;
    story.id = lastIndex++;
    story.votes = [];
    stories[story.id] = story;
    return story;
  };

  var open = function(id) {
    if (id < lastIndex) {
      openedStoryIndex = id;
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

// export function for listening to the socket
module.exports = function (socket) {
  var user = users.getNewUser();

  // send the new user their name and a list of users and stories
  socket.emit('init', {
    user: user,
    users: users.getAll(),
    stories: stories.get()
  });

  // notify other clients that a new user has joined
  socket.broadcast.emit('user:join', {
    user: user
  });

  //Story creation
  socket.on('create:story', function (data, fn){
    var story = stories.create(data.name);
    //Notify all that a new story has been created
    socket.broadcast.emit('create:story', story);
    fn(story);
  });

  //Story Open
  socket.on('open:story', function (data, fn){
    stories.open(data.id);
    //Notify that the story has been opened
    socket.broadcast.emit('open:story', {
      id:data.id
    });
    fn(true);
  });

  //Story Close
  socket.on('close:story', function(data){
    stories.close();
    //Notify that the story has been closed
    socket.broadcast.emit('close:story');
  });

  //Story vote
  socket.on('vote:story', function(data){
      var result = stories.get().filter(function(obj){
        return obj.id==data.storyId;
      });
      if (result.length > 0) {
        result[0].votes.push(data.vote);
        socket.broadcast.emit('vote:story', {
          storyId: data.storyId,
          vote: data.vote
        });
      }
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