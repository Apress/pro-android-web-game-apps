function IsometricTileLayer(mapData, tileset, tileWidth, tileHeight, cellWidth, cellHeight, marginLeft, marginTop) {
    GameObject.call(this);
    this._mapData = mapData;
    this._tileset = tileset;

    this._tileWidth = tileWidth;
    this._tileHeight = tileHeight;
    this._cellWidth = cellWidth || tileWidth;
    this._cellHeight = cellHeight || tileHeight;
    this._marginLeft = marginLeft;
    this._marginTop = marginTop;

    this._spritesInOneRow = Math.floor(tileset.width/tileWidth);

    this._offCanvas = document.createElement("canvas");
    this._offContext = this._offCanvas.getContext("2d");
    this._offRect = new Rect(0, 0, 0, 0);
    this._offDirty = true;

    this.addListener("up", this._onUpEvent.bind(this));

    this._resetOffScreenCanvas();
}

extend(IsometricTileLayer, GameObject);
_p = IsometricTileLayer.prototype;

_p.setSize = function(width, height) {
    GameObject.prototype.setSize.call(this, width, height);
    this._resetOffScreenCanvas();
};

_p.setPosition = function(x, y) {
    GameObject.prototype.setPosition.call(this, x, y);
    this._updateOffscreenBounds();
};

_p.draw = function(ctx, dirtyRect) {
    if (this._offDirty) {
        this._redrawOffscreen();
    }

    var offscreenImageWorldX = this._offRect.x*this._cellWidth;
    var offscreenImageWorldY = this._offRect.y*this._cellHeight/2;

    if (dirtyRect) {
        var sx = this._bounds.x - offscreenImageWorldX + dirtyRect.x;
        var sy = this._bounds.y - offscreenImageWorldY + dirtyRect.y;
        var sw = dirtyRect.width;
        var sh = dirtyRect.height;
        var dx = dirtyRect.x;
        var dy = dirtyRect.y;
        var dw = dirtyRect.width;
        var dh = dirtyRect.height;

        ctx.drawImage(this._offCanvas, sx, sy, sw, sh, dx, dy, dw, dh);
    } else {
        ctx.drawImage(this._offCanvas, offscreenImageWorldX - this._bounds.x, offscreenImageWorldY - this._bounds.y);
    }
};

_p._resetOffScreenCanvas = function() {
    this._offRect = this._getVisibleMapRect();
    this._offCanvas.height = this._offRect.height*this._cellHeight;
    this._offCanvas.width = this._offRect.width*this._cellWidth;
    this._offDirty = true;
};

_p._redrawOffscreen = function() {
    var ctx = this._offContext;
    ctx.fillStyle = "darkgreen";
    ctx.fillRect(0, 0, this._offCanvas.width, this._offCanvas.height);
    this._drawMapRegion(ctx, this._offRect);
    this._offDirty = false;
};

_p._drawMapRegion = function(ctx, rect) {
    var startCellX = Math.max(0, rect.x);
    var endCellX = Math.max(0, Math.min(rect.x + rect.width - 1, this._mapData[0].length - 1));
    var startCellY = Math.max(0, rect.y);
    var endCellY = Math.min(rect.y + rect.height - 1, this._mapData.length - 1);

    for (var cellY = startCellY; cellY <= endCellY; cellY++) {
        for (var cellX = startCellX; cellX <= endCellX; cellX++) {
            var tileId = this._mapData[cellY][cellX];
            var tileX = tileId%this._spritesInOneRow;
            var tileY = Math.floor(tileId/this._spritesInOneRow);

            var sx = tileX*this._tileWidth;
            var sy = tileY*this._tileHeight;
            var sw = this._tileWidth;
            var sh = this._tileHeight;

            var dx = (cellX - rect.x)*this._cellWidth + (cellY%2)*this._cellWidth/2 - this._marginLeft;
            var dy = (cellY - rect.y)*this._cellHeight/2 - this._marginTop;
            var dw = this._tileWidth;
            var dh = this._tileHeight;

            ctx.drawImage(this._tileset, sx, sy, sw, sh, dx, dy, dw, dh);
        }
    }
};

_p._updateOffscreenBounds = function() {
    var newRect = this._getVisibleMapRect();
    if (!newRect.equals(this._offRect)) {
        this._offRect = newRect;
        this._offDirty = true;
    }
};

_p._getVisibleMapRect = function() {
    var x = Math.floor((this._bounds.x - this._cellWidth/2)/this._cellWidth);
    var y = Math.floor(this._bounds.y/(this._cellHeight/2)) - 1;

    var width = Math.ceil(this._bounds.width/this._cellWidth) + 2;
    var height = Math.ceil((this._bounds.height)/(this._cellHeight/2)) + 2;

    return new Rect(x, y, width, height);
};

_p._onUpEvent = function(e) {
    if (e.moved)
        return;

    var coords = this._getTileCoordinates(e.x, e.y);
    if (coords.x >= 0 && coords.x < this._mapData[0].length &&
        coords.y >= 0 && coords.y < this._mapData.length) {
        this.emit("tileClicked", {x: coords.x, y: coords.y, layer: this, cause: e});
        e.stopped = true;
    }
};

_p.setTileAt = function(x, y, tileId) {
    this._mapData[y][x] = tileId;
    if (this._offRect.containsPoint(x, y)) {
        var dirtyX = x*this._cellWidth + (y%2 ? this._cellWidth/2 : 0) - this._marginLeft - this._bounds.x;
        var dirtyY = y*this._cellHeight/2 - this._marginTop - this._bounds.y;
        var dirtyWidth = this._tileWidth;
        var dirtyHeight = this._tileHeight;

        this.markDirty(dirtyX, dirtyY, dirtyWidth, dirtyHeight);
        this._offDirty = true;
    }
};

_p.getTileAt = function(x, y) {
    return this._mapData[y][x];
};

_p._getTileCoordinates = function(x, y) {
    x += this._bounds.x;
    y += this._bounds.y;

    var w = this._cellWidth;
    var h = this._cellHeight;

    var x1 = Math.floor((x + 2*y - w/2)/w);
    var y1 = Math.floor((y - x/2 + h/2)/h );

    return {
        x: Math.floor((x1 - y1)/2),
        y: x1 + y1
    };
};

_p.coverDebug = function(ctx) {
    for (var x = 0; x < this._bounds.width; x++) {
        for (var y = 0; y < this._bounds.height; y++) {
            var coords = this._getTileCoordinates(x, y);
                ctx.fillStyle = coords.y%2 ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)";
                ctx.fillRect(x, y, 1, 1);

        }
    }
};