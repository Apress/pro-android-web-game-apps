/**
 * The implementation of the InputHandler for the desktop
 * browser based on the mouse events.
 */
function MouseInputHandler(element) {
    InputHandlerBase.call(this, element);

    // We need additional property to track if the
    // mouse is down.
    this._mouseDown = false;
    this._attachDomListeners();
}

extend(MouseInputHandler, InputHandlerBase);

_p = MouseInputHandler.prototype;

/**
 * Attach the listeners to the mouseXXX DOM events
 */
_p._attachDomListeners = function() {
    var el = this._element;
    el.addEventListener("mousedown", this._onDownDomEvent.bind(this), false);
    el.addEventListener("mouseup", this._onUpDomEvent.bind(this), false);
    el.addEventListener("mousemove", this._onMoveDomEvent.bind(this));
    el.addEventListener("mouseout", this._onMouseOut.bind(this));
};

/**
 * This method (and the next one) is overridden,
 * because we have to track the state of the mouse.
 * This could also be done in the separate listener.
 */
_p._onDownDomEvent = function(e) {
    this._mouseDown = true;
    InputHandlerBase.prototype._onDownDomEvent.call(this, e);
};

_p._onUpDomEvent = function(e) {
    this._mouseDown = false;
    InputHandlerBase.prototype._onUpDomEvent.call(this, e);
};

/**
 * We process the move event only if the mouse button is
 * pressed, otherwise the DOM event is ignored.
 */
_p._onMoveDomEvent = function(e) {
    if (this._mouseDown) {
        InputHandlerBase.prototype._onMoveDomEvent.call(this, e);
    }
};

_p._onMouseOut = function() {
    this._mouseDown = false;
};