const axios = require("axios");

//const storeNum = 1144
//const zipCode = 33431
const apiURL = "https://services.publix.com/api/";

async function main(storeID) {
  const getInstance = axios.create({
    baseURL: `${apiURL}v3/`,
    timeout: 3000,
    headers: {
      PublixStore: storeID,
    },
  });

  const res = await getInstance.get(
    "savings?smImg=150&enImg=262&fallbackImg=false&isMobile=false&page=1&pageSize=0"
  );

  const deliDeals = res.data.Savings.filter(function (savings) {
    if (savings.department === "Deli") {
      return savings;
    }
  });
  console.log(deliDeals);
  const subItems = deliDeals.filter(function (item) {
    if (item.title.toLowerCase().includes("sub")) {
      //console.log(item);
      return item;
    }
  });

  const saleSub = subItems.filter(function (subItem) {
    if (
      !(
        subItem.title.toLowerCase().includes("combo") ||
        subItem.savings.toLowerCase().includes("combo")
      )
    ) {
      //console.log(subItem.title);
      return subItem;
    }
  });
  //console.log(saleSub)
  //const subTitle = saleSub[0].title

  const trimmedRes = (({ title, description, finalPrice }) => ({
    title,
    description,
    finalPrice,
  }))(saleSub[0]);

  return trimmedRes;
}

async function getStores(zipCode) {
  const getInstance = axios.create({
    baseURL: `${apiURL}v1/`,
    timeout: 3000,
  });

  const res = await getInstance.get(
    `storelocation?types=R,G,H,N,S&option=&count=15&includeOpenAndCloseDates=true&zipCode=${zipCode}`
  );

  const top5Stores = res.data.Stores.slice(null, 5);

  const trimmedStores = top5Stores.map(({ KEY, NAME, ADDR }) => ({
    StoreNumber: KEY,
    StoreName: NAME,
    StoreAddress: ADDR,
  }));

  const cleanedUpStores = trimmedStores.map((store) => {
    store.StoreNumber = Number(store.StoreNumber); //trim leading zeroes by converting to number type
    store.StoreNumber = String(store.StoreNumber); //convert back to string for later text display to end user
    return store;
  });

  //console.log(cleanedUpStores)

  return cleanedUpStores;
}

function queryStore(storeNum) {
  const result = main(storeNum);
  return result;
}

module.exports = { queryStore, getStores };
