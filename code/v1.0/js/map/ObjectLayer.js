function ObjectLayer(objects, clusterSize, worldWidth, worldHeight) {
    GameObject.call(this);
    this._objects = objects;
    this._clusterSize = clusterSize;
    this._worldWidth = worldWidth;
    this._worldHeight = worldHeight;

    /* the clusters arranged into the grid*/
    this._clusters = [];

    /* object id to Rect - the cluster bounds */
    this._idToClusterBounds = {};

    /* currently visible clusters */
    this._visibleClusterBounds = {};

    /* the sorted array of objects from active clusters, no duplicates*/
    this._cache = [];

    /* true if cache needs to be fully rebuilt */
    this._cacheDirty = true;

    /* true if cache only needs to be sorted (when object moved for example) */
    this._cacheUnsorted = false;

    this.addListener("up", this._onUpEvent.bind(this));

    this._boundOnMove = this._onObjectMove.bind(this);

    this._addMoveListeners();
    this._resetClusters();
}

extend(ObjectLayer, GameObject);
_p = ObjectLayer.prototype;

_p.setClusterSize = function(clusterSize) {
    this._clusterSize = clusterSize;
    this._resetClusters();
};

_p.setSize = function(width, height) {
    GameObject.prototype.setSize.call(this, width, height);
    this._updateVisibleClusters();
};

_p.setPosition = function(x, y) {
    GameObject.prototype.setPosition.call(this, x, y);
    this._updateVisibleClusters();
};

_p.draw = function(ctx, dirtyRect) {
    if (this._cacheDirty) {
        this._resetCache();
    } else if (this._cacheUnsorted) {
        this._sortCache();
    }

    dirtyRect = dirtyRect || new Rect(0, 0, this._bounds.width, this._bounds.height);

    for (var i = 0; i < this._cache.length; i++) {
        var obj = this._cache[i];
        if (this._getScreenBounds(obj).intersects(dirtyRect)) {
            obj.draw(ctx, dirtyRect, this._bounds.x, this._bounds.y);
        }
    }
};

_p._updateVisibleClusters = function() {
    var newRect = this._bounds.getOverlappingGridCells(this._clusterSize, this._clusterSize,
            this._clusters[0].length, this._clusters.length);

    if (!newRect.equals(this._visibleClusterBounds)) {
        this._visibleClusterBounds = newRect;
        this._cacheDirty = true;
    }
};

_p._resetCache = function() {
    var cache = this._cache = [];
    for (var i = this._visibleClusterBounds.y; i < this._visibleClusterBounds.y + this._visibleClusterBounds.height; i++) {
        for (var j = this._visibleClusterBounds.x; j < this._visibleClusterBounds.x + this._visibleClusterBounds.width; j++) {
            var cluster = this._clusters[i][j];
            for (var k = 0; k < cluster.length; k++) {
                if (cache.indexOf(cluster[k]) == -1) {
                    cache.push(cluster[k]);
                }
            }
        }
    }

    this._sortCache();
    this._cacheDirty = false;
    this._cacheUnsorted = false;
};

_p._sortCache = function() {
    this._cache.sort(function(a, b) {
        var aBounds = a.getBounds();
        var bBounds = b.getBounds();

        return (aBounds.y + aBounds.height) - (bBounds.y + bBounds.height);
    });
    this._cacheUnsorted = false;
};

_p._resetClusters = function() {
    this._clusters = [];
    for (var i = 0; i < Math.ceil(this._worldHeight/this._clusterSize); i++) {
        this._clusters[i] = [];
        for (var j = 0; j < Math.ceil(this._worldWidth/this._clusterSize); j++) {
            this._clusters[i][j] = [];
        }
    }

    for (i = 0; i < this._objects.length; i++) {
        var obj = this._objects[i];
        this._addToClusters(obj);
    }
};

_p._addMoveListeners = function() {
    for (var i = 0; i < this._objects.length; i++) {
        this._objects[i].addListener("move", this._boundOnMove);
    }
};

