// Keep track of which names are used so that there are no duplicates
// var userNames = (function () {
//   var names = {};

//   var claim = function (name) {
//     if (!name || names[name]) {
//       return false;
//     } else {
//       names[name] = true;
//       return true;
//     }
//   };

//   // find the lowest unused "guest" name and claim it
//   var getGuestName = function () {
//     var name,
//       nextUserId = 1;

//     do {
//       name = 'Guest ' + nextUserId;
//       nextUserId += 1;
//     } while (!claim(name));

//     return name;
//   };

//   // serialize claimed names as an array
//   var get = function () {
//     var res = [];
//     for (user in names) {
//       res.push(user);
//     }

//     return res;
//   };

//   var free = function (name) {
//     if (names[name]) {
//       delete names[name];
//     }
//   };

//   return {
//     claim: claim,
//     free: free,
//     get: get,
//     getGuestName: getGuestName
//   };
// }());

var users = (function() {
  var users = [];
  var nextId = 0;

  var getNewUser = function() {
    var user = {};
    user.id = nextId++;
    user.name = 'Guest_'+user.id;
    user.isAdmin = false;
    users.push(user);
    return user;
  };

  var getAll = function() {
    return users;
  };

  var free = function(id) {
    for(var i = users.length - 1; i >= 0; i--) {
      if(users[i].id===id) {
        users.splice(i, 1);
      }
    }
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
    name: user.name,
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
    fn(true);
  });

  // clean up when a user leaves, and broadcast it to other users
  socket.on('disconnect', function () {
    socket.broadcast.emit('user:left', {
      id: user.id
    });
    users.free(user.id);
  });
};