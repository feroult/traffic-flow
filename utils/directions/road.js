const Strech = require('./strech');

class Road {

    constructor(attrs) {
        this.length = attrs.length;
        this.stretchesLength = attrs.length / attrs.stretches.length;
        this.stretches = attrs.stretches.map(strech => {
            strech.length = this.stretchesLength;
            new Strech(strech)
        });
    }

}

module.exports = Road;