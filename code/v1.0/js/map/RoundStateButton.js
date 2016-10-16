function RoundStateButton(image, frameWidth, frameHeight) {
    GameObject.call(this);
    this._bounds = new Rect(0, 0, frameWidth, frameHeight || image.height);
    this._image = image;
    this._frame = 2;
    this.addListener("up", this._onUpEvent.bind(this));
}

extend(RoundStateButton, GameObject);

var _p = RoundStateButton.prototype;

_p.draw = function(ctx, dirtyRect, viewportX, viewportY) {
    ctx.drawImage(
        this._image,
        this._bounds.width*this._frame,
        0,
        this._bounds.width,
        this._bounds.height,
        this._bounds.x - viewportX || 0,
        this._bounds.y - viewportY || 0,
        this._bounds.width,
        this._bounds.height);
};

_p.setFrame = function(frame) {
    this._frame = frame;
};

_p.nextFrame = function() {
    this._frame = (this._frame + 1) % 3;
    this.emit("change", {object: this});
};

_p.getState = function() {
    return ["terrain", "objects", "move"][this._frame];
};

_p._onUpEvent = function(e) {
    e.stopped = true;
    this.nextFrame();
};