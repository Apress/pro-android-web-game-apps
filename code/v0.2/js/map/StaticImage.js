function StaticImage(image, x, y, w, h) {
    GameObject.call(this);
    this._bounds = new Rect(x, y, w || image.width, h || image.height);
    this._image = image;
}

extend(StaticImage, GameObject);

var _p = StaticImage.prototype;

_p.draw = function(ctx, viewportX, viewportY) {
    ctx.drawImage(this._image, this._bounds.x - (viewportX || 0), this._bounds.y - (viewportY || 0));
};