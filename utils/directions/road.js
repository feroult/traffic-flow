const Strech = require('./strech');

class Road {

    constructor(attrs) {
        this.length = attrs.length;
        this.streches = attrs.stretches.map(strech => new Strech(strech));
    }

    strechLength() {
        return this.length / this.streches.length;
    }

}

module.exports = Road;