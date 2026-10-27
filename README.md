# layersA
Experiments with X_ITE, X3D, X3DOM and LayerSet/Layer/Overlay Text

Pull requests welcome.

# To build

```
npm ci
```

# to run
The below will start an http server (on port 3000 or override in .env) and an https server (on port 3443 or override in .env) and create a certificate in process.env.CERT_DIR or ~/.x3d-dev-certs.  It will alwo present links to 127.0.0.1 (in case your localhost gets deleted from /etc/hosts) and file:// links.
To test, click a link you desire.  The https ones will warn about a self-signed certificate.  The file:// links should work without a server.
```
npm start
castle-model-viewer CastleProximitySensor.x3d
npx sunrize SunrizeLayerSet.x3d
```
