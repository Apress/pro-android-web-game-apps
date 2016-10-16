function Game(canvas, map) {
    this._canvas = canvas;
    this._ctx = this._canvas.getContext("2d");
    this._boundAnimate = this._animate.bind(this);

    this._imageManager = new ImageManager();
    this._imageManager.load({
        "terrain": "img/terrain.png",
        "arch-left": "img/arch-left.png",
        "arch-right": "img/arch-right.png",
        "house-1": "img/house-1.png",
        "house-2": "img/house-2.png",
        "ball": "img/ball.png",
        "ui": "img/ui.png"
    }, this._onImagesLoaded.bind(this));

    this._map = map;
    this._tileLayer = null;
}

_p = Game.prototype;

/** Called once all images are loaded */
_p._onImagesLoaded = function() {
    this._initLayers();

    this.resize();
    var inputHandler = new InputHandler(this._canvas);
    inputHandler.on("move", this._onMove.bind(this));
    inputHandler.on("up", this._onUp.bind(this));

    this._clearBg();
    this._animate();
};

_p._initLayers = function() {
    var im = this._imageManager;
    this._tileLayer = new IsometricTileLayer(this._map, im.get("terrain"), 128, 68, 124, 62, 0, 3);
};


/** Move the viewport withing the world */
_p.move = function(deltaX, deltaY) {
    this._tileLayer.move(-deltaX, -deltaY);
};

/** Resize handling */
_p.resize = function() {
    this._tileLayer.setSize(this._canvas.width, this._canvas.height);
};

/** Event handling */
_p._onMove = function(e) {
    this.move(e.deltaX, e.deltaY);
};

_p._onUp = function(e) {};

/** Update objects - move, animate etc */
_p._updateWorld = function() { };

/** Render frame on context */
_p._renderFrame = function() {
    this._tileLayer.draw(this._ctx);
};

/** Called each frame, updates objects and re-renders the frame if required*/
_p._animate = function() {
    requestAnimationFrame(this._boundAnimate);
    this._updateWorld();
    this._renderFrame();
};

/** Fills background with black */
_p._clearBg = function() {
    this._ctx.fillStyle = "black";
    this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
};