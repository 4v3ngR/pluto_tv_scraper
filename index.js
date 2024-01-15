#!/usr/bin/env node

(async function() {
	const fs = require('fs');
	const config = require('./lib/config');
	const plutotv = require('./lib/plutotv');

	config.loadConfig();
	await plutotv.process(config);
})();
