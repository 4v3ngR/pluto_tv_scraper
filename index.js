#!/usr/bin/env node

let semver = process.versions.node.split('.');
if (semver[0] < 16) {
	console.error("ERROR: nodejs is too old. Version 16 or greater is required.");
	console.error(`ERROR: ${process.versions.node} installed`);
	process.exit(1);
}

(async function() {
	const fs = require('fs');
	const config = require('./lib/config');
	const plutotv = require('./lib/plutotv');

	config.loadConfig();
	await plutotv.process(config);
})();
