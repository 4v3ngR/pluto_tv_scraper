#!/usr/bin/env node

process.title = "plutotv scraper";

const check = (minver) => {
	let semver = process.versions.node.split('.');
	if (semver[0] < minver) {
		console.error(`ERROR: nodejs is too old. Version ${minver} or greater is required.`);
		console.error(`ERROR: ${process.versions.node} installed`);
		process.exit(1);
	}
}

check(16);

(async function() {
	const fs = require('fs');
	const config = require('./lib/config');
	const plutotv = require('./lib/plutotv');
	const server = require('./lib/server');

	config.loadConfig();

	const port = config.get('port');
	const refresh = config.get('refresh');
	if (refresh && refresh < 3600) {
		console.error("ERROR: please set refresh interval to be at least 3600 seconds");
		process.exit(1);
	}

	if (port && refresh) {
		setInterval(() => plutotv.process(config), refresh * 1000);
		server.serve(config);
	} else if (port) {
		server.serve(config);
	} else {
		await plutotv.process(config);
	}
})();
