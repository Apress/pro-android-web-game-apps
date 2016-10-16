function UiLayer(objects) {
    GameObject.call(this);
    this._objects = objects;
    this._addChangeListeners();
    this.addListener("up", this._onUpEvent.bind(this));
}

extend(UiLayer, GameObject);
_p = UiLayer.prototype;

_p.setPosition = function(x, y) {
    // Ignore
};

_p.move = function(deltaX, deltaY) {
    // Ignore
};

_p.draw = function(ctx, dirtyRect) {
    dirtyRect = dirtyRect || this._bounds;

    for (var i = 0; i < this._objects.length; i++) {
        var obj = this._objects[i];
        var bounds = obj.getBounds();
        if (bounds.intersects(dirtyRect)) {
            obj.draw(ctx, dirtyRect, this._bounds.x, this._bounds.y);
        }
    }
};

_p._addChangeListeners = function() {
    var boundOnChange = this._onObjectChange.bind(this);
    for (var i = 0; i < this._objects.length; i++) {
        this._objects[i].addListener("change", boundOnChange);
    }
};


_p._onUpEvent = function(e) {
    if (e.moved)
        return;

    var obj = this.getObjectAt(e.x, e.y);
    if (obj) {
        obj.emit("up", e);
        this.emit("objectClicked", {object: obj, layer: this, cause: e});
    }
};

_p.getObjectAt = function(x, y) {
    for (var i = 0; i < this._objects.length; i++) {
        if (this._objects[i].getBounds().containsPoint(x, y)) {
            return this._objects[i];
        }
    }
    return null;
};

_p.addObject = function(obj) {
    this._objects.push(obj);
    obj.addListener("change", this._onObjectChange.bind(this));
};

_p.removeObject = function(obj) {
    if (Arrays.contains(obj, this._objects)) {
        Arrays.remove(obj, this._objects);
    }
};

_p._onObjectChange = function(e) {
    var obj = e.object;
    this.markDirty(obj.getBounds());
};