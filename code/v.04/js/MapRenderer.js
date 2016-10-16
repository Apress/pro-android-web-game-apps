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
    this._offBounds = {x: 0, y:0, w: 0, h: 0};
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

    var offCanvasX = -Math.floor(this._x) - this._offBounds.x*this._tileSize;
    var offCanvasY = -Math.floor(this._y) - this._offBounds.y*this._tileSize;
    var offCanvasW = Math.min(this._offCanvas.width - offCanvasX, this._viewportWidth);
    var offCanvasH = Math.min(this._offCanvas.height - offCanvasY, this._viewportHeight);

    ctx.drawImage(this._offCanvas, offCanvasX, offCanvasY, offCanvasW, offCanvasH,
        0, 0, offCanvasW, offCanvasH);
};


_p.move = function(deltaX, deltaY) {
    this._x += deltaX;
    this._y += deltaY;
    this._updateOffscreenBounds();
};

_p.setViewportSize = function(width, height) {
    this._viewportWidth = width;
    this._viewportHeight = height;
    this._resetOffScreenCanvas();
};

_p._resetOffScreenCanvas = function() {
    this._updateOffscreenBounds();
    this._offCanvas.width = this._offBounds.w*this._tileSize;
    this._offCanvas.height = this._offBounds.h*this._tileSize;
    this._offDirty = true;
};

/*_p._redrawOffscreen = function() {
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
};*/

_p._redrawOffscreen = function() {
    var ctx = this._offContext;
    ctx.clearRect(0, 0, this._offCanvas.width, this._offCanvas.height);

    var startX = Math.max(this._offBounds.x, 0);
    var endX = Math.min(startX + this._offBounds.w - 1, this._mapData[0].length - 1);

    var startY = Math.max(this._offBounds.y, 0);
    var endY = Math.min(startY + this._offBounds.h - 1, this._mapData.length - 1);

    for (var cellY = startY; cellY <= endY; cellY++) {
        for (var cellX = startX; cellX <= endX; cellX++) {
            var tileId = this._mapData[cellY][cellX];
            this._drawTileAt(ctx, tileId, cellX, cellY);
        }
    }
    this._offDirty = false;
};

/* Draws a single tile */
_p._drawTileAt = function(ctx, tileId, cellX, cellY) {

    // Position of the tile inside of a tile sheet
    var srcX = (tileId%this._tilesPerRow)*this._tileSize;
    var srcY = Math.floor(tileId/this._tilesPerRow)*this._tileSize;

    // size of the tile
    var size = this._tileSize;

    // position of the tile on the offscreen buffer
    var destX = (cellX - this._offBounds.x)*size;
    var destY = (cellY - this._offBounds.y)*size;

    ctx.drawImage(this._image, srcX, srcY, size, size, destX, destY, size, size);
};

_p._updateOffscreenBounds = function() {
    var newBounds = {
        x: Math.floor(-this._x / this._tileSize),
        y: Math.floor(-this._y / this._tileSize),
        w: Math.ceil(this._viewportWidth/this._tileSize) + 1,
        h: Math.ceil(this._viewportHeight/this._tileSize) + 1
    };

    var oldBounds = this._offBounds;
    if (!(oldBounds.x == newBounds.x
        && oldBounds.y == newBounds.y
        && oldBounds.w == newBounds.w
        && oldBounds.h == newBounds.h)) {
        this._offBounds = newBounds;
        this._offDirty = true;
    }
};
