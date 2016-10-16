function Game(canvas, map) {
    this._canvas = canvas;
    this._ctx = this._canvas.getContext("2d");
    this._boundAnimate = this._animate.bind(this);

    this._imageManager = new ImageManager();
    this._dirtyRectangleManager = new DirtyRectangleManager();
    this._layerManager = new LayerManager();
    this._layerManager.setDirtyRectManager(this._dirtyRectangleManager);

    this._ball1 = null;
    this._ball2 = null;

    this._archBallDirection = -1;
    this._archBall = null;

    this._ui = null;

    this._tiledLayer = null;
    this._objectLayer = null;

    this._imageManager.load({
        "terrain": "img/terrain.png",
        "arch-left": "img/arch-left.png",
        "arch-right": "img/arch-right.png",
        "house-1": "img/house-1.png",
        "house-2": "img/house-2.png",
        "ball": "img/ball.png",
        "ui": "img/ui.png"
    }, this._onImagesLoaded.bind(this));

    this._map = map || this._createRandomGrassMap(40, 20);
}

_p = Game.prototype;

_p._onImagesLoaded = function() {
    this._initLayers();
    this.move(30, 30);
    this.resize();
    var inputHandler = new InputHandler(this._canvas);
    inputHandler.on("move", this._onMove.bind(this));
    inputHandler.on("up", this._onUp.bind(this));

    this._clearBg();
    this._animate();
};

_p._initLayers = function() {
    var im = this._imageManager;
    this._ui = new RoundStateButton(this._imageManager.get("ui"), 100, 100);

    this._tiledLayer = new IsometricTileLayer(this._map, im.get("terrain"), 128, 68, 124, 62, 0, 3);

    this._ball1 = new StaticImage(im.get("ball"), 370, 30);
    this._ball2 = new StaticImage(im.get("ball"), 370, 30);
    this._archBall = new StaticImage(im.get("ball"), 300, 600);

    this._objectLayer = new ObjectLayer([this._ball1, this._ball2, this._archBall], 200, 10000, 10000);

    var img = im.get("house-1");
    this._objectLayer.addObject(new StaticImage(img, 350, 130));
    this._objectLayer.addObject(new StaticImage(img, 200, 50));
    this._objectLayer.addObject(new StaticImage(img, 150, 200));

    img = im.get("house-2");
    this._objectLayer.addObject(new StaticImage(img, 550, 230));
    this._objectLayer.addObject(new StaticImage(img, 920, 250));

    img = im.get("arch-left");
    this._objectLayer.addObject(new StaticImage(img, 120, 470));

    img = im.get("arch-right");
    this._objectLayer.addObject(new StaticImage(img, 234, 462));

    this._tiledLayer.addListener("tileClicked", this._onTileClicked.bind(this));
    this._objectLayer.addListener("objectClicked", this._onObjectClicked.bind(this));

    this._layerManager.addLayer(this._tiledLayer);
    this._layerManager.addLayer(this._objectLayer);
    this._layerManager.addLayer(new UiLayer([this._ui]));
};

_p._clearBg = function() {
    this._ctx.fillStyle = "black";
    this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
};

_p._onMove = function(e) {
    this.move(e.deltaX, e.deltaY);
};

_p.move = function(deltaX, deltaY) {
    this._dirtyRectangleManager.markAllDirty();
    this._layerManager.move(-deltaX, -deltaY);
};

_p._onUp = function(e) {
    this._layerManager.emit("up", e);
};

_p.resize = function() {
    this._dirtyRectangleManager.setViewport(this._canvas.width, this._canvas.height);
    this._layerManager.setSize(this._canvas.width, this._canvas.height);
};

_p._updateWorld = function() {
    // Update
    this._ball1.move(0, 2);
    this._ball2.move(2, 0);

    this._archBall.move(2*this._archBallDirection, this._archBallDirection);
    if (this._archBall.getBounds().x > 300 || this._archBall.getBounds().x < 100)
        this._archBallDirection *= -1;
};

_p._renderFrame = function() {
    this._ctx.save();
    if (!this._dirtyRectangleManager.isAllClean()) {
        var rect = this._dirtyRectangleManager.getDirtyRect();
        this._ctx.beginPath();
        this._ctx.rect(rect.x, rect.y, rect.width, rect.height);
        this._ctx.clip();
        this._layerManager.draw(this._ctx, rect);
        //this._layerManager.getLayerAt(0).coverDebug(this._ctx);
    }

    this._dirtyRectangleManager.clear();
    this._ctx.restore();
};

_p._animate = function() {
    requestAnimationFrame(this._boundAnimate);
    this._updateWorld();
    this._renderFrame();
};

_p._onTileClicked = function(e) {
    if (this._ui.getState() == "terrain") {
        this._tiledLayer.setTileAt(e.x, e.y, (this._tiledLayer.getTileAt(e.x, e.y) + 1)%9);
    } else if (this._ui.getState() == "objects") {
        this._addDummyObjectAt(e.cause.x, e.cause.y);
    }
};

_p._onObjectClicked = function(e) {
    if (this._ui.getState() == "objects") {
        this._objectLayer.removeObject(e.object);
        e.cause.stopped = true;
    }
};

_p._addDummyObjectAt = function(x, y) {
    var layerPosition = this._objectLayer.getBounds();
    var obj = new StaticImage(this._imageManager.get("ball"), x + layerPosition.x, y + layerPosition.y);
    var bounds = obj.getBounds();
    obj.move(-bounds.width/2, -bounds.height/2);
    this._objectLayer.addObject(obj);
};

_p._createRandomGrassMap = function(w, h) {
    var map = [];
    for (var i = 0; i < h; i++) {
        var row = map[i] = [];
        for (var j = 0; j < w; j++) {
            row.push(Math.floor(Math.random()*2));
        }
    }
    return map;
};

_p.getMapStr = function() {
    var str = "var map = [";
    for (var i = 0; i < this._map.length; i++) {
        str += "\n[";
        for (var j = 0; j < this._map[i].length; j++) {
            str += "" + this._map[i][j] + "" + (j == this._map[i].length - 1 ? "":",");
        }
        str += "]" + (i == this._map.length - 1 ? "":",");
    }
    str += "\n];";
    return str;
};