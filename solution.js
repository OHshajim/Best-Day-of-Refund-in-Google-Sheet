const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

const serviceAccountAuth = new JWT({
  email: "----- Service Email -----",
  key: "----- PRIVATE KEY-----",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const startDate = "01-01-2025";
const endDate = "30-01-2025";
async function findBestDayToSave() {
  try {
    const doc = new GoogleSpreadsheet(
      "1xR3k-E9nu1MZSKQwzJSQcbMciauG7bdN_BmlTFq6omU",
      serviceAccountAuth
    );
    await doc.loadInfo();
    console.log("Spreadsheet title:", doc.title);
    const ordersSheet = doc.sheetsByTitle["Orders"];
    const lineItemsSheet = doc.sheetsByTitle["LineItems"];

    const orders = await ordersSheet.getRows();
    const lineItems = await lineItemsSheet.getRows();

    const ordersInRange = orders.filter((order) => {
      const orderDate = order.get("Order Date");
      return orderDate >= startDate && orderDate <= endDate;
    });

    let minRefundCost = Infinity;
    let bestDay = null;

    let lowestCostItem = lineItems[0];

    lineItems.forEach((item) => {
      const rawPrice = item.get("Price");
      const cleanedPrice = rawPrice.replace(/[^\d.-]/g, "");
      const price = parseFloat(cleanedPrice);

      const rawPrice1 = lowestCostItem.get("Price");
      const cleanedPrice1 = rawPrice1.replace(/[^\d.-]/g, "");
      const price1 = parseFloat(cleanedPrice1);

      if (price < price1) {
        lowestCostItem = item;
      }
    });
    // console.log(lowestCostItem);

    ordersInRange.forEach((item) => {
      if (item.get("Order ID") === lowestCostItem.get("Order ID")) {
        bestDay = item.get("Order Date");
        minRefundCost = lowestCostItem.get("Price");
      }
    });

    console.log(
      `Best day to save: ${bestDay} with refund cost: ${minRefundCost}`
    );
  } catch (error) {
    console.error("An error occurred:", error.message);
  }
}

// Run the program
findBestDayToSave();
