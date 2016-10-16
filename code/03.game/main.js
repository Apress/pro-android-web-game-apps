var express = require("express");
var http = require("http");
var GameSession = require("./GameSession");

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

io.sockets.on("connection", onConnection);
server.listen(80);

/**
 * Global counters and user registry
 */
var maxUserId = 0;
var maxGameId = 0;
var users = {};

/**
 * The connection handler, the "main" function of the multiplayer
 * server
 * @param socket
 */
function onConnection(socket) {
    var userId = addUser(socket);

    socket.on('challenge', function (challengedUserId, respond) {
        if (userId == challengedUserId) {
            respond({ error: "Cannot challenge self" });
        } else if (!users[challengedUserId]) {
            respond({ error: "Cannot find user " + challengedUserId });
        } else if (users[challengedUserId].status != "ready") {
            respond({ error: "User is not ready to play" });
        } else {
            startGame(users[userId], users[challengedUserId], respond)
        }
    });

    socket.on('disconnect', function () {
        console.log(users[userId].name + " disconnected");
        socket.broadcast.emit('user-left', users[userId]);
        delete users[userId];
    });
}


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
    Object.defineProperty(user, "socket", {
            value : socket,
            enumerable : false}
    );

    users[userId] = user;

    socket.emit("info", {text: "You have connected"});
    socket.emit("user-list", { users: users });
    socket.broadcast.emit("user-joined", user);
    return userId;
}

/**
 * Initiates the game between two players, starts the new game session,
 * updates statuses in lobby, listens to the end of the game event.
 * @param initiator the player who challenged the opponent (initiated the game)
 * @param target the player who was challenged
 * @param initiatorRespond the respond function to respond to
 */
function startGame(initiator, target, initiatorRespond) {
    initiator.status = target.status = "playing";

    var initGame = {
        player1: initiator,
        player2: target
    };

    initiatorRespond(initGame);
    target.socket.emit('challenged', initGame);

    var gameId = maxGameId++;

    io.sockets.emit("user-playing", initiator);
    io.sockets.emit("user-playing", target);

    new GameSession(gameId, target, initiator, function() {
        initiator.status = target.status = "ready";
        io.sockets.emit("user-ready", initiator);
        io.sockets.emit("user-ready", target);
    });
}
