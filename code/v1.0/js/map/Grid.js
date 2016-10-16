var Grid = {};

Grid.copy = function(r1) {
    return {x: r1.x, y: r1.y, width: r1.width, height: r1.height};
};

Grid.getBoundingRect = function(x, y, w, h, cellW, cellH, cellsInRow, cellsInColumn) {
    var rectX = Math.max(0, Math.floor(x/cellW));
    var rectY = Math.max(0, Math.floor(y/cellH));
    var rectWidth = Math.min(cellsInRow - rectX, Math.floor((x + w)/cellW) - rectX + 1);
    var rectHeight = Math.min(cellsInColumn - rectY, Math.floor((y + h)/cellH) - rectY + 1);
    return {
        x: rectX,
        y: rectY,
        width: rectWidth,
        height: rectHeight
    };
};

Grid.rectsEqual = function(r1, r2) {
    return (r1.x == r2.x
        && r1.y == r2.y
        && r1.width == r2.width
        && r1.height == r2.height);
};

Grid.rectAsString = function(rect) {
    return ("x=" + rect.x + ", y=" + rect.y + ", width=" + rect.width + ", height=" + rect.height);
};

Grid.printRect = function(rect) {
    console.log(Grid.rectAsString(rect));
};


Grid.intersects = function(x1, y1, w1, h1, x2, y2, w2, h2) {
    return (x1 <= x2 + w2 && x1 + w1 >= x2 &&
        y1 <= y2 + h2 && y1 + h1 >= y2);
};

Grid.intersectsRect = function(b1, b2) {
    return Grid.intersects(b1.x, b1.y, b1.width, b1.height,
        b2.x, b2.y, b2.width, b2.height);
};

Grid.covers = function(x1, y1, w1, h1, x2, y2, w2, h2) {
    // X1 - larger
    return (x2 >= x1 && y2 >= y1 && x2 + w2 <= x1 + w1 && y2 + h2 <= y1 + h1);
};

Grid.coversRect = function(r1, r2) {
    // X1 - larger
    return (r2.x >= r1.x && r2.y >= r1.y &&
        r2.x + r2.width <= r2.x + r1.width && r2.y + r2.height <= r1.y + r1.height);
};

/**
 * Assumes that neither of rectangles is zero-area
 */
Grid.convexHull = function(x1, y1, w1, h1, x2, y2, w2, h2) {
    var x = Math.min(x1, x2);
    var y = Math.min(y1, y2);
    var width = Math.max(x1 + w1, x2 + w2) - x;
    var height = Math.max(y1 + h1, y2 + h2) - y;

    return ({x: x, y: y, width: width, height: height});
};

Grid.convexHullRect = function(r1, r2) {
    return Grid.convexHull(r1.x, r1.y, r1.width, r1.height, r2.x, r2.y, r2.width, r2.height);
};

Grid.intersection = function(x1, y1, w1, h1, x2, y2, w2, h2) {
    var x = Math.max(x1, x2);
    var y = Math.max(y1, y2);
    var width = Math.min(x1 + w1, x2 + w2) - x;
    var height = Math.min(y1 + h1, y2 + h2) - y;

    if (width <= 0 || height <= 0)
        return null;

    return ({x: x, y: y, width: width, height: height});
};

Grid.intersectionRect = function(r1, r2) {
    return Grid.intersection(r1.x, r1.y, r1.width, r1.height, r2.x, r2.y, r2.width, r2.height);
};