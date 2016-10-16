/**
 * The control that simulates a joystick.
 * @param canvas the canvas to use as the source of DOM input events
 */
function Joystick(canvas) {
    EventEmitter.call(this);

    this._ctx = canvas.getContext("2d");

    // The position of joystic inside the canvas
    this._x = 0;
    this._y = 0;
    this._controllerRadius = 100;

    // Current azimuth and radius
    this._azimuth = 0;
    this._radius = 0;

    // Current position of the stick relative to the center
    this._deltaX = 0;
    this._deltaY = 0;

    var input = new InputHandler(canvas);

    // Joystic is all about movement. We don't need any thresholds here
    input.setMoveThreshold(0);

    // Bind DOM listeners
    var bindedDownOrMove = this._onDownOrMove.bind(this);
    input.on("move", bindedDownOrMove);
    input.on("down", bindedDownOrMove);
    input.on("up", this._onUp.bind(this));
}

extend(Joystick, EventEmitter);

_p = Joystick.prototype;

_p.getPosition = function() {
    return {
        x: this._x,
        y: this._y
    }
};

_p.setPosition = function(x, y) {
    this._x = x;
    this._y = y;
};


_p.getControllerRadius = function() {
    return this._controllerRadius;
};

_p.setControllerRadius = function(radius) {
    this._controllerRadius = radius;
};

_p.getRadius = function() {
    return this._radius;
};

_p.getAzimuth = function() {
    return this._azimuth;
};

/**
 * Render the UI of joystick.
 */
_p.draw = function() {
    var ctx = this._ctx;
    ctx.fillStyle = "lightgreen";
    ctx.strokeStyle = "darkgray";
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.arc(this._x, this._y, this._controllerRadius, 0, Math.PI*2, false);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "lightblue";
    ctx.beginPath();
    ctx.arc(this._x + this._deltaX,
        this._y + this._deltaY, 30, 0, Math.PI*2, false);
    ctx.fill();
    ctx.stroke();

};

_p._onDownOrMove = function(coords) {
    // When we receive the "down" or "move" events we save current
    // deltas and update radius and azimuth
    var deltaX = coords.x - this._x;
    var deltaY = coords.y - this._y;
    this._updateJoystickValues(deltaX, deltaY);
};

_p._onUp = function(x, y) {
    // If there's no interaction, restore the idle state
    this._updateJoystickValues(0, 0);
};

_p._updateJoystickValues = function(deltaX, deltaY) {
    var newAzimuth = 0;
    var newRadius = 0;

    // In case if the joystick is idle, we don't need to proceed with calculations
    if (deltaX != 0 || deltaY != 0) {
        newRadius = Math.sqrt(deltaX*deltaX + deltaY*deltaY)/this._controllerRadius;

        // User slided too far away, joystick is returned to idle state
        if (newRadius > 1) {
            deltaX = 0;
            deltaY = 0;
            newRadius = 0;
        } else {
            newAzimuth = Math.atan2(deltaY, deltaX);
        }
    }

    // If the values have actually changed, notify listeners
    if (this._azimuth != newAzimuth || this._radius != newRadius) {
        this._azimuth = newAzimuth;
        this._radius = newRadius;
        this._deltaX = deltaX;
        this._deltaY = deltaY;
        this.emit("joystickchange", {
            azimuth: newAzimuth,
            radius: newRadius });
    }
};