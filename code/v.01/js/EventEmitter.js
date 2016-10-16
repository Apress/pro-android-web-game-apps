/**
 * The base class for all classes that can fire events
 */
function EventEmitter() {
    this._listeners = {};
}

_p = EventEmitter.prototype;

/**
 * Registers the function to receive the notifications about the events
 * of the given type
 * @param type the type of the event
 * @param listener the listener function to add to listener list
 */
_p.addListener = _p.on = function(type, listener) {
    if (typeof listener !== "function")
        throw "Listener must be a function";

    if (!this._listeners[type]) {
        this._listeners[type] = [];
    }

    this._listeners[type].push(listener);
};

/**
 * Unsubscribes the given listerer from the given event type
 * @param type the type of the event
 * @param listener the listener function to remove from listener list
 */
_p.removeListener = function(type, listener) {
    if (typeof listener !== "function")
        throw "Listener must be a function";

    if (!this._listeners[type])
        return;

    var position = this._listeners[type].indexOf(listener);
    if (position != -1)
        this._listeners[type].splice(position, 1);
};

/**
 * Remove all listeners registered for the given type of the
 * event. If type is omitted, removes all listeners from the object.
 * @param type the type of the event (optional)
 */
_p.removeAllListeners = function(type) {
    if (type) {
        this._listeners[type] = [];
    } else {
        this._listeners = {};
    }
};

/**
 * Notifies all listeners subscribed to the given event type,
 * passing the event object as the parameter
 * @param type the type of the event
 * @param event the event object
 */
_p.emit = function(type, event) {
    if (!(this._listeners[type] && this._listeners[type].length)) {
        return;
    }

    for (var i = 0; i < this._listeners[type].length; i++) {
        this._listeners[type][i].call(this, event);
    }
};