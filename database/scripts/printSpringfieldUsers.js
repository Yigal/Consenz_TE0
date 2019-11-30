const fs = require('fs');
const config = require("../config");
const collections = ["arguments", "comments", "sections"];

const allUsersMap = {};
const usersMap = {};

const usersFilePath = '../' + config.instance + '/collections/users.json';
fs.readFile(usersFilePath, 'utf8', function (err, contents) {
  const usersCollection = JSON.parse(contents);
  usersCollection.forEach(function (user) {
    allUsersMap[user.id] = user;
  });

  let counter = 0;
  collections.forEach(function (item) {
    const filePath = '../' + config.instance + '/collections/' + item + '.json';
    fs.readFile(filePath, 'utf8', function (err, contents) {
      const collection = JSON.parse(contents);
      collection.forEach(function (data) {
        const createdBy = data.created_by;
        const user = allUsersMap[createdBy];
        usersMap[createdBy] = user;
      });
      counter++;
      if (counter === collections.length){
        const usersArray = Object.entries(usersMap).map(x => x[1]);
        console.log(JSON.stringify(usersArray, null, 2));
      }
    });
  });

});

