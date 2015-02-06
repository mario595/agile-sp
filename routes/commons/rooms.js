var rooms = (function(){
	var crypto = require('crypto');
	var rooms = [];
	var index = 0;
	var User = function(isAdmin){
		this.id = getRandomKey();
		this.name = 'Guest_'+this.id;
		this.isAdmin = isAdmin || false;
	};

	function getRandomKey() {
		return crypto.randomBytes(4).toString('hex').toUpperCase();
	}
	var Room = function() {
		this.id = getRandomKey();
		this.users = [];
		this.stories = [];
		this.createUser = function() {
			var user = new User(this.users.length==0);
			this.users.push(user);
			return user;
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