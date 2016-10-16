function DirtyRectangleManager(allDirtyThreshold) {
    this._allDirtyThreshold = allDirtyThreshold == undefined ? .5 : allDirtyThreshold;

    this._viewport = new Rect(0, 0, 100, 100);
    this._dirtyRect = null;
    this._allDirty = true;
    this.markAllDirty();
}

_p = DirtyRectangleManager.prototype;

_p.clear = function() {
    this._dirtyRect = null;
    this._allDirty = false;
};

_p.markDirty = function(rect) {
    if (!(rect.width || rect.height) || this._allDirty) {
        return;
    }

    rect = this._viewport.intersection(rect);

    if (!rect) {
        return;
    }

    if (this._dirtyRect) {
        this._dirtyRect = this._dirtyRect.convexHull(rect);
        if (this._dirtyRect.width * this._dirtyRect.height >
                this._allDirtyThreshold*this._viewport.width*this._viewport.height) {
            this.markAllDirty();
        }
    } else {
        this._dirtyRect = this._viewport.intersection(rect);
    }
};

_p.markAllDirty = function() {
    this._allDirty = true;
    this._dirtyRect = this._viewport.copy();
};

_p.isAllClean = function() {
    return !(this._dirtyRect);
};

_p.isAllDirty = function() {
    return this._allDirty;
};

_p.getDirtyRect = function() {
    return this._dirtyRect;
};

_p.setViewport = function(width, height) {
    if (this._viewport.width == width && this._viewport.height == height) {
        return;
    }
    this._viewport.width = width;
    this._viewport.height = height;
    this.markAllDirty();
};