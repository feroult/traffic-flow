#!/usr/bin/env node

const dnode = require('dnode');
const argv = require('./options')(false);

console.log('argv', argv);

// const d = dnode.connect(argv.port);
//
// d.on('remote', function (remote) {
//     remote.control(argv);
//     process.exit(0);
// });
