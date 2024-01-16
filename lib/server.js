(function() {
	const server = require('awebserver');
	const path = require('path');
	const fs = require('fs');

	const serve = (config) => {
		server.addRoute('/{filename}', 'GET', (req, res) => {
			try {
				const outdir = config.get('outdir');
				const filename = path.basename(req.query.filename);
				const fullpath = `${outdir}/${filename}`;
				const contents = fs.readFileSync(fullpath, 'utf-8');
				
				const { ext } = path.parse(fullpath);
				let mimetype = "text/plain";
				switch (ext) {
					case '.m3u8':
						mimetype = 'application/x-mpegURL; charset=UTF-8';
						break;
					case '.xml':
						mimetype = 'text/xml';
						break;
				}

				res.response(200, `${contents}`, { 'Content-Type': mimetype });
			} catch (ex) {
				console.log("got ex", ex.message);
				res.response(500, 'something bad happened');
			}
		});

		server.serve(config.get('PORT'));
	}

	exports = module.exports = {
		serve
	}
})();
