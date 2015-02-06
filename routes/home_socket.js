var rooms = (function(){
	var crypto = require('crypto');
	var rooms = [];
	var index = 0;
	var getAll = function() {
		return rooms;
	};

	function getRandomKey() {
		return crypto.randomBytes(4).toString('hex').toUpperCase();
	}
	
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

module.exports = function (socket) {
	socket.emit('init', {
	    rooms: rooms.getAll()
	  });
	socket.on('create:room', function (data, fn){
		var room = rooms.createRoom();
		socket.broadcast.emit('create:room', room);
		fn(room);
	});

};