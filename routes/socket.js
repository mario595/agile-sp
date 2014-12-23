// Keep track of which names are used so that there are no duplicates
var userNames = (function () {
  var names = {};

  var claim = function (name) {
    if (!name || names[name]) {
      return false;
    } else {
      names[name] = true;
      return true;
    }
  };

  // find the lowest unused "guest" name and claim it
  var getGuestName = function () {
    var name,
      nextUserId = 1;

    do {
      name = 'Guest ' + nextUserId;
      nextUserId += 1;
    } while (!claim(name));

    return name;
  };

  // serialize claimed names as an array
  var get = function () {
    var res = [];
    for (user in names) {
      res.push(user);
    }

    return res;
  };

  var free = function (name) {
    if (names[name]) {
      delete names[name];
    }
  };

  return {
    claim: claim,
    free: free,
    get: get,
    getGuestName: getGuestName
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
    stories[story.id] = story;
    return story;
  };

  var open = function(id) {
    if (id < lastIndex) {
      openedStoryIndex = id;
    }
  }

  var close = function() {
    openedStoryIndex = -1;
  }

  var get = function() {
    var res = [];
    
    var length = stories.length;
    for(var i=0; i<length; i++) {
    	res.push({
            id: stories[i].id,
            name: stories[i].name
          });
    }
    return res;
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
  var name = userNames.getGuestName();

  // send the new user their name and a list of users and stories
  socket.emit('init', {
    name: name,
    users: userNames.get(),
    stories: stories.get()
  });

  // notify other clients that a new user has joined
  socket.broadcast.emit('user:join', {
    name: name
  });

  //Story creation
  socket.on('create:story', function (data, fn){
    var story = stories.create(data.name);
    //Notify all that a new story has been created
    socket.broadcast.emit('create:story', {
      id:story.id,
      name: story.name
    });
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

  // broadcast a user's message to other users
  socket.on('send:message', function (data) {
    socket.broadcast.emit('send:message', {
      user: name,
      text: data.message
    });
  });

  // validate a user's name change, and broadcast it on success
  socket.on('change:name', function (data, fn) {
    if (userNames.claim(data.name)) {
      var oldName = name;
      userNames.free(oldName);

      name = data.name;

      socket.broadcast.emit('change:name', {
        oldName: oldName,
        newName: name
      });

      fn(true);
    } else {
      fn(false);
    }
  });

  // clean up when a user leaves, and broadcast it to other users
  socket.on('disconnect', function () {
    socket.broadcast.emit('user:left', {
      name: name
    });
    userNames.free(name);
  });
};