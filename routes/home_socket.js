var rooms = require('./commons/rooms');

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