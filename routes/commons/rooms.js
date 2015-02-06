var rooms = (function(){
	var crypto = require('crypto');
	var rooms = [];
	var index = 0;
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
			this.polls.push({});
		}
	}

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
			return obj.id == room_id;
		});
		if (result.length>0) {
			return result[0];
		}
	}

	return {
		getAll: getAll,
		createRoom: createRoom,
		get_room: get
	};
}());



module.exports = rooms;