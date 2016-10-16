var app = require('express').createServer();
var BoardModel = require("./BoardModel");


var board = new BoardModel();
board.makeTurn(2);
board.makeTurn(3);

app.get('/', function(req, res){
    res.setHeader('Content-Type', 'text/plain');
    res.send(board.toString());
});

app.listen(80);