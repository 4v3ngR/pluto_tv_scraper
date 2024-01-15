#!/usr/bin/env node

const check = (minver) => {
	let semver = process.versions.node.split('.');
	if (semver[0] < minver) {
		console.error(`ERROR: nodejs is too old. Version ${minver} or greater is required.`);
		console.error(`ERROR: ${process.versions.node} installed`);
		process.exit(1);
	}
}

check(14);

(async function() {
	const fs = require('fs');
	const config = require('./lib/config');
	const plutotv = require('./lib/plutotv');

	config.loadConfig();
	await plutotv.process(config);
})();
