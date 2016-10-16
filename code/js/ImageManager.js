/**
 * Image manager is responsible for loading multiple images and
 * notifying about load progress, errors and the end of current
 * download queue.
 */
function ImageManager(placeholderDataUri) {
	this._imageQueue = [];
	this._images = {};
	if (placeholderDataUri) {
		this._placeholder = new Image();
		this._placeholder.src = placeholderDataUri;
	}
}

_p = ImageManager.prototype;

/**
 * Adds the image to queue (but the download isn't started until you call
 * loadImages)
 * @param key - the image alias (used in getImage)
 * @param path - the path to download from
 */
_p._addImage = function(key, path) {
	this._imageQueue.push({
		key: key,
		path: path
	});
};

/**
 * TODO: UPDATE DOCS
 * Starts the download process. Notifies the listener
 * about the events.
 * @param onProgress listener callback accepting 5 parameters:
 * 		loaded: the number of images that finished loading (successfully or not)
 * 		total: the total number of images in the queue
 * 		key: the alias of the last loaded image
 * 		path: the path of the last loaded image
 * 		sucecss: true if loading completed fine, false otherwise
 * onProgress is called after each downloaded image passing the number of images that
 * finished loading (with or without errors) and the total number of items.
 */
_p.load = function(images, onDone, onProgress) {
    for (var im in images) {
        this._addImage(im, images[im]);
    }

    var noop = function() {};
    onDone = onDone || noop;
    onProgress = onProgress || noop;

	var queue = this._imageQueue;
	this._imageQueue = [];

	if (queue.length == 0) {
		onProgress(0, 0, null, null, true);
		return;
	}

	var itemCounter = {
		loaded: 0,
		total: queue.length
	};

	for (var i = 0; i < queue.length; i++) {
		this._loadItem(queue[i], itemCounter, onDone, onProgress);
	}
};

_p._loadItem = function(queueItem, itemCounter, onDone, onProgress) {
	var self = this;
	var img = new Image();
	img.onload = function() {
		self._images[queueItem.key] = img;
		self._onItemLoaded(queueItem, itemCounter, onDone, onProgress, true);
	};

	img.onerror = function() {
		self._images[queueItem.key] = self._placeholder ? self._placeholder : null;
		self._onItemLoaded(queueItem, itemCounter, onDone, onProgress, false);
	};
	img.src = queueItem.path;
};

_p._onItemLoaded = function(queueItem, itemCounter, onDone, onProgress, success) {
	itemCounter.loaded++;
	onProgress(itemCounter.loaded, itemCounter.total, queueItem.key, queueItem.path, success);
    if (itemCounter.loaded == itemCounter.total) {
        onDone();
    }
};

/**
 * Returms the loaded image by the given value
 * @param key image alias
 */
_p.get = function(key) {
	return this._images[key];
};