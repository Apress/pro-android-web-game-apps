function LobbyUsersList(listElement, clickCallback) {
    this._users = {};
    this._listElement = listElement;
    this._clickCallback = clickCallback;
}

var _p = LobbyUsersList.prototype;

_p.add = function(userId, username, status) {
    // If the user is already present for some reason,
    // just update the information about him
    if (this._users[userId]) {
        this.setStatus(userId, status);
        this.setName(userId, username);
    } else {
        // Otherwise, create new element and append it to DOM tree
        var el = this._users[userId] = this._getUserListElement(userId, username, status);
        this._listElement.appendChild(el);

        // When the list item is clicked, it extracts the current
        // data about the user, and executes the callback
        el.addEventListener("click", (function(e) {
            var userId = el.getAttribute("data-userid");
            var userName = el.innerHTML;
            var state = el.className;
            this._clickCallback.call(this, userId, userName, status);
        }).bind(this));
    }
};

_p.setStatus = function(userId, status) {
    // Setting "status" means just updating the class name
    if (this._users[userId]) {
        this._users[userId].className = status;
    }
};

_p.setName = function(userId, name) {
    // Name is innerHTML
    if (this._users[userId]) {
        this._users[userId].innerHTML = name;
    }
};

_p.remove = function(userId) {
    if (this._users[userId]) {
        this._listElement.removeChild(this._users[userId]);
        delete this._users[userId];
    }
};

_p._getUserListElement = function(userId, userName, status) {
    // Create the new element (list item)
    // and set values 
    var el = document.createElement("li");
    el.className = status;
    
    // We save the custom data, associated with this element, 
    // using HTML5 data attributes
    // http://dev.w3.org/html5/spec/Overview.html#embedding-custom-non-visible-data-with-the-data-attributes
    el.setAttribute("data-userid", userId);
    el.innerHTML = userName;
    return el;
};
