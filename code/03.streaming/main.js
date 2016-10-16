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

var clients = [];

app.get("/lobby", function(req, res) {
    res.contentType("application/x-custom-event-stream");
    clients.push(res);
    console.log("Added client, now " + clients.length + " connected");
});
app.listen(80);

(function() {
    console.log("Notify Clients");
    notifyClients();
    setTimeout(arguments.callee, Math.floor((Math.random()*10000)));
})();

function notifyClients() {
    clients.forEach(function(res) {
        res.write("new event data");
    });
    
    // clients = []; // Do not clean the array, clients stay connected
}