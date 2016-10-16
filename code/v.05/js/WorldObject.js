function WorldObject(spriteSheet, frame) {
    this._spriteSheet = spriteSheet;
    this._frame = frame;
    this._x = 0;
    this._y = 0;
}

_p = WorldObject.prototype;

_p.setPosition = function(x, y) {
    this._x = x;
    this._y = y;
};

_p.getPosition = function() {
    return {
        x: this._x,
        y: this._y
    };
};

_p.getBounds = function() {
    return this._spriteSheet.getFrameBounds(this._frame, this._x, this._y);
};

_p.draw = function(ctx, x, y) {
    this._spriteSheet.drawFrame(ctx, this._frame, x, y);
};