(function() {
	const fs = require('fs');
	const axios = require('axios');
	const converter = require('xml-js');
	const utils = require('#lib/utils.js');

	let categoriesList = null;
	const onDemandCategories = async (config, region, bootData) => {
		const jwt = bootData.sessionToken;
		const headers = {
			Authorization: `Bearer ${jwt}`
		};

		if (region) headers['X-Forwarded-For'] = config.get('mapping')[region];

		const resp = await axios.get('https://service-vod.clusters.pluto.tv/v4/vod/categories?includeItems=false&includeCategoryFields=iconSvg&offset=1000&page=1&sort=number%3Aasc', {headers});

		categoriesList = resp.data;
		return categoriesList;
	}

	const getItems = async (config, region, categoryID, bootData) => {
		const jwt = bootData.sessionToken;
		const headers = {
			Authorization: `Bearer ${jwt}`
		};

		if (region) headers['X-Forwarded-For'] = config.get('mapping')[region];

		const resp = await axios.get(`https://service-vod.clusters.pluto.tv/v4/vod/categories/${categoryID}/items?offset=0&page=1`, {headers});
		return resp.data;
	}

	const getVodItem = async (config, region, id, bootData) => {
		const jwt = bootData.sessionToken;
		const headers = {
			Authorization: `Bearer ${jwt}`
		};

		if (region) headers['X-Forwarded-For'] = config.get('mapping')[region];

		const resp = await axios.get(`https://service-vod.clusters.pluto.tv/v4/vod/items?ids=${id}`, {headers});
		return resp.data ? resp.data[0] : {};
	}

	// TODO: consolidate this and the life playlist generation code
	const generateM3U8 = async (config, region, bootData) => {
		const xTvgUrl = config.get('xTvgUrl');
		let cache = {};
		let newCache = {};
		let numChannels = 0;
		let chNo = 9000;
		let m3u8 = "#EXTM3U\n\n";
		let fullTvgUrl = false;

		if (xTvgUrl) fullTvgUrl = xTvgUrl + (xTvgUrl.endsWith('/') ? `plutotv_ondemand_${region}.xml` : '');

		// try to init the cache
		const outdir = config.get('outdir') || '.';
		const cachefile = `${outdir}/plutotv_ondemand_${region}.cache`;
		try {
			cache = JSON.parse(fs.readFileSync(cachefile, 'utf-8'));
		} catch (ex) {
			cache = {};
		}

		if (xTvgUrl) {
			m3u8 = `#EXTM3U x-tvg-url="${xTvgUrl}"\n\n`;
		}

		let cacheDirty = false;
		for (let i = 0; i < categoriesList.categories.length; i++) {
			const c = categoriesList.categories[i];
			if (!c) continue;

			console.log("---------------------------", c.name, i, categoriesList.categories.length);
			const items = await getItems(config, region, c._id, bootData);
			const catname = items.name;

			for (let j = 0; j < items.items.length; j++) {
				const item = items.items[j];
				const id = item._id;

				if (item.type !== 'movie') continue;
				console.log(item.name, j);
				cacheDirty |= !cache[`${id}-${region}`];
				const vodItem = cache[`${id}-${region}`] || await getVodItem(config, region, id, bootData);
				if (!vodItem) continue;

				newCache[`${id}-${region}`] = cache[`${id}-${region}`] = vodItem;

				const path = vodItem.stitched.path || vodItem.stitched.paths && vodItem.stitched.paths.filter(e => e.type === 'hls')?.path || false;
				if (!path) continue;

				const tvgChno = chNo++;
				const url = `${bootData.servers.stitcher}/v2${path}?${bootData.stitcherParams}&jwt=${bootData.sessionToken}&masterJWTPassthrough=true`;
				m3u8 += `#EXTINF:-1 tvg-id="${id}-${region}" tvg-logo="${vodItem.featuredImage.path}" tvg-chno="${tvgChno}" group-title="${catname}", ${vodItem.name}\n${url}\n\n`;
				numChannels++;

			}
			if (cacheDirty) try {
				cacheDirty = false;
				fs.writeFileSync(cachefile, JSON.stringify(cache), 'utf-8');
			} catch (ex) {}
		}

		try {
			fs.writeFileSync(cachefile, JSON.stringify(newCache), 'utf-8');
		} catch (ex) {
			console.log("got ex", ex.message);
		}

		console.log("done");
		return { m3u8, numChannels }
	}

	const generateXMLTV = async (config, region) => {
		console.log("generating XMLTV for ondemand");
		let cache = false;
		// try to init the cache
		const outdir = config.get('outdir') || '.';
		const cachefile = `${outdir}/plutotv_ondemand_${region}.cache`;
		try {
			cache = JSON.parse(fs.readFileSync(cachefile, 'utf-8'));
		} catch (ex) {
			cache = false;
		}

		if (!cache) return "";

		const obj = {
			"_declaration": {
				"_attributes": {
					"version": "1.0",
					"encoding": "UTF-8"
				}
			},
			"_doctype": "tv SYSTEM \"xmltv.dtv\"",
			"tv": {
				"_attributes": {
					"source-info-name": "nobody,xmltv.net,nzxmltv.com"
				},
				"channel": [],
				"programme": []
			}
		};

		const channelIds = Object.keys(cache);
		for (let i = 0; i < channelIds.length; i++) {
			const id = channelIds[i];
			const entry = cache[id];
			const channel = {
				"_attributes": {
					"id": id
				},
				"display-name": {
					"_text": entry.name
				},
				"icon": {
					"_attributes": {
						"src": utils.escapeHTML(entry.featuredImage.path)
					}
				}
			}

			obj.tv.channel.push(channel);

			const start = new Date(); start.setDate(start.getDate() - 1);
			const stop = new Date(); stop.setDate(stop.getDate() + 1);
			const programme = {
				"_attributes": {
					"channel": id,
					"start": `${utils.getTimeStr(start)} +0000`,
					"stop": `${utils.getTimeStr(stop)} +0000`
				},
				"title": {
					"_text": entry.name
				},
				"desc": {
					"_text": entry.description
				},
				"icon": {
					"_attributes": {
						"src": utils.escapeHTML(entry.featuredImage.path)
					}
				}
			}
			obj.tv.programme.push(programme);
		}

		console.log("converting");
		return converter.json2xml(JSON.stringify(obj), {compact: true, ignoreComment: true, spaces: 4});
	}

	exports = module.exports = {
		onDemandCategories,
		getItems,
		generateM3U8,
		generateXMLTV
	}
})();
