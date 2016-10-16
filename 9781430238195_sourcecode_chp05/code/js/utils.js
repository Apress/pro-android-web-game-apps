/**
 * Does the prototype-based inheritance as described in chapter 1.
 * @param subConstructor the constructor function of the subclass
 * @param superConstructor the constructor function of the superclass
 */
function extend(subConstructor, superConstructor) {
    subConstructor.prototype = Object.create(superConstructor.prototype, {
        constructor: {
            value: subConstructor,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
}

/**
 * Checks if we're working with the touchscreen or with the
 * regular desktop browser. Used to determine, what kind of events should we use:
 * mouse events or touch events.
 */
function isTouchDevice() {
    return ('ontouchstart' in document.documentElement);
}

window.requestAnimationFrame = (function(){
    //Check for each browser
    //@paul_irish function
    //Globalises this function to work on any browser as each browser has a different namespace for this
    return  window.requestAnimationFrame       ||  //Chromium
        window.webkitRequestAnimationFrame ||  //Webkit
        window.mozRequestAnimationFrame    || //Mozilla Geko
        window.oRequestAnimationFrame      || //Opera Presto
        window.msRequestAnimationFrame     || //IE Trident?
        function(callback, element){ //Fallback function
            return window.setTimeout(callback, 1000/60);
        }

})();

window.cancelRequestAnimFrame = ( function() {
    return window.cancelAnimationFrame          ||
        window.webkitCancelRequestAnimationFrame    ||
        window.mozCancelRequestAnimationFrame       ||
        window.oCancelRequestAnimationFrame     ||
        window.msCancelRequestAnimationFrame        ||
        clearTimeout
} )();

if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var fSlice = Array.prototype.slice,
            aArgs = fSlice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {},
            fBound = function () {
                return fToBind.apply(this instanceof fNOP
                    ? this
                    : oThis || window,
                    aArgs.concat(fSlice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}