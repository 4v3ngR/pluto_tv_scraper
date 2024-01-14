(function() {
	const fs = require('fs');

	let config = {};

	const loadConfig = (options) => {
		const defaultconfig = {
			outdir: '.',
			clientid: '00000000-0000-0000-0000-000000000000',
			mapping: {
				us: '45.50.96.71'
			},
			all: false,
			group: 'genre',
			regionalize: false
		}

		try {
			const configfile = options.config || './config.json';
			const c = JSON.parse(fs.readFileSync(configfile, 'utf-8'));
	
			// NOTE: this code will convert the keys in the config.json to lowercase to match
			// the commandline options.
			for (let key of Object.keys(defaultconfig)) {
				const lck = key.toLowerCase();
				config[lck] = options[lck] || c[key] || defaultconfig[lck];
			}
		} catch (ex) {}
	}

	const get = (key) => {
		return config[key.toLowerCase()];
	}

	exports = module.exports = {
		loadConfig,
		get
	}
})();
