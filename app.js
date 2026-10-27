// --- START OF FILE app.js ---

var port = process.env.PORT || 3000;
var httpsPort = process.env.HTTPS_PORT || 3443;

import { dirname } from 'path';
import path from 'path';
import os from 'os';
import express from 'express';
import fs from 'fs';
import http from 'http';
import https from 'https';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Certificates live OUTSIDE __dirname on purpose: express.static(__dirname)
// below would otherwise serve key.pem to anyone who asks for it.
const certDir = process.env.CERT_DIR || path.join(os.homedir(), '.x3d-dev-certs');
const keyFile = path.join(certDir, 'key.pem');
const certFile = path.join(certDir, 'cert.pem');

function ensureSelfSignedCert() {
	if (fs.existsSync(keyFile) && fs.existsSync(certFile)) {
		return true;
	}
	try {
		fs.mkdirSync(certDir, { recursive: true });
		console.log("Generating self-signed certificate in", certDir);
		execFileSync("openssl", [
			"req", "-x509",
			"-newkey", "rsa:2048",
			"-nodes",
			"-keyout", keyFile,
			"-out", certFile,
			"-days", "365",
			"-subj", "/CN=localhost",
			"-addext", "subjectAltName=DNS:localhost,IP:127.0.0.1"
		], {
			stdio: "inherit",
			// keep MSYS2 from mangling the "/CN=..." argument
			env: { ...process.env, MSYS2_ARG_CONV_EXCL: "*", MSYS_NO_PATHCONV: "1" }
		});
		try { fs.chmodSync(keyFile, 0o600); } catch (e) { /* ignore on Windows */ }
		return true;
	} catch (e) {
		console.error("Could not generate certificate (is openssl installed and on PATH?)", e.message);
		return false;
	}
}


var app = express();


app.use(express.static(__dirname));

function send(res, data, type, next, outfile) {
	sendNoNext(res, data, type, outfile);
	next();
}

function sendNoNext(res, data, type, outfile) {
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
		url = __dirname+"/"+ url;
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

// --- HTTP (unchanged) ---
const server = http.createServer(app);

server.listen(port, '127.0.0.1', function () {
  console.log('Example app listening on port', port, "!");
  console.log("Go to http://127.0.0.1:"+port+"/index.html");
  console.log("Go to http://127.0.0.1:"+port+"/x3dom.html");
  console.log("Go to http://127.0.0.1:"+port+"/x_ite.html");
  console.log("Go to file://"+process.env.HOME+"/layers/index.html");
  console.log("Go to file://"+process.env.HOME+"/layers/x3dom.html");
  console.log("Go to file://"+process.env.HOME+"/layers/x_ite.html");
});

// --- HTTPS (self-signed) ---
if (ensureSelfSignedCert()) {
	const options = {
		key: fs.readFileSync(keyFile),
		cert: fs.readFileSync(certFile)
	};
	const secureServer = https.createServer(options, app);
	secureServer.listen(httpsPort, '127.0.0.1', function () {
		console.log('HTTPS app listening on port', httpsPort, "!");
		console.log("Go to https://127.0.0.1:"+httpsPort+"/index.html");
		console.log("Go to https://127.0.0.1:"+httpsPort+"/x3dom.html");
		console.log("Go to https://127.0.0.1:"+httpsPort+"/x_ite.html");
		console.log("(Your browser will warn about the self-signed certificate; that's expected.)");
	});
} else {
	console.error("HTTPS disabled: no certificate available.");
}
