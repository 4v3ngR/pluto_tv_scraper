(function() {
	const fs = require('fs');
	const program = require('commander');

	// TODO: remove the duplication
	const options = program
		.option('--config <configfile>', 'provide the location to the configuration file')
		.option('--mapping <region,IP>', 'provide a region and IP address to process instead of the mapping')
		.option('--outdir <outdir>', 'provide the destination directory')
		.option('--clientid <clientid>', 'provide a client id')
		.option('--all', 'merge all regions into a single playlist and epg')
		.option('--chno <num>', 'start channel numbering at the provided value, spans multiple regions')
		.option('--group [genre|country]', 'specify the grouping in the playlist')
		.option('--regionalize', 'append the country code to the channel id')
		.option('--exclude-groups <regex>', 'exclude the groups that match the regular expression')
		.option('-h --help', 'display the help')
		.parse(process.argv)
		.opts();

	if (options.help) {
			console.log(`plutotv-scraper

  Options:
    --config <configfile>    : Provide the location to the configuration file
    --mapping <region,IP>    : Provide a region and IP address to process instead of the mapping
    --outdir <outdir>        : Provide the destination directory
    --clientid <clientid>    : Provide a client id
    --all                    : Merge all regions into a single playlist and epg
    --chno <num>             : Start channel numbering at the provided value, spans multiple regions
    --group [genre|country]  : Specify the grouping within the playlist (default is "genre")
    --regionalize            : append the country code to the channel id
    --exclude-groups <regex> : exclude the groups that match the regular expression
    --help                   : Display this help
	`);

		process.exit(0);
	}

	let config = {};
	const loadConfig = () => {
		const defaultconfig = {
			outdir: '.',
			clientID: '00000000-0000-0000-0000-000000000000',
			mapping: {
				us: '45.50.96.71'
			},
			all: false,
			group: 'genre',
			regionalize: false,
			excludeGroups: false,
			chno: false
		}

		try {
			const configfile = options.config || './config.json';
			const c = JSON.parse(fs.readFileSync(configfile, 'utf-8'));
	
			// NOTE: this code will convert the keys in the config.json to lowercase to match
			// the commandline options.
			for (let key of Object.keys(defaultconfig)) {
				const lck = key.toLowerCase();
				config[lck] = options[lck] || options[key] || c[key] || defaultconfig[key];
			}
		} catch (ex) {}
	}

	const get = (key) => {
		return config[key.toLowerCase()];
	}

	const getMapping = () => {
		if (options.mapping) {
			const [ region, IP = false ] = options.mapping.split(',');
			const res = {};
			res[region] = IP;
			return res;
		}

		return get('mapping');
	}

	exports = module.exports = {
		loadConfig,
		get,
		getMapping
	}
})();
