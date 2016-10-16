function MapRenderer(mapData, image, tileSize) {
    this._mapData = mapData;
    this._image = image;
    this._tileSize = tileSize;

    // Coordinates of the map
    this._x = 0;
    this._y = 0;

    // The number of tiles in one row of the image
    this._tilesPerRow = image.width/tileSize;
}

_p = MapRenderer.prototype;

/* Draws the whole map */
_p.draw = function(ctx) {
    for (var cellY = 0; cellY < this._mapData.length; cellY++) {
        for (var cellX = 0; cellX < this._mapData[cellY].length; cellX++) {
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