const fs = require("fs");

function reloadUserStore() {
  const fileRaw = fs.readFileSync("./userStores.json", function (err, data) {
    if (err) {
      throw err;
    }
  });
  const fileObj = JSON.parse(fileRaw);
  return fileObj;
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
  
  const checkExistIndex = getUser(userStore, mergedUserData.id);
  if (checkExistIndex === -1) {
    userStore.push(mergedUserData);
    const writeType = "Saved"
    fs.writeFileSync("./userStores.json", JSON.stringify(userStore, null, 2));
    return writeType    
  }
  else{
    userStore[checkExistIndex] = mergedUserData
    const writeType = "Updated"
    fs.writeFileSync("./userStores.json", JSON.stringify(userStore, null, 2));
    return writeType
  }
  

}

function getUser(users, userID) {
  const userIndex = users.findIndex(function (user) {
    if (user.id === userID) {
      return true;
    }
  });
  return userIndex;
}

module.exports = { reloadUserStore, writeUserStore, getUser };
