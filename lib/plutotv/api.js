(function() {
	const axios = require('axios');
	const converter = require('xml-js');
	const utils = require('#lib/utils.js');

	let bootData = null;
	let channelList = null;
	let categoryList = null;
	let timelineList = null;

	const boot = async (region, clientID) => {
		const d = new Date;
		const clientTime = encodeURI(d.toISOString());

		const headers = {};
		if (region) headers['X-Forwarded-For'] = region;

		const resp = await axios.get(`https://boot.pluto.tv/v4/start?appName=web&appVersion=7.9.0-a9cca6b89aea4dc0998b92a51989d2adb9a9025d&deviceVersion=16.2.0&deviceModel=web&deviceMake=Chrome&deviceType=web&clientID=${clientID}&clientModelNumber=1.0.0&channelID=5a4d3a00ad95e4718ae8d8db&serverSideAds=true&constraints=&drmCapabilities=&blockingMode=&clientTime=${clientTime}`, {headers});

		bootData = resp.data;
		return bootData;
	}

	const channels = async (region) => {
		const jwt = bootData.sessionToken;

		const headers = {
			Authorization: `Bearer ${jwt}`
		};

		if (region) headers['X-Forwarded-For'] = region;

		const resp = await axios.get(`https://service-channels.clusters.pluto.tv/v2/guide/channels?channelIds=&offset=0&limit=1000&sort=number%3Aasc`, {headers});

		channelList = resp.data;
		return resp.data;
	}

	const categories = async (region) => {
		const jwt = bootData.sessionToken;

		const headers = {
			Authorization: `Bearer ${jwt}`
		};

		if (region) headers['X-Forwarded-For'] = region;
		const resp = await axios.get('https://service-channels.clusters.pluto.tv/v2/guide/categories', {
			headers
		});

		categoryList = resp.data;
		return resp.data;
	}

	const timelines = async (region) => {
		const jwt = bootData.sessionToken;

		const headers = {
			Authorization: `Bearer ${jwt}`
		};

		if (region) headers['X-Forwarded-For'] = region;

		timelineList = { data: [] };
		for (let offset = -1; offset < 24; offset += 4) {
			const d = new Date;
			d.setHours(d.getHours() + offset);
			const channelIds = channelList.data.map(c => c.id);
			const chunkSize = 30;
			for (let i = 0; i < channelIds.length; i += chunkSize) {
				const chunks = channelIds.slice(i, i + chunkSize);
				const clientTime = encodeURI(d.toISOString());
				const resp = await axios.get(`https://service-channels.clusters.pluto.tv/v2/guide/timelines?start=${clientTime}&duration=240&channelIds=${chunks.join('%2C')}`, {headers});

				timelineList.data = timelineList.data.concat(resp.data.data);
			}
		}
		return timelineList;
	}

	const generateM3U8 = async (
		region,
		group,
		regionalize,
		excludeGroups,
		excludeChannels,
		chno,
		xTvgUrl
	) => {
		let numChannels = 0;
		let m3u8 = "#EXTM3U\n\n";

		if (xTvgUrl) {
			m3u8 = `#EXTM3U x-tvg-url="${xTvgUrl}"\n\n`;
		}

		for (let i = 0; i < channelList.data.length; i++) {
			const c = channelList.data[i];

			if (!c.categoryIDs) {
				console.log("WARN: channel has no category ids", c.id, c.name);
				continue;
			}

			const category = categoryList.data.find(cat => cat.id === c.categoryIDs[0]);
			const catname = group === 'genre' ?  category.name : region;

			if (excludeGroups && new RegExp(excludeGroups).test(category.name)) continue;
			if (excludeChannels && new RegExp(excludeChannels).test(c.name)) continue;

			const tvgChno = chno !== false ? chno : c.number;
			const id = c.id + (regionalize && region ? '-' + region : '');
			const url = bootData.servers.stitcher + c.stitched.path + '?' + bootData.stitcherParams;
			m3u8 += `#EXTINF:-1 tvg-id="${id}" tvg-logo="${c.images[0].url}" tvg-chno="${tvgChno}" group-title="${catname}", ${c.name}\n${url}\n\n`;

			if (chno !== false) chno++;
			numChannels++;
		}
		return { m3u8, numChannels };
	}

	const generateXMLTV = async (region, regionalize) => {
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

		for (let i = 0; i < channelList.data.length; i++) {
			const c = channelList.data[i];

			if (!c.categoryIDs) {
				console.log("WARN: channel has no category ids", c.id, c.name);
				continue;
			}

			const category = categoryList.data.find(cat => cat.id === c.categoryIDs[0]);
			const channel = {
				"_attributes": {
					"id": c.id + (regionalize && region ? '-' + region : '')
				},  
				"display-name": {
					"_text": c.name
				},  
				"lcn": {
					"_text": c.number
				},
				"icon": {
					"_attributes": {
						"src": utils.escapeHTML(c.images[0].url)
					}
				}
			};
			obj.tv.channel.push(channel);
		}

		const getTimeStr = (d) => {
			let timeStr = "";
			const year = d.getUTCFullYear();
			const mon = d.getUTCMonth() + 1;
			const day = d.getUTCDate();
			const hour = d.getUTCHours();
			const min = d.getUTCMinutes();
			const sec = d.getUTCSeconds();

			timeStr += year;
			timeStr += mon < 10 ? '0' + mon : mon;
			timeStr += day < 10 ? '0' + day : day;
			timeStr += hour < 10 ? '0' + hour : hour;
			timeStr += min < 10 ? '0' + min : min;
			timeStr += sec < 10 ? '0' + sec : sec;
			return timeStr;
		}

		for (let i = 0; i < timelineList.data.length; i++) {
			const t = timelineList.data[i];
			const tl = t.timelines.sort((a, b) => a.start - b.start);;
			for (let j = 0; j < tl.length; j++) {
				const entry = tl[j];
				const start = new Date(entry.start);
				const stop = new Date(entry.stop);
				const programme = {
					"_attributes": {
						"channel": t.channelId + (regionalize ? '-' + region : ''),
						"start": `${getTimeStr(start)} +0000`,
						"stop": `${getTimeStr(stop)} +0000`
					},
					"title": {
						"_text": entry.title
					},
					"desc": {
						"_text": entry.episode.description
					},
					"icon": {
						"_attributes": {
							"src": utils.escapeHTML(entry.episode.series.tile.path)
						}
					}
				}
				obj.tv.programme.push(programme);
			}
		}

		return converter.json2xml(JSON.stringify(obj), {compact: true, ignoreComment: true, spaces: 4});
	}

	exports = module.exports = {
		boot,
		channels,
		categories,
		timelines,
		generateM3U8,
		generateXMLTV
	}
})();
