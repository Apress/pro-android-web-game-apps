function WorldObjectRenderer(objects, viewportWidth, viewportHeight) {
    this._objects = objects;

    this._objects.sort(function(o1, o2) {
        var bounds1 = o1.getBounds();
        var bounds2 = o2.getBounds();
        return (bounds1.y + bounds1.h) - (bounds2.y + bounds2.h);
    });

    this._viewportWidth = viewportWidth;
    this._viewportHeight = viewportHeight;
    this._x = 0;
    this._y = 0;
}

_p = WorldObjectRenderer.prototype;

_p.move = function(deltaX, deltaY) {
    this._x += deltaX;
    this._y += deltaY;
};

_p.setViewportSize = function(width, height) {
    this._viewportWidth = width;
    this._viewportHeight = height;
};

_p.draw = function(ctx) {
    for (var i = 0; i < this._objects.length; i++) {
        var obj = this._objects[i];
        var pos = obj.getPosition();
        obj.draw(ctx, this._x + pos.x, this._y + pos.y);
    }
};

