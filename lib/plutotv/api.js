(function() {
	const axios = require('axios');
	const converter = require('xml-js');

	let bootData = null;
	let channelList = null;
	let categoryList = null;
	let timelineList = null;

	const boot = async (region) => {
		const d = new Date;
		const clientTime = encodeURI(d.toISOString());
		const resp = await axios.get(`https://boot.pluto.tv/v4/start?appName=web&appVersion=7.9.0-a9cca6b89aea4dc0998b92a51989d2adb9a9025d&deviceVersion=16.2.0&deviceModel=web&deviceMake=Chrome&deviceType=web&clientID=43685c82-2cfe-4bbf-bf6b-3adde1cdb584&clientModelNumber=1.0.0&channelID=5a4d3a00ad95e4718ae8d8db&serverSideAds=true&constraints=&drmCapabilities=&blockingMode=&clientTime=${clientTime}`, {
			headers: {
				'X-Forwarded-For': region
			}
		});
		bootData = resp.data;
		return bootData;
	}

	const channels = async (region) => {
		const jwt = bootData.sessionToken;
		const resp = await axios.get(`https://service-channels.clusters.pluto.tv/v2/guide/channels?channelIds=&offset=0&limit=1000&sort=number%3Aasc`, {
			headers: {
				'X-Forwarded-For': region,
				Authorization: `Bearer ${jwt}`
			}
		});

		channelList = resp.data;
		return resp.data;
	}

	const categories = async (region) => {
		const jwt = bootData.sessionToken;
		const resp = await axios.get('https://service-channels.clusters.pluto.tv/v2/guide/categories', {
			headers: {
				'X-Forwarded-For': region,
				Authorization: `Bearer ${jwt}`
			}
		});

		categoryList = resp.data;
		return resp.data;
	}

	const timelines = async (region) => {
		const jwt = bootData.sessionToken;
		const d = new Date;
		d.setHours(d.getHours() - 1);
		timelineList = { data: [] };
		const channelIds = channelList.data.map(c => c.id);
		const chunkSize = 30;
		for (let i = 0; i < channelIds.length; i += chunkSize) {
			const chunks = channelIds.slice(i, i + chunkSize);
			const clientTime = encodeURI(d.toISOString());
			const resp = await axios.get(`https://service-channels.clusters.pluto.tv/v2/guide/timelines?start=${clientTime}&duration=480&channelIds=${chunks.join('%2C')}`, {
				headers: {
					'X-Forwarded-For': region,
					Authorization: `Bearer ${jwt}`
				}
			});

			timelineList.data = timelineList.data.concat(resp.data.data);
		}
		return timelineList;
	}

	const generateM3U8 = async (xff, region) => {
		let m3u8 = "#EXTM3U\n\n";
		for (let i = 0; i < channelList.data.length; i++) {
			const c = channelList.data[i];
			const category = categoryList.data.find(cat => cat.id === c.categoryIDs[0]);
			const id = c.id + '-' + region;
			const url = bootData.servers.stitcher + c.stitched.path + '?' + bootData.stitcherParams;
			m3u8 += `#EXTINF:-1 tvg-id="${id}" tvg-logo="${c.images[0].url}" tvg-chno="${c.number}" group-title="${category.name}", ${c.name}\n${url}\n\n`;
		}
		return m3u8;
	}

	const generateXMLTV = async (xff, region) => {
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
			const category = categoryList.data.find(cat => cat.id === c.categoryIDs[0]);
			const channel = {
				"_attributes": {
					"id": c.id + '-' + region
				},  
				"display-name": {
					"_text": c.name
				},  
				"lcn": {
					"_text": c.number
				},
				"icon": {
					"_attributes": {
						"src": c.images[0].url
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

		const escapeHTML = str => str.replace(/[&<>'"]/g,
			tag => ({
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				"'": '&#39;',
				'"': '&quot;'
			}[tag]));

		for (let i = 0; i < timelineList.data.length; i++) {
			const t = timelineList.data[i];
			const tl = t.timelines;
			for (let j = 0; j < tl.length; j++) {
				const entry = tl[j];
				const start = new Date(entry.start);
				const stop = new Date(entry.stop);
				const programme = {
					"_attributes": {
						"channel": t.channelId + '-' + region,
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
							"src": escapeHTML(entry.episode.series.tile.path)
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
