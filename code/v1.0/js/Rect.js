function Rect(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

_p = Rect.prototype;

_p.copy = function() {
    return new Rect(this.x, this.y, this.width, this.height);
};

_p.equals = function(r2) {
    return (this.x == r2.x
        && this.y == r2.y
        && this.width == r2.width
        && this.height == r2.height);
};

_p.toString = function() {
    return ("[x=" + this.x + ", y=" + this.y + ", width=" + this.width + ", height=" + this.height + "]");
};

_p.print = function() {
    console.log(this.toString());
};

_p.intersects = function(x2, y2, w2, h2) {
    if (arguments.length == 1) {
        var r = x2;
        x2 = r.x;
        y2 = r.y;
        w2 = r.width;
        h2 = r.height
    }

    return (this.x <= x2 + w2 && this.x + this.width >= x2 &&
        this.y <= y2 + h2 && this.y + this.height >= y2);
};

/**
 * Returns true if the given rect fully covers the other one
 */
_p.covers = function(x2, y2, w2, h2) {
    if (arguments.length == 1) {
        var r = x2;
        x2 = r.x;
        y2 = r.y;
        w2 = r.width;
        h2 = r.height
    }
    return (x2 >= this.x && y2 >= this.y && x2 + w2 <= this.x + this.width && y2 + h2 <= this.y + this.height);
};

/**
 * Assumes that neither of rectangles is zero-area
 */
_p.convexHull = function(x2, y2, w2, h2) {
    if (arguments.length == 1) {
        var r = x2;
        x2 = r.x;
        y2 = r.y;
        w2 = r.width;
        h2 = r.height
    }

    var x = Math.min(this.x, x2);
    var y = Math.min(this.y, y2);
    var width = Math.max(this.x + this.width, x2 + w2) - x;
    var height = Math.max(this.y + this.height, y2 + h2) - y;

    return new Rect(x, y, width, height);
};

_p.intersection = function(x2, y2, w2, h2) {
    if (arguments.length == 1) {
        var r = x2;
        x2 = r.x;
        y2 = r.y;
        w2 = r.width;
        h2 = r.height
    }

    var x = Math.max(this.x, x2);
    var y = Math.max(this.y, y2);
    var width = Math.min(this.x + this.width, x2 + w2) - x;
    var height = Math.min(this.y + this.height, y2 + h2) - y;

    if (width <= 0 || height <= 0)
        return null;

    return new Rect(x, y, width, height);
};

_p.containsPoint = function(x, y) {
    return x >= this.x && x < this.x + this.width &&
        y >= this.y && y < this.y + this.height;
};

/**
 * Given a rectangular grid, with the grid cell size cellW, cellH test which cells
 * are overlapped by the rectangle. cellsInRow and cellsInColumn are used only
 * to limit the coordinates (to prevent going out of bounds in arrays for example)
 *
 */
_p.getOverlappingGridCells = function(cellW, cellH, cellsInRow, cellsInColumn) {
    var rectX = Math.max(0, Math.floor(this.x/cellW));
    var rectY = Math.max(0, Math.floor(this.y/cellH));
    var rectWidth = Math.min(cellsInRow - rectX, Math.floor((this.x + this.width)/cellW) - rectX + 1);
    var rectHeight = Math.min(cellsInColumn - rectY, Math.floor((this.y + this.height)/cellH) - rectY + 1);
    return new Rect(rectX, rectY, rectWidth, rectHeight);
};
