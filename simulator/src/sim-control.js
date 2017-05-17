#!/usr/bin/env node

const dnode = require('dnode');
const argv = require('./options');

const d = dnode.connect(argv.port);

d.on('remote', function (remote) {
    remote.control();
    process.exit(0);
});