_p._onObjectMove = function(e) {
    var obj = e.object;
    var id = obj.getId();
    var objectBounds = obj.getBounds();

    var newClusters = objectBounds.getOverlappingGridCells(
        this._clusterSize, this._clusterSize, this._clusters[0].length, this._clusters.length);
    var oldClusters = this._idToClusterBounds[id];

    if (!oldClusters.equals(newClusters)) {
        this._moveObjectBetweenClusters(obj, oldClusters, newClusters);
    }

    if (newClusters.intersects(this._visibleClusterBounds) && e.y != e.oldY) {
        this._cacheUnsorted = true;
    }

    var worldBounds = obj.getBounds();
    this.markDirty(worldBounds.x - this._bounds.x, worldBounds.y - this._bounds.y,
        worldBounds.width, worldBounds.height);
    this.markDirty(new Rect(e.oldX - this._bounds.x, e.oldY - this._bounds.y, worldBounds.width, worldBounds.height));
};

_p._moveObjectBetweenClusters = function(obj, oldClusters, newClusters) {
    this._removeFromClusters(obj, oldClusters);
    this._addToClusters(obj, newClusters);
    this._idToClusterBounds[obj.getId()] = newClusters;

    // If object has left the screen, remove from cache
    if (newClusters.intersects(this._visibleClusterBounds)) {
        Arrays.addIfAbsent(obj, this._cache);
    } else {
        Arrays.remove(obj, this._cache);
    }
};

_p._removeFromClusters = function(obj, clusterBounds) {
    clusterBounds = clusterBounds || this._idToClusterBounds[obj.getId()];
    for (var clusterY = clusterBounds.y; clusterY < clusterBounds.y + clusterBounds.height; clusterY++) {
        for (var clusterX = clusterBounds.x; clusterX < clusterBounds.x + clusterBounds.width; clusterX++) {
            Arrays.remove(obj, this._clusters[clusterY][clusterX]);
        }
    }
};

_p._addToClusters = function(obj, clusterBounds) {
    clusterBounds = clusterBounds || obj.getBounds().getOverlappingGridCells(
        this._clusterSize, this._clusterSize, this._clusters[0].length, this._clusters.length);

    for (var clusterY = clusterBounds.y; clusterY < clusterBounds.y + clusterBounds.height; clusterY++) {
        for (var clusterX = clusterBounds.x; clusterX < clusterBounds.x + clusterBounds.width; clusterX++) {
            this._clusters[clusterY][clusterX].push(obj);
        }
    }
    this._idToClusterBounds[obj.getId()] = clusterBounds;
    return clusterBounds;
};

_p._onUpEvent = function(e) {
    if (e.moved)
        return;

    var x = e.x + this._bounds.x;
    var y = e.y + this._bounds.y;
    var obj = this.getObjectAt(x, y);
    if (obj) {
        obj.emit("up", e);
        this.emit("objectClicked", {object: obj, layer: this, cause: e});
    }
};

_p.getObjectAt = function(x, y) {
    for (var i = 0; i < this._cache.length; i++) {
        if (this._cache[i].getBounds().containsPoint(x, y)) {
            return this._cache[i];
        }
    }
    return null;
};

_p.addObject = function(obj) {
    this._objects.push(obj);
    obj.addListener("move", this._boundOnMove);
    var clusters = this._addToClusters(obj);
    if (clusters.intersects(this._visibleClusterBounds)) {
        this._cache.push(obj);
        this._cacheUnsorted = true;
        this.markDirty(this._getScreenBounds(obj));
    }
};

_p.removeObject = function(obj) {
    if (!Arrays.contains(obj, this._objects)) {
        return;
    }

    obj.removeListener("move", this._boundOnMove);
    this._removeFromClusters(obj);
    Arrays.remove(obj, this._cache);
    this._dirtyRectManager.markDirty(this._getScreenBounds(obj));
};

_p._getScreenBounds = function(obj) {
    var worldBounds = obj.getBounds();
    return new Rect(worldBounds.x - this._bounds.x, worldBounds.y - this._bounds.y,
        worldBounds.width, worldBounds.height);
};