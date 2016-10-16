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

server.listen(80);

var maxUserId = 0;
var users = {};

io.sockets.on("connection", function (socket) {
    var userId = addUser(socket);

    socket.on("disconnect", function () {
        socket.broadcast.emit("user-left", users[userId]);
        delete users[userId];
    });
});

/**
 * Registers the user on the server. Notifies everybody that
 * he joined the lobby, sends the list of the online users
 * to the newly connected one.
 * @param socket the socket object of the connected client
 * @returns the ID of the newly created user
 */
function addUser(socket) {
    var userId = maxUserId++;
    var userName = "User " + userId;

    var user = {id: userId, name: userName, status: "ready"};
    users[userId] = user;

    socket.emit("info", "You have connected");
    socket.emit("user-list", { users: users });
    socket.broadcast.emit("user-joined", user);
    return userId;
}