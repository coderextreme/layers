// --- START OF FILE app.js ---

var port = process.env.PORT || 3000;

import { dirname } from 'path';
import path from 'path';
import express from 'express';
import fs from 'fs';
import http from 'http';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


var app = express();


app.use(express.static(__dirname));

function send(res, data, type, next, outfile) {
	sendNoNext(res, data, type, outfile);
	next();
}

function sendNoNext(res, data, type, outfile) {
	// console.error("Type", type);
	try {
		if (!type.startsWith("image/")) {
			res.header("Content-Type", type);
		}
		res.header("Content-Type-Options", "nosniff");
	} catch (e) {
		console.error(e);
	}
	console.log("    Replied with File", outfile);
	res.send(data);
}

function magic(path, type) {
    // The path argument to magic() is now a regular expression, so string operations are not needed.
    app.get(path, async function(req, res, next) {
	res.setHeader('Content-Type', type);
	var url = req.path;
	try {
		while (url.startsWith("/")) {
			url = url.substr(1);
		}
		console.log(req.ip+":  Requested", url);
		var wind = url.indexOf("www.web3d.org");
		if (wind >= 0) {
			url = url.substring(wind);
			var cwind = config.examples().indexOf("www.web3d.org");
			url = config.examples().substr(0, cwind) + url;
		} else {
			url = __dirname+"/"+ url;
		}
		if (fs.existsSync(url)) {
			console.log("Reading", url);
			var data = await fs.promises.readFile(url);
			if (type.startsWith("image") || type.startsWith("audio") || type.startsWith("video")) {
				sendNoNext(res, data, type, url);
			} else {
				sendNoNext(res, data.toString(), type, url);
			}
		} else {
			console.error("File does not exist", url);
		}
	} catch (e) {
		console.error(e, "Couldn't read", url);
		next();
	}
    });
}

magic(/.*\.html$/i, "text/html");
magic(/.*\.x3d$/i, "model/x3d+xml");
magic(/.*\.x3dv$/i, "model/x3d+vrml");
magic(/.*\.css$/i, "text/css");
magic(/.*\.js$/i, "text/javascript");

const server = http.createServer(app);

server.listen(port, '127.0.0.1', function () {
  console.log('Example app listening on port', port, "!");
  console.log("Go to http://127.0.0.1:"+port+"/index.html");
  console.log("Go to http://127.0.0.1:"+port+"/layerset.html");
});
