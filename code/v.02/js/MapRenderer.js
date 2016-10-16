function MapRenderer(mapData, image, tileSize, viewportWidth, viewportHeight) {
    this._mapData = mapData;
    this._image = image;
    this._tileSize = tileSize;
    this._viewportWidth = viewportWidth;
    this._viewportHeight = viewportHeight;

    // Coordinates of the map
    this._x = 0;
    this._y = 0;

    // The number of tiles in one row of the image
    this._tilesPerRow = image.width/tileSize;
}

_p = MapRenderer.prototype;

/* Draws the whole map */
_p.draw = function(ctx) {
    // Instead of drawing every tile of the map, check which ones
    // are actually visible

    // x coordinate of the leftmost visible tile
    var startX = Math.floor(-this._x / this._tileSize);
    startX = Math.max(startX, 0);

    // x coordinate of the rightmost visible tile
    var endX = Math.floor((this._viewportWidth - this._x) / this._tileSize);
    endX = Math.min(endX, this._mapData[0].length - 1);

    // y coordinate of the topmost visible tile
    var startY = Math.floor(-this._y / this._tileSize);
    startY = Math.max(startY, 0);

    // y coordinate of the bottommost visible tile
    var endY = Math.floor((this._viewportHeight - this._y) / this._tileSize);
    endY = Math.min(endY, this._mapData.length - 1);

    // Draw only visible tiles
    for (var cellY = startY; cellY <= endY; cellY++) {
        for (var cellX = startX; cellX <= endX; cellX++) {
            var tileId = this._mapData[cellY][cellX];
            this._drawTileAt(ctx, tileId, cellX, cellY);
        }
    }
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

_p.move = function(deltaX, deltaY) {
    this._x += deltaX;
    this._y += deltaY;
};

_p.setViewportSize = function(width, height) {
    this._viewportWidth = width;
    this._viewportHeight = height;
};