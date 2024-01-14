(function() {
	const fs = require('fs');
	const converter = require('xml-js');

	const escapeHTML = str => str.replace(/[&<>'"]/g,
		tag => ({
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			"'": '&#39;',
			'"': '&quot;'
		}[tag]));

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

		// need to manually escape the '&' characters in the src attribute of the icon nodes
		const attributesFn = (attribs, name, element) => {
			if (name === 'icon' && attribs.src) {
				attribs.src = escapeHTML(attribs.src);
			}
			return attribs;
		}

		return res ? converter.json2xml(
			JSON.stringify(res),
			{compact: true, ignoreComment: true, spaces: 4, attributesFn}
		) : null;
	}

	const getMapping = (options, config) => {
		if (options.mapping) {
			const [ region, IP = false ] = options.mapping.split(',');
			const res = {};
			res[region] = IP;
			return res;
		}

		return config.get('mapping');
	}

	const displayHelp = () => {
		console.log(`plutotv-scraper

  Options:
    --config <configfile>   : Provide the location to the configuration file
    --mapping <region,IP>   : Provide a region and IP address to process instead of the mapping
    --outdir <outdir>       : Provide the destination directory
    --clientid <clientid>   : Provide a client id
    --all                   : Merge all regions into a single playlist and epg
    --group [genre|country] : Specify the grouping within the playlist (default is "genre")
    --regionalize           : append the country code to the channel id
    --help                  : Display this help
  `);
	}

	exports = module.exports = {
		escapeHTML,
		mergeM3U8,
		mergeXMLTV,
		getMapping,
		displayHelp
	}
})();
