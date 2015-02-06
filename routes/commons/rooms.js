var rooms = (function(){
	var crypto = require('crypto');
	var rooms = [];
	var index = 0;

	function getRandomKey() {
		return crypto.randomBytes(4).toString('hex').toUpperCase();
	}
	
	var getAll = function() {
		return rooms;
	};

	var createRoom = function() {
		nextId = getRandomKey();
		room = {
			id: nextId
		};
		rooms.push(room);
		return room;
	};

	return {
		getAll: getAll,
		createRoom: createRoom
	};
}());

module.exports = rooms;