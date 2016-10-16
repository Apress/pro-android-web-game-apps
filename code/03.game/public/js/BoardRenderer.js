/**
 * Board view - the class reponsible for drawing the current state of the game
 * @param context the 2d context to draw at
 * @param model the BoardModel to take data from
 */
function BoardRenderer(context, model) {
	this._ctx = context;
	this._model = model;
    
    // Save for convenience
    this._cols = model.getCols();
    this._rows = model.getRows();

	// top left corner of the board
	this._x = 0;
	this._y = 0;
    
    // Width and height of the board rectangle
    this._width = 0;
    this._height = 0;

	// the optimal size of the board cell
	this._cellSize = 0;
}

_p = BoardRenderer.prototype;


/**
 * Repaints the whole board.
 */
_p.repaint = function() {
    this._ctx.save();
    this._ctx.translate(this._x, this._y);
    this._drawBackground();
	this._drawGrid();
    this._ctx.restore();
    
	for (var i = 0; i < this._cols; i++) {
		for (var j = 0; j < this._rows; j++) {
			this.drawToken(i, j);
		}
	}
};

_p._drawBackground = function() {
    var ctx = this._ctx;
    
    // Background
    var gradient = ctx.createLinearGradient(0, 0, 0, this._height);
    gradient.addColorStop(0, "#fffbb3");
    gradient.addColorStop(1, "#f6f6b2");            
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this._width, this._height);
    
    // Drawing curves
    var co = this._width/6; // curve offset
    ctx.strokeStyle = "#dad7ac";
    ctx.fillStyle = "#f6f6b2";

    // First curve
    ctx.beginPath();
    ctx.moveTo(co, this._height);
    ctx.bezierCurveTo(this._width + co*3, -co, 
                    -co*3, -co, this._width - co, this._height);
    ctx.fill();

    // Second curve
    ctx.beginPath();
    ctx.moveTo(co, 0);
    ctx.bezierCurveTo(this._width + co*3, this._height + co, 
                    -co*3, this._height + co, this._width - co, 0);
    ctx.fill();

};

/**
 * Draw the grid.
 */
_p._drawGrid = function() {
	var ctx = this._ctx;
	ctx.beginPath();
	// Drawing horizontal lines
	for (var i = 0; i <= this._cols; i++) {
		ctx.moveTo(i*this._cellSize + 0.5, 0.5);
		ctx.lineTo(i*this._cellSize + 0.5, this._height + 0.5)
	}

	// Drawing vertical lines
	for (var j = 0; j <= this._rows; j++) {
		ctx.moveTo(0.5, j*this._cellSize + 0.5);
		ctx.lineTo(this._width + 0.5, j*this._cellSize + 0.5);
	}

	// Stroking to show them on the screen
	ctx.strokeStyle = "#CCC";
	ctx.stroke();
};

/**
 * Draws the token of the specified color in the specified
 * location
 * @param cellX the x coordinate of the cell
 * @param cellY the y coordinate of the cell
 */
_p.drawToken = function(cellX, cellY) {
    var ctx = this._ctx;
    var cellSize = this._cellSize;
    var tokenType = this._model.getPiece(cellX, cellY);

    // Cell is empty
    if (!tokenType)
        return;

    
	var colorCode = "black";
	switch(tokenType) {
		case BoardModel.RED:
			colorCode = "red";
		break;
		case BoardModel.GREEN:
			colorCode = "green";
		break;
	}
    
    // Center of the token
    var x = this._x + (cellX + 0.5)*cellSize;
    var y = this._y + (cellY + 0.5)*cellSize;
    ctx.save();
    ctx.translate(x, y);
    
    // Token radius
    var radius = cellSize*0.4;
    
    // Center of the gradient
    var gradientX = cellSize*0.1;
    var gradientY = -cellSize*0.1;
    
    var gradient = ctx.createRadialGradient(
        gradientX, gradientY, cellSize*0.1, // inner circle (glare)
        gradientX, gradientY, radius*1.2); // outter circle
        
    gradient.addColorStop(0, "yellow"); // the color of the "light"
    gradient.addColorStop(1, colorCode); // the color of the token
    ctx.fillStyle = gradient;
    
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2*Math.PI, true);
    ctx.fill();
    ctx.restore();
};

/**
 * Sets the new position and size for the board. Should call repaint to
 * see the changes
 * @param x the x coordinate of the top-left corner
 * @param y the y coordinate of the top-left corner
 * @param cellSize optimal size of the cell in pixels
 */
_p.setSize = function(x, y, cellSize)  {
	this._x = x;
	this._y = y;
	this._cellSize = cellSize;
    this._width = this._cellSize*this._cols;
    this._height = this._cellSize*this._rows;
};