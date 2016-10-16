var express = require('express');
var BoardModel = require("./BoardModel");

var app = express.createServer();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(app.router);
app.use(express.static(__dirname + '/public'));

var board = new BoardModel();
board.makeTurn(2);
board.makeTurn(3);

app.get('/', function(req, res){
    res.render('board', {
        BoardModel: BoardModel,
        board: board,
        layout: false
    });
});

app.listen(80); 
