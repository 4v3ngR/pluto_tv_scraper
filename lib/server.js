(function() {
	const server = require('awebserver');
	const path = require('path');
	const fs = require('fs');
	const utils = require('#lib/utils.js');
	const api = require('#lib/plutotv/api.js');

	const getUUID = (config, data) => {
		if (config.get('uniqueClientid')) return utils.uuid(data);
		return utils.uuid();
	}

	const serve = (config) => {
		server.addRoute('/{filename}', 'GET', async (req, res) => {
			try {
				const outdir = config.get('outdir');
				const filename = path.basename(req.query.filename);
				const fullpath = `${outdir}/${filename}`;
				const { ext } = path.parse(fullpath);

				let contents = fs.readFileSync(fullpath, 'utf-8');
				let mimetype = "text/plain";
				switch (ext) {
					case '.m3u8':
						const uuid = getUUID(config, res.connection.remoteAddress);
						if (uuid) {
							const bootData = await api.boot(false, uuid);
							contents = contents.replace(new RegExp(config.get('clientID'), 'ig'), bootData.session.sessionID);
							contents = contents.replace(
								new RegExp('jwt=.*master', 'g'),
								`jwt=${bootData.sessionToken}&master`
							);
						}
						mimetype = 'application/x-mpegURL; charset=UTF-8';
						break;
					case '.xml':
						mimetype = 'text/xml';
						break;
				}

				res.response(200, `${contents}`, { 'Content-Type': mimetype });
			} catch (ex) {
				res.response(500, 'something bad happened');
			}
		});

		server.serve(config.get('PORT'));
	}

	exports = module.exports = {
		serve
	}
})();
