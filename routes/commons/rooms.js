var rooms = (function(){
	var crypto = require('crypto');
	var rooms = [];
	var User = function(isAdmin) {
		this.id = getRandomKey();
		this.name = 'Guest_'+this.id;
		this.isAdmin = isAdmin || false;
	};

	var Story = function(name) {
		this.id = getRandomKey();
		this.name = name;
		this.polls = [];

		this.open = function() {
			this.polls.push({results: []});
		};

		this.vote = function(vote) {
			lastPollIndex = this.polls.length - 1;
			this.polls[lastPollIndex].results.push(vote);
		};
	};

	function getRandomKey() {
		return crypto.randomBytes(4).toString('hex').toUpperCase();
	}
	var Room = function() {
		this.id = getRandomKey();
		this.users = [];
		this.stories = [];
		this.openedStoriesIds = [];

		this.createUser = function() {
			var user = new User(this.users.length == 0);
			this.users.push(user);
			return user;
		};

		this.removeUser = function(id) {
			var newAdminId;
		    for (var i = this.users.length - 1; i >= 0; i--) {
		      if (this.users[i].id==id) {
		        //check if we need a new admin
		        newAdmin = this.users[i].isAdmin && this.users.length > 1;
		        //remove
		        this.users.splice(i, 1);
		        //make new admin to the new first user
		        if (newAdmin) {
		          this.users[0].isAdmin = true;
		          newAdminId = this.users[0].id;
		        }
		        break;
		      }
		    }
		    return newAdminId;
		};

		this.changeUserName = function(userId, newName) {
			var result = this.users.filter(function(obj) {
				return obj.id = userId;
			});
			if (result.length > 0) {
				result[0].name = newName;
			}
		};

		this.createStory = function(name) {
			var story = new Story(name);
			this.stories.push(story);
			return story;
		};

		this.getStory = function(id) {
			var result = this.stories.filter(function(obj) {
				return obj.id == id;
			});

			if (result.length > 0) {
				return result[0];
			}
		};

		this.openStory = function(story_id) {
			if (this.openedStoriesIds.indexOf(story_id) == -1) {
				this.openedStoriesIds.push(story_id);
				this.getStory(story_id).open();
			}
		};

		this.closeStory = function(story_id) {
			var index = this.openedStoriesIds.indexOf(story_id);
			index = (index == -1 && this.openedStoriesIds.length > 0) ?
					index = 0 :
					-1;
			if (index > -1) {
				this.openedStoriesIds.slice(index, 1);
			}
		};

		
	};

	var getAll = function() {
		return rooms;
	};

	var createRoom = function() {
		var room = new Room();
		rooms.push(room);
		return room;
	};

	var get = function(room_id) {
		var result = rooms.filter(function(obj){
			return obj.id.toUpperCase() == room_id.toUpperCase();
		});
		if (result.length>0) {
			return result[0];
		}
	};

	return {
		getAll: getAll,
		createRoom: createRoom,
		get_room: get
	};
}());



module.exports = rooms;