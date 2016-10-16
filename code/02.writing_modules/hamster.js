var Animal = require("./animal");
var util = require("util");

function Hamster() {
    Animal.call(this);
    console.log("It's the hamster");
}
util.inherits(Hamster, Animal);

var _p = Hamster.prototype;

_p.sayHello = function() {
    console.log("(chewing carrot)");
};

exports = module.exports = Hamster;
