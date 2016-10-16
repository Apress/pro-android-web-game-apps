exports = module.exports = GameSession;

var board = require("./public/js/BoardModel");
var BoardModel = board.BoardModel;

/**
 * The instance of this class is created when two players
 * agreed to play a game. The class creates a separate room for players and
 * sets up extra listeners (for turns). Once the game is finished,
 * the listeners are de-registered, and the room is abandoned. When players start a new
 * game, the new instance of the Game Session is created again, with new ID and the new room.
 *
 * @param id the unique ID of the session,
 * should be generated externally. It will be used as the name of the
 * room.
 * @param player1 the first player
 * @param player2 the second player
 * @param onEndGame the callback that will be executed once the game is finished
 */
function GameSession(id, player1, player2, onEndGame) {
    this._roomName = "game" + id;
    this._players = [player1, player2];
    this._currentPlayer = 0;

    this._boardModel = new BoardModel();
    this._onEndGame = onEndGame;

    for (var i = 0; i < this._players.length; i++) {
        this._setupGameListeners(i);
    }
}

var _p = GameSession.prototype;

_p._setupGameListeners = function(playerIndex) {
    var socket = this._players[playerIndex].socket;
    socket.join(this._roomName);

    socket.on("turn", (function(column) {
        if (playerIndex != this._currentPlayer) {
            // For some reason, the wrong player is trying to make a turn
            socket.emit("error", {
                cause: "It is not your turn now"
            });
            return;
        }

        // Let's try to make a turn and see what happens
        var turn = this._boardModel.makeTurn(column);

        // Check if that was illegal turn
        if (turn.status == BoardModel.ILLEGAL_TURN) {
            socket.emit("error", {
                cause: "This turn is illegal"
            });
            return;
        }

        // The turn is legal, we can broadcast it to both parties
        socket.manager.sockets.to(this._roomName).emit("turn", turn);

        // Next player is the "current" now
        this._currentPlayer = (this._currentPlayer + 1)%2;

        // If there's a win condition or it is a draw,
        // then players are already in lobby. Clean up listeners.
        if (turn.status == BoardModel.WIN || turn.status == BoardModel.DRAW) {
            // End game, leave room and de-register listeners
            for (var i = 0; i < this._players.length; i++) {
                this._players[i].socket.removeAllListeners("turn");
                this._players[i].socket.leave(this._roomName);
            }
        }

        // Call the callback
        this._onEndGame();
    }).bind(this));
};