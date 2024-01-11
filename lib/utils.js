(function() {
	const fs = require('fs');
	const converter = require('xml-js');

	const mergeM3U8 = (playlists) => {
		let res = "#EXTM3U\n";
		for (let region in playlists) {
			const playlist = playlists[region];
			const lines = playlist.split('\n');
			for (let line of lines) {
				if (line.indexOf("#EXTM3U") === 0) continue;
				res += `${line}\n`;
			}
		}
		return res;
	}

	const mergeXMLTV = (epgs) => {
		let res = null;
		for (let region in epgs) {
			const contents = epgs[region];
			const json = JSON.parse(converter.xml2json(contents, {compact: true, spaces: 4}));
			if (!res) {
				res = json;
				continue;
			}
			res.tv.channel = res.tv.channel.concat(json.tv.channel);
			res.tv.programme = res.tv.programme.concat(json.tv.programme);
		}

		return res ? converter.json2xml(
			JSON.stringify(res),
			{compact: true, ignoreComment: true, spaces: 4}
		) : null;
	}

	const getMapping = (options, config) => {
		if (options.mapping) {
			const [ region, IP = '0.0.0.0' ] = options.mapping.split(',');
			const res = {};
			res[region] = IP;
			return res;
		}

		return config.mapping || { 'localhost': '127.0.0.1' };
	}

	const displayHelp = () => {
		console.log(`plutotv-scraper

  Options:
    --config <configfile> : Provide the location to the configuration file
    --mapping <region,IP> : Provide a region and IP address to process instead of the mapping
    --outdir <outdir>     : Provide the destination directory
    --clienid <clientid>  : Provide a client id
    --all                 : Merge all regions into a single playlist and epg
    --help                : Display this help
  `);
	}

	exports = module.exports = {
		mergeM3U8,
		mergeXMLTV,
		getMapping,
		displayHelp
	}
})();
