const fs = require("fs");

function reloadUserStore() {
  const fileRaw = fs.readFileSync("./userStores.json", function (err, data) {
    if (err) {
      throw err;
    }
  });  
  return JSON.parse(fileRaw);
}

function writeUserStore(userData, storeNumber) {
  //console.log(userData);
  //console.log(storeNumber);
  const mergedUserData = {
    username: userData.username,
    id: userData.id,
    storeNumber: storeNumber,
  };
  const userStore = reloadUserStore();

  const userIndex = getUserIndex(userStore, mergedUserData.id);
  if (userIndex === -1) {
    userStore.push(mergedUserData);
    fs.writeFileSync("./userStores.json", JSON.stringify(userStore, null, 2));
    return "Saved";
  } else {
    userStore[userIndex] = mergedUserData;
    fs.writeFileSync("./userStores.json", JSON.stringify(userStore, null, 2));
    return "Updated";
  }
}

function getUser(users, userID) {
  const user = users.find(function (user) {
    if (user.id === userID) {
      return true;
    }
  });
  return user;
}

function getUserIndex(users, userID) {
  const userIndex = users.findIndex(function (user) {
    if (user.id === userID) {
      return true;
    }
  });
  return userIndex;
}

module.exports = { reloadUserStore, writeUserStore, getUser, getUserIndex };
