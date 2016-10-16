function MapRenderer(mapData, image, tileSize, viewportWidth, viewportHeight) {
    this._mapData = mapData;
    this._image = image;
    this._tileSize = tileSize;
    this._viewportWidth = viewportWidth;
    this._viewportHeight = viewportHeight;

    // Coordinates of the map
    this._x = 0;
    this._y = 0;

    // Offscreen buffer
    this._offCanvas = document.createElement("canvas");
    this._offContext = this._offCanvas.getContext("2d");
    this._offDirty = true;
    this._resetOffScreenCanvas();

    // The number of tiles in one row of the image
    this._tilesPerRow = image.width/tileSize;
}

_p = MapRenderer.prototype;

/* Draws the whole map */
_p.draw = function(ctx) {
    if (this._offDirty) {
        this._redrawOffscreen();
    }
    ctx.drawImage(this._offCanvas, 0, 0);
};

_p.move = function(deltaX, deltaY) {
    this._x += deltaX;
    this._y += deltaY;
    this._offDirty = true;
};

_p.setViewportSize = function(width, height) {
    this._viewportWidth = width;
    this._viewportHeight = height;
    this._resetOffScreenCanvas();
};

/* Draws a single tile */
_p._drawTileAt = function(ctx, tileId, cellX, cellY) {

    // Position of the tile inside of a tile sheet
    var srcX = (tileId%this._tilesPerRow)*this._tileSize;
    var srcY = Math.floor(tileId/this._tilesPerRow)*this._tileSize;

    // size of the tile
    var size = this._tileSize;

    // position of the tile on the screen
    var destX = this._x + cellX*size;
    var destY = this._y + cellY*size;

    ctx.drawImage(this._image, srcX, srcY, size, size, destX, destY, size, size);
};

_p._resetOffScreenCanvas = function() {
    this._offCanvas.width = this._viewportWidth;
    this._offCanvas.height = this._viewportHeight;
    this._offDirty = true;
};

_p._redrawOffscreen = function() {
    var ctx = this._offContext;
    ctx.clearRect(0, 0, this._viewportWidth, this._viewportHeight);

    var startX = Math.max(Math.floor(-this._x / this._tileSize), 0);
    var endX = Math.min(
        Math.floor((this._viewportWidth - this._x) / this._tileSize),
        this._mapData[0].length - 1);

    var startY = Math.max(Math.floor(-this._y / this._tileSize), 0);
    var endY = Math.min(
        Math.floor((this._viewportHeight - this._y) / this._tileSize),
        this._mapData.length - 1);

    for (var cellY = startY; cellY <= endY; cellY++) {
        for (var cellX = startX; cellX <= endX; cellX++) {
            var tileId = this._mapData[cellY][cellX];
            this._drawTileAt(ctx, tileId, cellX, cellY);
        }
    }

    this._offDirty = false;
};
