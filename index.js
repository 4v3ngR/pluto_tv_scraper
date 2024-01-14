#!/usr/bin/env node

const program = require('commander');
const fs = require('fs');
const plutoapi = require('./lib/plutotv/api');
const utils = require('./lib/utils');
const config = require('./lib/config');

(async function() {
	const options = program
		.option('--config <configfile>', 'provide the location to the configuration file')
		.option('--mapping <region,IP>', 'provide a region and IP address to process instead of the mapping')
		.option('--outdir <outdir>', 'provide the destination directory')
		.option('--clientid <clientid>', 'provide a client id')
		.option('--all', 'merge all regions into a single playlist and epg')
		.option('--group [genre|country]', 'specify the grouping in the playlist')
		.option('--regionalize', 'append the country code to the channel id')
		.option('-h --help', 'display the help')
		.parse(process.argv)
		.opts();

	if (options.help) {
		utils.displayHelp();
		process.exit(0);
	}

	config.loadConfig(options);

	const mapping = utils.getMapping(options, config);

	const regionalPlaylists = {};
	const regionalEpgs = {};

	const group = config.get('group');
	const regionalize = config.get('regionalize');
	const all = config.get('all');
	const outdir = config.get('outdir');

	const get = async (region) => {
		console.info("INFO: processing", region);
		try {
			const clientID = config.get('clientID');
	console.log("clientID = ", clientID);
	process.exit(0);

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

	for (const key of Object.keys(mapping)) await get(key);

	if (all && Object.keys(mapping).length > 1) {
		const m3u8 = utils.mergeM3U8(regionalPlaylists);
		const xmltv = utils.mergeXMLTV(regionalEpgs);
		fs.writeFileSync(`${outdir}/plutotv_all.m3u8`, m3u8, 'utf-8');
		fs.writeFileSync(`${outdir}/plutotv_all.xml`, xmltv, 'utf-8');
	}
})();
