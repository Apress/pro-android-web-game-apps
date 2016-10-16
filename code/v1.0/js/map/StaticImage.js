function StaticImage(image, x, y, w, h) {
    GameObject.call(this);
    this._bounds = new Rect(x, y, w || image.width, h || image.height);
    this._image = image;
}

extend(StaticImage, GameObject);

var _p = StaticImage.prototype;

_p.draw = function(ctx, dirtyRect, viewportX, viewportY) {
    ctx.drawImage(this._image, this._bounds.x - viewportX, this._bounds.y - viewportY);
};