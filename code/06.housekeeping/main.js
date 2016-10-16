var express = require('express');
var BoardModel = require("./BoardModel");
var nodemailer = require("nodemailer");
var fs = require("fs");

var loggerStream;
var app = express.createServer();

// Uncomment this line to see, how the application behaves in production
// app.set("env", "production");

// Every environment has the same settings for views
app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
});

// For production we want logs to be written to the file and have the verbose format
app.configure("production", function() {
    loggerStream = fs.createWriteStream(__dirname + "/node.log", { flags: 'a'});
    app.use(express.logger({
        format: "default",
        stream: loggerStream
    }));
});

// For development, we don't use logger at all

// Main stack is the same for both environments
app.configure(function() {
    app.use(express.cookieParser());
    app.use(express.session({ secret: "gameserversession" }));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

// Write logs and hide pages - only for production
app.configure("production", function() {
    app.use(function(err, req, res, next) {
            loggerStream.write(err.stack);
            next(err);
        }
    );

    // Send the email to the team
    app.use(function(err, req, res, next) {
        var transport = nodemailer.createTransport("SMTP", {
            service: "Gmail",
            auth: {
                user: "juriy.bura@gmail.com",
                pass: "water;00"
            }
        });
        transport.sendMail({
            from : "node@juriy.com", // from
            to : "juriy.bura@gmail.com", // to
            subject : "Error report", // subject
            body: "We got error here!\n" + err.stack // error description
        }, function(error, responseStatus){
            if(!error){
                console.log(responseStatus.message); // response from the server
            } else {
                console.log("ERROR " + error);
            }
        });
        next(err);
    });

    // Render a nice page to the user
    app.use(function(err, req, res, next) {
        res.render("error", {layout: false});
    });
});

// Development is fine with the standard error handling
app.configure("development", function() {
    app.use(express.errorHandler());
});

var board = new BoardModel();
board.makeTurn(2);
board.makeTurn(3);

app.get('/', function(req, res) {
    if (!req.session.totalTurns) {
        req.session.totalTurns = 0;
    }

    var turn = req.query["turn"];
    if (!isNaN(turn)) {
        board.makeTurn(turn);
        req.session.totalTurns++;
    }

    var err = req.query["err"];
    if (err) {
        foo.bar = baz;
    }

    res.render('board', {
        BoardModel: BoardModel,
        board: board,
        totalTurns: req.session.totalTurns,
        layout: false
    });
});

app.listen(80); 
