exports = module.exports = Animal;

function Animal() {
    console.log("New animal is born");
}    

var _p = Animal.prototype;

_p.sayHello = function() {
    console.log("Hello, I'm a humble animal");
};

function makeNewAnimal() {
    return new Animal();
}