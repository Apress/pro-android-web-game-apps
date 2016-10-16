(function(exports) {

/**
 * The BoardModel is the class that is responsible for
 * storing the current pieces of the board, validating turns
 * and reporting the win conditions.
 * @param cols number of columns in the board
 * @param rows number of rows in the board
 */
function BoardModel(cols, rows) {
	this._cols = cols || 7;
	this._rows = rows || 6;
	this._data = [];
	this._currentPlayer = BoardModel.RED;
	this._totalTokens = 0;
	
	this.reset();
}

/**
 * Ids of pieces
 */
BoardModel.EMPTY = 0;
BoardModel.RED = 1;
BoardModel.GREEN = 2;

/**
 * Game state after the turn
 */
BoardModel.NONE = 0; // No win or draw
BoardModel.WIN = 1; // The last player who just dropped a piece won
BoardModel.DRAW = 2; // No more free cells in the board - it is a draw!
BoardModel.ILLEGAL_TURN = 3; // The last attempted turn was illegal

_p = BoardModel.prototype;

/**
 * Resets the game board into the initial state: the
 * board is empty and the starting player is RED.
 */
_p.reset = function() {
	this._data = [];
	for (var i = 0; i < this._rows; i++) {
		this._data[i] = [];
		for (var j = 0; j < this._cols; j++) {
			this._data[i][j] = BoardModel.EMPTY;
		}
	}

	this._currentPlayer = BoardModel.RED;
	this._totalTokens = 0;
};

/**
 * Drops the piece in the given column. Board model itself takes care of
 * tracking the current player.
 * @param column the index of the column
 * @param piece the ID of the piece (RED or YELLOW)
 * @return the object {
 * 		status: win condition
 * 		x: the x coordinate of the new turn (undefined if turn was illegal)
 * 		y: the y coordinate of the new turn (undefined if turn was illegal)
 * 		piece: piece id (RED or GREEN)
 * }
 */
_p.makeTurn = function(column) {

    if (!this.isTurnValid(column)) {
        return { status: BoardModel.ILLEGAL_TURN };
    }

	// The color of the piece that we're dropping
	var piece = this._currentPlayer;

	// Check if there's the empty row in the
	// given column, if there's no empty row, then the
	// turn is illegal
	var row = this._getEmptyRow(column);
	if (row == -1) {
		return {
			status: BoardModel.ILLEGAL_TURN
		}
	}

	// We found the empty row, so we can drop the piece
	this._totalTokens++;
	this._data[row][column] = piece;

	// Change the next player
	this._toggleCurrentPlayer();

	// Return the successful turn together with the new
	// state of the game (NONE, WIN or DRAW)
	return {
		status: this._getGameState(column, row),
		x: column,
		y: row,
		piece: piece
	}
};

_p.isTurnValid = function(column) {
    // Check if the column is valid
    // and if there's the empty row in the
    // given column, if there's no empty row, then the
    // turn is illegal
    return (column >= 0 && column < this._cols && this._getEmptyRow(column) != -1);
};

_p.getPiece = function(col, row) {
	return this._data[row][col];
};

/**
 * Returns the number of columns in this model
 */
_p.getCols = function() {
    return this._cols;
};

/**
 * Returns the number of rows in this model
 */
_p.getRows = function() {
    return this._rows;
};

/**
 * Finds the available empty row in the given column. If the
 * column is full and there's no empty cells, return -1. In this
 * case the turn is treated as illegal (player clicked the column without
 * empty cells)
 * @param column the column index
 */
_p._getEmptyRow = function(column) {
	for (var i = this._rows - 1; i >= 0; i--) {
		if (!this.getPiece(column, i)) {
			return i;
		}
	}
	return -1;
};


/**
 * Checks for the win condition, checks how many pieces of the same color are in each
 * possible row: horizontal, vertical or both diagonals.
 * @param column the column of the last move
 * @param row the row of the last move
 * @return the game state after this turn:
 * 	NONE if the state wasn't affected
 * 	WIN if current player won the game with the last turn
 * 	DRAW if there's no emty cells in the board left
 */
_p._getGameState = function(column, row) {
	if (this._totalTokens == this._cols*this._rows)
		return BoardModel.DRAW;

	for (var deltaX = -1; deltaX < 2; deltaX++) {
		for (var deltaY = -1; deltaY < 2; deltaY++) {
			if (deltaX == 0 && deltaY == 0)
				continue;
			var count = this._checkWinDirection(column, row, deltaX, deltaY)
					+ this._checkWinDirection(column, row, -deltaX, -deltaY) + 1;
			if (count >= 4) {
				return BoardModel.WIN;
			}
		}
	}
	return BoardModel.NONE;
};

/**
 * Calculates the number of pieces of the same color in the given direction, starting
 * fromt the given point (last turn)
 * @param column starting column
 * @param row starting row
 * @param deltaX the x direction of the check
 * @param deltaY the y direction of the check
 */
_p._checkWinDirection = function(column, row, deltaX, deltaY) {
	var pieceColor = this.getPiece(column, row);
	var tokenCounter = 0;
	var c = column + deltaX;
	var r = row + deltaY;
	while(c >= 0 && r >= 0 && c < this._cols && r < this._rows &&
			this.getPiece(c, r) == pieceColor) {
		c += deltaX;
		r += deltaY;
		tokenCounter++;
	}
	return tokenCounter;
};

/**
 * Toggles the current player - from red to green and back.
 */
_p._toggleCurrentPlayer = function() {
	if (this._currentPlayer == BoardModel.RED)
		this._currentPlayer = BoardModel.GREEN;
	else
		this._currentPlayer = BoardModel.RED;
};

/**
* This method is added in the most recent version to build the
* simple string representation of the BoardModel.
*/
_p.toString = function() {
    var value = "";
    for (var row = 0; row < this._rows; row++) {
        for (var col = 0; col < this._cols; col++) {
            value += "[" + this._cellToString(this._data[row][col]) + "]";
        }
        value += "\n";
    }
    return value;
};

_p._cellToString = function(value) {
    switch (value) {
        case 0:
            return " ";
        case BoardModel.GREEN:
            return "X";
        case BoardModel.RED:
            return "O";

    }
};

exports.BoardModel = BoardModel;
})(typeof global == "object" ? exports : window);