const config = require("../config");
const firestoreUtil = require("./firestoreUtil.js");
config.collections.forEach(function (item) {
  const filePath = '../' + config.instance + '/collections/' + item + '.json';
  firestoreUtil.readFileLoadCollection(item, filePath);
});


