/**
 * The "abstract" base for MouseInputHandler and TouchInputHandler. This class is not
 * supposed to be instantiated directly. It provides the common base for touch and
 * mouse input handling.
 *
 * @param element the DOM element to work with - concrete input handlers will
 * register as event handlers of this element. In gamedev projects the
 * element is usually the main canvas
 */
function InputHandlerBase(element) {
    EventEmitter.call(this);

    // The DOM element
    this._element = element;

    this._moving = false;
    this._lastMoveCoordinates = null;
    this._moveThreshold = 10;
    this._stopDomEvents = true;
}

extend(InputHandlerBase, EventEmitter);

_p = InputHandlerBase.prototype;

_p.getMoveTheshold = function() {
    return this._moveThreshold;
};

_p.setMoveThreshold = function(moveThreshold) {
    this._moveThreshold = moveThreshold;
};

_p.getStopDomEvents = function() {
    return this._stopDomEvents;
};

_p.setStopDomEvents = function(stopDomEvents) {
    this._stopDomEvents = stopDomEvents;
};

/**
 * Listens to the "down" DOM events: mousedown and touchstart.
 * @param e DOM Event
 */
_p._onDownDomEvent = function(e) {
    // We must save this coordinates to support the moveThreshold - this
    // may be the starting point of the movement, we can't simply
    var coords = this._lastMoveCoordinates = this._getInputCoordinates(e);

    // Emit "down" event - all coordinates together with the
    // original DOM event are passed to listeners
    this.emit("down", {x: coords.x, y: coords.y, domEvent: e});

    // Usually we want to stop original the DOM events from further browser processing.
    this._stopEventIfRequired(e);
};

/**
 * Listens to the "up" DOM events: mouseup and touchend. Touchend
 * doesn't have any coordinates associated with it so this function
 * will be overridden in TouchInputHandler
 * @param e DOM Event
 */
_p._onUpDomEvent = function(e) {
    // Works exactly the same way as _onDownDomEvent
    var coords = this._getInputCoordinates(e);
    this.emit("up", {x: coords.x, y: coords.y, moved: this._moving, domEvent: e});
    this._stopEventIfRequired(e);

    // The interaction is ended. Reset the flag
    this._moving = false;
};

/**
 * Listens to the "move" DOM events: mousemove and touchmove. This function
 * is slightly more complex. It keeps track of the distance travelled since the last
 * "move" action, besides it ignores the movement and swallows the event if we are
 * still within the _moveThreshold
 * @param e DOM event
 */
_p._onMoveDomEvent = function(e) {
    var coords = this._getInputCoordinates(e);

    // Calculate deltas
    var deltaX = coords.x - this._lastMoveCoordinates.x;
    var deltaY = coords.y - this._lastMoveCoordinates.y;

    // Check threshold, if the distance from the initial tap to the current position
    // is more than the threshold value - qualify it as a real movement
    if (!this._moving && Math.sqrt(deltaX*deltaX + deltaY*deltaY) > this._moveThreshold) {
        this._moving = true;
    }

    // If the current interaction is "moving" (we crossed the threshold already) then emit
    // the event, otherwise, just ignore the interaction.
    if (this._moving) {
        this.emit("move", {x: coords.x, y: coords.y, deltaX: deltaX, deltaY: deltaY, domEvent: e});
        this._lastMoveCoordinates = coords;
    }

    this._stopEventIfRequired(e);
};

_p._stopEventIfRequired = function(e) {
    if (this._stopDomEvents) {
        e.stopPropagation();
        e.preventDefault();
    }
};

_p._getInputCoordinates = function(e) {
    var element = this._element;
    var coords = e.targetTouches ? e.targetTouches[0] : e;

    return {
        x: (coords.pageX || coords.clientX + document.body.scrollLeft) - element.offsetLeft,
        y: (coords.pageY || coords.clientY + document.body.scrollTop) - element.offsetTop
    };
};