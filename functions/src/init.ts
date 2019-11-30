import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { LoggingBunyan } from "@google-cloud/logging-bunyan";
import * as bunyan from "bunyan";
import { config } from "./config";

/***************************** INTIZALIZE FIREBASE **********************************/
console.log('functions/src init.ts');
// TODO:
// credential by ENV
// databaseURL from here -> process.env.FIREBASE_CONFIG.databaseURL
// const env = functions.config().environment.key;
const env = "staging";

// const serviceAccount = require(`../${env}.serviceAccount.json`);
const serviceAccount = require("../staging.serviceAccount.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.firebaseConfig["development"].databaseURL,
});

export const firestore = admin.firestore();
const settings = { timestampsInSnapshots: true };
console.log('Init firestore settings: ' + JSON.stringify(settings));
firestore.settings(settings);

/***************************** INTIZALIZE log **********************************/

const loggingBunyan = new LoggingBunyan();
export const log = bunyan.createLogger({
  name: "functions-service",
  streams: [{ stream: process.stdout, level: "info" }, loggingBunyan.stream("info")],
});
