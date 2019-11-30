const firestoreUtil = require("./firestoreUtil.js");

const collectionName = 'documents';
const updateData = {
  documentTopics: ["מבוא", "הערות", "סיכום"]
};
firestoreUtil.updateCollectionDocuments(collectionName, updateData);
