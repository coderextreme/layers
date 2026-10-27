# layers
Experiments with X_ITE, X3D, X3DOM and LayerSet/Layer/Overlay Text

Pull requests welcome.

To build and run:

```
npm ci
npm start  # this will start a server and create a certificate in process.env.CERT_DIR or ~/.x3d-dev-certs
castle-model-viewer LayerSet.x3d
npx sunrize LayerSet.x3d
```
Then click a link you desire.  The https ones will warn about a self-signed certificate.  The files should work without a server.
