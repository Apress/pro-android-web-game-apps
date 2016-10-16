var express = require("express");
var app = express.createServer();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: "gameserversession" }));
app.use(app.router);
app.use(express.static(__dirname + '/public'));
app.use(express.errorHandler());

app.get('/', function(req, res) {
    res.sendfile(__dirname + "/public/index.html"); 
});

app.get("/data.json", function(req, res) {
    res.contentType("application/json");
    res.send(JSON.stringify({hello: "World"}));
});

app.listen(80);