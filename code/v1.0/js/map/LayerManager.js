function LayerManager() {
    GameObject.call(this);
    this._layers = [];
    this.addListener("up", this._onUpEvent.bind(this));
}

extend(LayerManager, GameObject);

var _p = LayerManager.prototype;

_p.setSize = function(width, height) {
    GameObject.prototype.setSize.call(this, width, height);
    for (var i = 0; i < this._layers.length; i++) {
        this._layers[i].setSize(width, height);
    }
};

_p.setPosition = function(x, y) {
    GameObject.prototype.setPosition.call(this, x, y);
    for (var i = 0; i < this._layers.length; i++) {
        this._layers[i].setPosition(x, y);
    }
};

_p.setDirtyRectManager = function(dirtyRectManager) {
    GameObject.prototype.setDirtyRectManager.call(this, dirtyRectManager);
    for (var i = 0; i < this._layers.length; i++) {
        this._layers[i].setDirtyRectManager(dirtyRectManager);
    }
};

_p.draw = function(ctx, rect) {
    for (var i = 0; i < this._layers.length; i++) {
        this._layers[i].draw(ctx, rect);
    }
};

_p.addLayer = function(layer) {
    if (this._dirtyRectManager) {
        layer.setDirtyRectManager(this._dirtyRectManager);
    }
    this._layers.push(layer);
};

_p.getLayerAt = function(i) {
    return this._layers[i];
};

_p._onUpEvent = function(e) {
    for (var i = this._layers.length - 1; i >= 0; i--) {
        this._layers[i].emit("up", e);
        if (e.stopped)
            return;
    }
};