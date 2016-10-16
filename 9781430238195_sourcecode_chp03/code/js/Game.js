/**
 * This is the main class that handles the game life cycle. It initializes
 * other components like Board and BoardModel, listens to the DOM events and
 * translates clicks to coordinates.
 * @param canvas the canvas object to use for drawing
 */
function Game(canvas) {
	this._boardRect = null;
	this._canvas = canvas;
	this._ctx = canvas.getContext("2d");
	this._boardModel = new BoardModel();

	this._boardRenderer = new BoardRenderer(this._ctx, this._boardModel);
	this.handleResize();
}

_p = Game.prototype;

/**
 * Handles the click (or tap) on the Canvas. Translates the canvas coordinates
 * into the column of the game board and makes the next turn in that column
 * @param x the x coordinate of the click or tap
 * @param y the y coordinate of the click or tap
 */
_p.handleClick = function(x, y) {
	// get the column index
	var column = Math.floor((x - this._boardRect.x)/this._boardRect.cellSize);

	// Make the turn and check for the result
	var turn = this._boardModel.makeTurn(column);

	// If the turn was legal, update the board, draw
	// the new piece
	if (turn.status != BoardModel.ILLEGAL_TURN) {
		this._boardRenderer.drawToken(turn.x, turn.y);
	}

	// Do we have a winner after the last turn?
	if (turn.status == BoardModel.WIN) {
		// Tell the world about it and reset the board for the next game
		alert((turn.piece == BoardModel.RED ? "red" : "green") + " won the match!");
		this._reset();
	}

	// If we have the draw, do the same
	if (turn.status == BoardModel.DRAW) {
		alert("It is a draw!");
		this._reset();
	}
};

/**
 * Reset the _boardModel and redraw the board.
 */
_p._reset = function() {
	this._clearCanvas();
	this._boardModel.reset();
	this._boardRenderer.repaint();
};

/**
 * Called when the screen has resized. In this case we need to calculate
 * new size and position for the game board and repaint it.
 */
_p.handleResize = function() {
	this._clearCanvas();
	this._boardRect = this._getBoardRect();
	this._boardRenderer.setSize(this._boardRect.x, this._boardRect.y, this._boardRect.cellSize);
	this._boardRenderer.repaint();
};

/**
 * Get the optimal position and the size of the board
 * @return the object that describes the optimal position and
 * size for the board:
 * {
 * 		x: the x of the top-left corner of the board
 * 		y: the y of the top-left corner of the board
 * 		cellSize: the optimal size of the cell (in pixels)
 * }
 */
_p._getBoardRect = function() {
    var cols = this._boardModel.getCols();
    var rows = this._boardModel.getRows();
	var cellSize = Math.floor(
			Math.min(this._canvas.width/cols, this._canvas.height/rows));
	
	var boardWidth = cellSize*cols;
	var boardHeight = cellSize*rows;

	return {
		x: Math.floor((this._canvas.width - boardWidth)/2),
		y: Math.floor((this._canvas.height - boardHeight)/2),
		cellSize: cellSize
	}
};

/**
 * Clears the background of the canvas with plain white color. If we want
 * to draw something like background picture or border, this is the good place
 * to do it.
 */
_p._clearCanvas = function() {
	this._ctx.fillStyle = "white";
	this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
};