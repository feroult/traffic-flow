const assert = require('assert');

const sim = require('../sim');

describe('sim', function () {
    it('says hello', () => {
        assert.equal('hello', sim());
    });
});