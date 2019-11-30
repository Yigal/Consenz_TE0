const fs = require('fs');
const firebase  = require('firebase');
const firestore = require("../firestore");

function getCollectionWriteToFile(collectionName, filePath){
  firestore.collection(collectionName).get().then(function (querySnapshot) {
    const docs = [];
    querySnapshot.forEach(doc => {
      const docData = protoToDocument(doc._fieldsProto);
      if (docData.id == null){
        const segments = doc._ref._path.segments;
        docData.id = segments[1];
      }
      docs.push(docData);
    });
    const content = JSON.stringify(docs, null, 2);
    console.log(content);
    fs.writeFile(filePath, content, function (err) {
      if (err) throw err;
      console.log('Saved ' + collectionName + ' collection to ' + filePath);
    });
  });
}

function readFileLoadCollection(collectionName, filePath) {
  fs.readFile(filePath, 'utf8', function (err, contents) {
    const collection = JSON.parse(contents);
    collection.forEach(function (data) {
      console.log(JSON.stringify(data));
      setCollectionDocument(collectionName, data.id, data);
    })
  });
}

function protoToDocument(fieldsProto) {
  const doc = {};
  let keys = Object.keys(fieldsProto);
  if (keys.includes("id")){
    doc["id"] = retrieveProtoValue(fieldsProto["id"]);
    keys = keys.filter(function(value, index, arr){
      return value !== "id";
    });
  }
  keys.sort();
  keys.forEach(function (key) {
    doc[key] = retrieveProtoValue(fieldsProto[key]);
  });
  return doc;
}

function retrieveProtoValue(protoValue) {
  switch (protoValue.valueType) {
    case "nullValue":
      return null;
    case "stringValue":
    case "booleanValue":
      return protoValue[protoValue.valueType];
    case "integerValue":
      return parseInt(protoValue.integerValue);
    case "timestampValue":
      const protoTimestamp = protoValue.timestampValue;
      const timestamp = new firebase.firestore.Timestamp(parseInt(protoTimestamp.seconds), protoTimestamp.nanos);
      return timestamp.toDate();
    case "arrayValue":
      return protoValue.arrayValue.values.map(
        itemProtoValue => retrieveProtoValue(itemProtoValue));
    case "mapValue":
      return protoToDocument(protoValue.mapValue.fields);
    default:
      return "Default"
  }
}

function updateCollectionDocuments(collectionName, updateData){
  firestore.collection(collectionName).get().then(function (querySnapshot) {
    querySnapshot.forEach(async doc => {
      await doc.ref.update(updateData);
    })
  })
}

function setCollectionDocument(collectionName, documentId, data){
  prepareSetData(data);
  firestore.collection(collectionName).doc(documentId).set(data)
    .then(function() {
      console.log("Written " + collectionName + " " + documentId);
    })
    .catch(function(error) {
      console.error("Error writing document: ", error);
    });
}

const DateKeys = ["createdAt", "created_at", "deadline"];
function prepareSetData(data){
  for (key in data){
    if (DateKeys.includes(key)){
      const dateString = data[key];
      const date = new Date(dateString);
      //const timestamp = firebase.firestore.Timestamp.fromDate(date);
      data[key] = date;
    }
  }
}

module.exports = {
  getCollectionWriteToFile,
  readFileLoadCollection,
  updateCollectionDocuments
};
