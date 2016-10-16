function GameObject() {
    EventEmitter.call(this);
    this._id = GameObject._maxId++;
    this._bounds = new Rect(0, 0, 100, 100);
    this._dirtyRectManager = null;
}

extend(GameObject, EventEmitter);
var _p = GameObject.prototype;

GameObject._maxId = 1;

_p.draw = function(ctx, rect) {
    // To implement
};

_p.setSize = function(width, height) {
    this._bounds.width = width;
    this._bounds.height = height;
};

_p.move = function(deltaX, deltaY) {
    this.setPosition(this._bounds.x + deltaX, this._bounds.y + deltaY);
};

_p.setPosition = function(x, y) {
    if (this._bounds.x != x || this._bounds.y != y) {
        var evendData = {
            oldX: this._bounds.x,
            oldY: this._bounds.y,
            x: x,
            y: y,
            object: this
        };

        this._bounds.x = x;
        this._bounds.y = y;
        this.emit("move", evendData);
    }
};

_p.getBounds = function() {
    return this._bounds;
};

_p.getDirtyRectManager = function() {
    return this._dirtyRectManager;
};

_p.setDirtyRectManager = function(dirtyRectManager) {
    this._dirtyRectManager = dirtyRectManager;
};

_p.markDirty = function(x, y, width, height) {
    if (this._dirtyRectManager) {
        var rect = arguments.length == 1 ? x : new Rect(x, y, width, height);
        this._dirtyRectManager.markDirty(rect);
    }
};

_p.getId = function() {
    return this._id;
};