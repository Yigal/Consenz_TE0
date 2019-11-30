const config = require("./config");
const serviceAccountPath = "./" + config.instance + "/serviceAccount";
const serviceAccount = require(serviceAccountPath);

const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: serviceAccount._databaseURL
});
const firestore = admin.firestore();
firestore.settings({timestampsInSnapshots: true});
module.exports = firestore;
