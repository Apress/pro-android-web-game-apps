/**
 * This is the base class to support the animation.
 * @param duration - the duration of the one loop of the animation in milliseconds.
 * For example, for a 6-frame animation where each frame is staying on the
 * screen for 50 milliseconds the duration will be 300 milliseconds.
 *
 * The constructor accepts the bare minimum of parameters: the rest is set via setters:
 * setRepeatBehavior and setRepeatCount (see the function docs for the details)
 *
 * Animator doesn't handle the timing internally. It should be used with the external
 * timer. The external timer calls the update() function, passing the number of milliseconds
 * since the previous call as the parameter.
 */
function Animator(duration) {
	this._duration = duration;

	// total loops to do
	this._repeatCount = 1;

	// the fraction to accelerate
	this._acceleration = 0;

	// the fraction to decelerate
	this._deceleration = 0;

	// How many loops were actually done
	this._loopsDone = 0;

	// Default repeat behavior is LOOP
	this._repeatBehavior = Animator.RepeatBehavior.LOOP;

	// Time, passed since the start of the loop
	this._timeSinceLoopStart = 0;

	// This flag is used to indicate that the animator has already
	// started to work with the certain configuration of parameters (repeatCount, repeat
	this._started = false;
	this._running = false;

	// Flag to mark that this loop is going into the opposite direction
	this._reverseLoop = false;
}

_p = Animator.prototype;

/**
 * A possible parameter to setLoopCount.
 */
Animator.INFINITE = -1;

/**
 * RepeatBehavior determines what animator does after reaching the end of the loop.
 * If it is set to Animator.RepeatBehavior.LOOP, then the next loop will start from 0 again,
 * proceeding to 1. If the behavior is Animator.RepeatBehavior.REVERSE the odd loops will run
 * backwards - from 1 to 0. Obviously setting this parameter only makes sense when the
 * number of loops is more than 1.
 */
Animator.RepeatBehavior = {
	LOOP: 1,
	REVERSE: 2
};

/**
 * Starts the animator. After the animator is started you can't
 * change its parameters until stop() is called.
 */
_p.start = function() {
	this._started = true;
	this._running = true;
};

/**
 * Checks if animator is currently running
 */
_p.isRunning = function() {
	return this._running;
};

/**
 * Stops the animator and resets the internal state. This function
 * may be called multiple times.
 */
_p.stop = function() {
	this._loopsDone = 0;
	this._timeSinceLoopStart = 0;
	this._running = false;
	this._started = false;
};

/**
 * Pauses the animator. The animator will ignore the updates while paused, "freezing"
 * the animation but not resetting its state. The animation can be then resumed
 */
_p.pause = function() {
	this._running = false;
};

/**
 * Returns the duration of one loop of the animation
 */
_p.getDuration = function() {
	return this._duration;
};

/**
 * Sets the duration of one loop of the animation. Should be value >=1
 */
_p.setDuration = function(duration) {
	this._throwIfStarted();
	if (duration < 1) {
		throw "Duration can't be < 1";
	}
	this._duration = duration;
};

/**
 * Returns the configured repeat count, default is 1.
 */
_p.getRepeatCount = function() {
	return this._repeatCount;
};

/**
 * Set the number of loops in the animation, default is 1. Valid values
 * are integers, -1 or Animator.INFINITE for infinite looping
 */
_p.setRepeatCount = function(repeatCount) {
	this._throwIfStarted();

	if (repeatCount < 1 && repeatCount != Animator.INFINITE)
		throw "Repeat count must be greater than 0 or INFINITE";
	this._repeatCount = repeatCount;
};

/**
 * Returns the configured repeat behavior of the animator. Possible values are
 * Animator.RepeatBehavior.LOOP and Animator.RepeatBehavior.REPATE. Read the docs for
 * Animator.RepeatBehavior for the details on how they differ.
 */
_p.getRepeatBehavior = function() {
	return this._repeatBehavior;
};

/**
 * Sets the repeat behavior, default value is Animator.RepeatBehavior.LOOP
 * @param behavior the new repat behavior
 */
_p.setRepeatBehavior = function(behavior) {
	this._throwIfStarted();
	if (behavior != Animator.RepeatBehavior.LOOP && behavior != Animator.RepeatBehavior.REVERSE) {
		throw "Repeat behavior should be either RepeatBehavior.LOOP or RepeatBehavior.REVERSE";
	}
	this._repeatBehavior = behavior;
};

/**
 * Returns the current value for the acceleration, default is 0.
 */
_p.getAcceleration = function() {
	return this._acceleration;
};

/**
 * Sets the value for the acceleration. The value must be between 0 and 1-deceleration.
 * @param acceleration new acceleration
 */
_p.setAcceleration = function(acceleration) {
	this._throwIfStarted();
	if (acceleration < 0 || acceleration > 1 || acceleration > (1 - this._deceleration)) {
		throw "Acceleration value must be from 0 to 1 and cannot be greater than (1 - deceleration)";
	}

	this._acceleration = acceleration;
};

/**
 * Returns the current value for the deceleration, default is 0.
 */
