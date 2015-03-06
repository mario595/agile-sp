/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index');
};

exports.board = function(req, res){
	res.render('board', { board_id:req.params.board_id });
};