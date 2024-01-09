const plutoapi = require('./lib/plutotv/api');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

(async function() {
	const get = async (region) => {
		const clientID = config.clientID || "00000000-0000-0000-0000-000000000000";
		const us = '45.50.96.71';
		const uk = '89.167.207.12';

		const xff = region === 'us' ? us : uk;

		const bootData = await plutoapi.boot(xff, clientID);
		const channels = await plutoapi.channels(xff);
		const categories = await plutoapi.categories(xff);
		const timelines = await plutoapi.timelines(xff);

		const m3u8 = await plutoapi.generateM3U8(xff, region);
		const xmltv = await plutoapi.generateXMLTV(xff, region);
		fs.writeFileSync(`${config.outdir}/plutotv_${region}.m3u8`, m3u8, 'utf-8');
		fs.writeFileSync(`${config.outdir}/plutotv_${region}.xml`, xmltv, 'utf-8');
	}

	await get('us');
	await get('uk');
})();