_p.getDeceleration = function() {
	return this._deceleration;
};


/**
 * Sets the value for the deceleraion. The value must be between 0 and 1-deceleration.
 * @param acceleration new acceleration
 */
_p.setDeceleration = function(deceleration) {
	this._throwIfStarted();
	if (deceleration < 0 || deceleration > 1 || deceleration > (1 - this._acceleration)) {
		throw "Deceleration value must be from 0 to 1 and cannot be greater than (1 - acceleration)";
	}

	this._deceleration = deceleration;
};


/**
 * In the default implementation the preprocessor takes into the account
 * only acceleration and deceleration. In more advanced implementation it might
 * use easing functions or any other more advanced transformations.
 */
_p._timingEventPreprocessor = function(fraction) {
	return this._accelerationDecelerationPreprocessor(fraction);
};

/**
 * Calculates the fraction with the respect to the acceleration and deceleration values.
 * See the SMIL 2.0 specification for details on this calculation. You shouldn't really dive deep
 * into the details of this particular piece of code, if you're not very curious.
 */
_p._accelerationDecelerationPreprocessor = function(fraction) {
	if (this._acceleration || this._deceleration) {
		var runRate = 1/(1 - this._acceleration/2 - this._deceleration/2);
		if (fraction < this._acceleration) {
			fraction *= runRate * (fraction / this._acceleration) / 2;
		} else if (fraction > (1 - this._deceleration)) {
			// time spent in deceleration portion
			var tdec = fraction - (1 - this._deceleration);
			// proportion of tdec to total deceleration time
			var pdec  = tdec / this._deceleration;
			fraction = runRate * (1 - ( this._acceleration / 2) -
					this._deceleration + tdec * (2 - pdec) / 2);
		} else {
			fraction = runRate * (fraction - (this._acceleration / 2));
		}
		// clamp fraction to [0,1] since above calculations may
		// cause rounding errors
		if (fraction < 0) {
			fraction = 0;
		} else if (fraction > 1) {
			fraction = 1;
		}
	}

	return fraction;
};

/**
 * This function should be called by the external timer to update the state
 * of the animator.
 * @param deltaTime - time passed since the last upate. 0 is valid value.
 */
_p.update = function(deltaTime) {

	// Will return undefined
	if (!this._started) {
		return;
	}

	// If the animator is paused we pass 0 as deltaTime - like nothing has changed
	if (!this._running) {
		deltaTime = 0;
	}

	this._timeSinceLoopStart += deltaTime;

	// If we exceeded the loop time, we must take care of what to do next:
	// adjust the direction of the animation, call hook functions etc.
	if (this._timeSinceLoopStart >= this._duration) {

		// Just in case, we skipped more than one loop, determine how many loops did we miss
		var loopsSkipped = Math.floor(this._timeSinceLoopStart/this._duration);
		this._timeSinceLoopStart %= this._duration;

		// truncate to the number of loops skipped. Even if we skipped 5 loops,
		// but there was only 3 left, we don't want to fire extra listeners.
		if (this._repeatCount != Animator.INFINITE && loopsSkipped > this._repeatCount - this._loopsDone) {
			loopsSkipped = this._repeatCount - this._loopsDone;
		}

		// Call the hook for each of the skipped loops
		for (var i = 1; i <= loopsSkipped; i++) {
			this._loopsDone++;
			this._reverseLoop = this._repeatBehavior == Animator.RepeatBehavior.REVERSE && this._loopsDone % 2 == 1;
			this._onLoopEnd(this._loopsDone);
		}

		// Check if we reached the end of the animation
		if (this._repeatCount != Animator.INFINITE && this._loopsDone == this._repeatCount) {
			this._onAnimationEnd();
			this.stop();
			return;
		}
	}

	// If this is the loop that is going backwards - reverse the fraction as well
	var fraction = this._timeSinceLoopStart/this._duration;
	if (this._reverseLoop)
		fraction = 1 - fraction;

	// Give away for preprocessing (acceleration/deceleration, easing functions etc)
	fraction = this._timingEventPreprocessor(fraction);

	// Call update
	this._onUpdate(fraction, this._loopsDone);
	return fraction;
};

/**
 * Hook function. Override in subclass to provide the specific
 * implementation of the updates. For example, you may change the
 * active frame, adjust the coordinates or color of the object.
 *
 * @param fraction the current fraction of the animation: from 0 to 1
 * @param loopsDone how many loops done already.
 */
_p._onUpdate = function(fraction, loopsDone) {

};

/**
 * Hook function - called when the loop ends. Should be owerwritten in
 * subclasses if you need any extra functionality here.
 * @param loopsDone the number of loops done from the start of the animation,
 * the latest loop is included.
 */
_p._onLoopEnd = function(loopsDone) {

};

/**
 * Hook function - called when the animation ends to be owerwritten in
 * subclasses if you need any extra functionality here.
 */
_p._onAnimationEnd = function() {

};

/**
 * This function is called to ensure that the animator is not running
 * (changing the setting of the running animator is not allowed)
 */
_p._throwIfStarted = function() {
	if (this._started)
		throw "Cannot change property on the started animator";
};
