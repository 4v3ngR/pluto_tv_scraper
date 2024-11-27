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
		.option('--chno <num>', 'start channel numbering at the provided value, spans all regions')
		.option('--group [genre|country]', 'specify the grouping in the playlist')
		.option('--regionalize', 'append the country code to the channel id')
		.option('--exclude-groups <regex>', 'exclude the groups that match the regular expression')
		.option('--exclude-channels <regex>', 'exclude the channels that match the regular expression')
		.option('--port <num>', 'start a small web server to serve the generated files')
		.option('--refresh <seconds>', 'automatically refetch the files at the provided interval')
		.option('--unique-clientid', 'generate a unique id for each client requesting the playlist via the inbuilt server')
		.option('--random-clientid', 'generate a random id for each request of the playlist via the inbuilt server')
		.option('--x-tvg-url <url>', 'specify a custom x-tvg-url value in the EXTM3U header')
		.option('--ondemand', 'generate a playlist and xml for ondemand movies')
		.option('--vlcopts', 'includes the VLCOPTS m3u8 entries')
		.option('-h --help', 'display the help')
		.parse(process.argv)
		.opts();

	if (options.help) {
			console.log(`plutotv-scraper

  Options:
    --config <configfile>      : Provide the location to the configuration file
    --mapping <region,IP>      : Provide a region and IP address to process instead of the mapping
    --outdir <outdir>          : Provide the destination directory
    --clientid <clientid>      : Provide a client id
    --all                      : Merge all regions into a single playlist and epg
    --chno <num>               : Start channel numbering at the provided value, spans all regions
    --group [genre|country]    : Specify the grouping within the playlist (default is "genre")
    --regionalize              : Append the country code to the channel id
    --exclude-groups <regex>   : Exclude the groups that match the regular expression
    --exclude-channels <regex> : Exclude the channels that match the regular expression
    --port <num>               : Start a small web server to serve the generated files
    --refresh <seconds>        : Automatically refetch the files at the provided interval
    --unique-clientid          : Generate a unique id for each client requesting the playlist via
                                 the inbuilt server
    --random-clientid          : Generate a random id for each request of the playlist via the
                                 inbuilt server
    --x-tvg-url <url>          : Specify a custom x-tvg-url value in the EXTM3U header
    --ondemand                 : Generate a playlist and xml for ondemand movies
    --vlcopts                  : Includes the VLCOPTS m3u8 entries
    --help                     : Display this help
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
			excludeChannels: false,
			chno: false,
			port: false,
			uniqueClientid: false,
			randomClientid: false,
			refresh: 0,
			xTvgUrl: false,
			ondemand: false,
			vlcopts: false
		}

		let c = {};
		try {
			const configfile = options.config || './config.json';
			c = JSON.parse(fs.readFileSync(configfile, 'utf-8'));
		} catch (ex) {
			c = {};
		}

		// NOTE: this code will convert the keys in the config.json to lowercase to match
		// the commandline options.
		for (let key of Object.keys(defaultconfig)) {
			const lck = key.toLowerCase();
			config[lck] = options[lck] || options[key] || c[key] || defaultconfig[key];
		}
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
