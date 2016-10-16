var express = require('express');
var BoardModel = require("./BoardModel");

var app = express.createServer();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.cookieParser());
app.use(express.session({ secret: "gameserversession" }));
app.use(app.router);
app.use(express.static(__dirname + '/public'));


var board = new BoardModel();
board.makeTurn(2);
board.makeTurn(3);

app.get('/', function(req, res){
    if (!req.session.totalTurns) {
        req.session.totalTurns = 0;
    }

    var turn = req.query["turn"];
    if (!isNaN(turn)) {
        board.makeTurn(turn);
        req.session.totalTurns++;
    }

    res.render('board', {
        BoardModel: BoardModel,
        board: board,
        totalTurns: req.session.totalTurns,
        layout: false
    });
});

app.listen(80); 
