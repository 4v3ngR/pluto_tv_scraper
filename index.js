#!/usr/bin/env node

(async function() {
	const fs = require('fs');
	const plutoapi = require('./lib/plutotv/api');
	const utils = require('./lib/utils');
	const config = require('./lib/config');

	const regionalPlaylists = {};
	const regionalEpgs = {};

	config.loadConfig();

	const mapping = config.getMapping();
	const group = config.get('group');
	const regionalize = config.get('regionalize');
	const all = config.get('all');
	const outdir = config.get('outdir');

	const processRegion = async (region) => {
		console.info("INFO: processing", region);
		try {
			const clientID = config.get('clientID');
			const xff = mapping[region];

			const bootData = await plutoapi.boot(xff, clientID);
			const channels = await plutoapi.channels(xff);
			const categories = await plutoapi.categories(xff);
			const timelines = await plutoapi.timelines(xff);

			const m3u8 = await plutoapi.generateM3U8(region, group, regionalize);
			const xmltv = await plutoapi.generateXMLTV(region, regionalize);
			fs.writeFileSync(`${outdir}/plutotv_${region}.m3u8`, m3u8, 'utf-8');
			fs.writeFileSync(`${outdir}/plutotv_${region}.xml`, xmltv, 'utf-8');

			regionalPlaylists[region] = m3u8;
			regionalEpgs[region] = xmltv;
		} catch (ex) {
			console.error("ERROR: got exception", ex.message);
		}
	}

	for (const key of Object.keys(mapping)) await processRegion(key);

	if (all && Object.keys(mapping).length > 1) {
		const m3u8 = utils.mergeM3U8(regionalPlaylists);
		const xmltv = utils.mergeXMLTV(regionalEpgs);
		fs.writeFileSync(`${outdir}/plutotv_all.m3u8`, m3u8, 'utf-8');
		fs.writeFileSync(`${outdir}/plutotv_all.xml`, xmltv, 'utf-8');
	}
})();
