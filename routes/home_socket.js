var rooms = require('./commons/rooms');

module.exports = function (socket) {
	socket.on('create:room', function (data, fn){
		var room = rooms.createRoom();
		//TODO: We are not going to need to broadcast the new room.
		socket.broadcast.emit('create:room', room);
		fn(room);
	});

};