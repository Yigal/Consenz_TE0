const config = require("../config");
const firestoreUtil = require("./firestoreUtil.js");
const item = 'users';
const filePath = '../' + config.instance + '/collections/' + item + '.json';
firestoreUtil.readFileLoadCollection(item, filePath);


