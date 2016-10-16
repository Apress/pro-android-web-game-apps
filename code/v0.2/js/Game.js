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
    this._objectLayer = null;
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

    this._ball1 = new StaticImage(im.get("ball"), 370, 30);
    this._ball2 = new StaticImage(im.get("ball"), 370, 30);
    this._objectLayer = new ObjectLayer([this._ball1, this._ball2], 200, 4000, 4000);

    var img = im.get("house-1");
    this._objectLayer.addObject(new StaticImage(img, 350, 130));
    this._objectLayer.addObject(new StaticImage(img, 200, 50));
    this._objectLayer.addObject(new StaticImage(img, 150, 200));

    img = im.get("house-2");
    this._objectLayer.addObject(new StaticImage(img, 550, 230));
    this._objectLayer.addObject(new StaticImage(img, 920, 250));
};


/** Move the viewport withing the world */
_p.move = function(deltaX, deltaY) {
    this._tileLayer.move(-deltaX, -deltaY);
    this._objectLayer.move(-deltaX, -deltaY);
};

/** Resize handling */
_p.resize = function() {
    this._tileLayer.setSize(this._canvas.width, this._canvas.height);
    this._objectLayer.setSize(this._canvas.width, this._canvas.height);
};

/** Event handling */
_p._onMove = function(e) {
    this.move(e.deltaX, e.deltaY);
};

_p._onUp = function(e) {};

_p._updateWorld = function() {
    this._ball1.move(0, 2);
    this._ball2.move(2, 0);
};

/** Render frame on context */
_p._renderFrame = function() {
    this._tileLayer.draw(this._ctx);
    this._objectLayer.draw(this._ctx);
//    this._ctx.drawImage(this._imageManager.get("ball"), 50, 50);
//    this._ball1.draw(this._ctx, 0, 0);
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