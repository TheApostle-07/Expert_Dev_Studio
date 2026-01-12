import { connectToDatabase } from "../lib/mongodb";
import { CouponModel } from "../lib/models/Coupon";

const ILH_PRICES = [0, 49, 99, 199, 299, 399, 499, 599, 699, 799, 899, 999];

async function seed() {
  await connectToDatabase();

  await CouponModel.updateOne(
    { code: "ILH" },
    {
      $set: {
        code: "ILH",
        type: "TIERED_PRICE",
        active: true,
        bucketSize: 100,
        prices: ILH_PRICES,
        cap: 999,
      },
      $setOnInsert: {
        usedCount: 0,
      },
    },
    { upsert: true }
  ).exec();

  console.log("Seeded ILH coupon");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
