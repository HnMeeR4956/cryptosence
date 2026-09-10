require("dotenv").config();
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

(async () => {
  const acct = await stripe.accounts.retrieve();
  console.log("Stripe account OK:", acct.id);

  const products = await stripe.products.list({ limit: 100, active: true });
  let product = products.data.find((p) => p.name === "CryptoSence Premium");

  if (!product) {
    product = await stripe.products.create({
      name: "CryptoSence Premium",
      description: "Monthly subscription for full CryptoSence access",
    });
    console.log("Created product:", product.id);
  } else {
    console.log("Reusing product:", product.id);
  }

  const prices = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 20,
  });

  let price = prices.data.find(
    (p) =>
      p.recurring &&
      p.recurring.interval === "month" &&
      p.unit_amount === 999
  );

  if (!price) {
    price = await stripe.prices.create({
      product: product.id,
      unit_amount: 999,
      currency: "usd",
      recurring: { interval: "month" },
    });
    console.log("Created price:", price.id);
  } else {
    console.log("Reusing price:", price.id);
  }

  console.log("PRICE_ID=" + price.id);
})().catch((err) => {
  console.error("STRIPE_ERROR:", err.message);
  process.exit(1);
});
