var express = require("express");
var http = require("http");

var app = express();
var server = http.createServer(app);
var io = require("socket.io").listen(server, {
    "polling duration": 10
});

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: "gameserversession" }));
app.use(app.router);
app.use(express.static(__dirname + "/public"));
app.use(express.errorHandler());

app.get("/", function(req, res) {
    res.sendfile(__dirname + "/public/index.html"); 
});

var maxUserId = 0;
io.sockets.on("connection", function (socket) {
    var userId = maxUserId++;
    var userName = "User " + userId;
    var user = {id: userId, name: userName};

    socket.emit("info", { text: "You have connected" });
    socket.broadcast.emit("user-joined", user);

    socket.on("disconnect", function () {
        socket.broadcast.emit("user-left", user);
    });
});

server.listen(80);