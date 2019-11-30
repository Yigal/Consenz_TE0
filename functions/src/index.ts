import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { firestore } from "./init";
import { handleError } from "./handlers";
import { log } from "./init";
import { sendNotificationsToUsers } from "./api/mailNotifications";
import { isReachedDeadline } from "./utils";
import { userApi, sectionsApi } from "./api";

const cors = require("cors")({
  origin: true,
});

// Not operational (similar to scheduledFunction)
exports.checkStatus = functions.https.onRequest(async (req, res) => {
  const key = req.query.key;
  if (key !== functions.config().cron.key) {
    log.error(
      {},
      `The key provided in the request does not match the key set in the environment. Check that ${key}
    // matches the cron.key attribute in ${functions.config().cron.key}`,
    );
    res.status(403).send('Security key does not match. Make sure your "key" URL query parameter matches the ' + "cron.key environment variable.");
    return null;
  }
  try {
    const response = await sectionsApi.checkStatus();
    log.info({}, "Check status finished");
    res.status(200).send(response);
  } catch (error) {
    handleError(error, res);
  }
});

// Triggered by user pressing the 'Remove me from mailing list'
exports.notificationsOff = functions.https.onRequest(async (req, res) => {
  const id = req.query.id;
  try {
    await userApi.notificationsOff(id);
    res.status(200).send("הוסרת מרשימת התפוצה בהצלחה");
  } catch (error) {
    handleError(error, res);
  }
});

// Send Mail notification
exports.sendNotifications = functions.https.onRequest(async (req, res) => {
  console.log('sendNotifications XXX');
  return cors(req, res, async () => {
    if (req.method !== `PUT`) {
      res.status(500).json({
        message: "Not allowed!",
      });
    }
    try {
      const { mailList, documentId, title, body, authDomain } = req.body;
      log.info({ data: req.body }, "DATA - ****************sendNotifications*****************");
      await sendNotificationsToUsers(mailList, documentId, title, body, authDomain);
      res.status(200).json({
        message: "It worked!",
      });
    } catch (error) {
      console.log(error);
    }
  });
});

// Clean sections that reached dead line
exports.scheduledFunction = functions.pubsub.schedule("every 1 minutes").onRun(context => {
  console.log('scheduledFunction XXX');
  const DYNAMIC_STATUS = [0, 2, 4];
  const DYNAMIC_STATUS_NAMES = {
    2: "toDelete",
    4: "toEdit",
  };
  const rejectedStatus = 6;
  return firestore
    .collection("sections")
    .get()
    .then(async querySnapshot => {
      if (!querySnapshot.empty) {
        querySnapshot.forEach(async doc => {
          let time = doc.data().deadline;
          if (DYNAMIC_STATUS.includes(doc.data().status)) {
            if (isReachedDeadline(time)) {
              const parentSectionId = await firestore
                .collection("sections")
                .doc(doc.data().parentSectionId)
                .get();
              if (parentSectionId.exists) {
                parentSectionId.ref.update({
                  [DYNAMIC_STATUS_NAMES[doc.data().status]]: admin.firestore.FieldValue.arrayRemove(doc.data().id),
                });
              }
              doc.ref.update({
                status: rejectedStatus,
              });
            }
          }
        });
      }
    });
});

// exports.addVisabilitySections = functions.firestore.document("/sections/{id}").onCreate((snap, context) => {
//   snap.ref.update({ visibility: "public" });
// });
// exports.addVisabilityArguments = functions.firestore.document("/arguments/{id}").onCreate((snap, context) => {
//   return snap.ref.update({ visibility: "public" });
// });
// exports.addVisabilityComments = functions.firestore.document("/comments/{id}").onCreate((snap, context) => {
//   return snap.ref.update({ visibility: "public" });
// });
// exports.addVisabilityDocuments = functions.firestore.document("/documents/{id}").onCreate((snap, context) => {
//   return snap.ref.update({ visibility: "public" });
// });
