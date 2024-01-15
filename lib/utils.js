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

	exports = module.exports = {
		escapeHTML,
		mergeM3U8,
		mergeXMLTV
	}
})();
