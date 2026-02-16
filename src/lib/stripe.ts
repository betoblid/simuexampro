import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
})

export { stripe }

export const SUBSCRIPTION_PLANS = {
  junior: {
    name: "Júnior",
    price: 2000, // R$200.00 in cents
    maxExams: 10,
    priceId: process.env.STRIPE_PRICE_ID_JUNIOR!,
  },
  pleno: {
    name: "Pleno",
    price: 3500, // R$350.00 in cents
    maxExams: 18,
    priceId: process.env.STRIPE_PRICE_ID_PLENO!,
  },
  senior: {
    name: "Sênior",
    price: 5000, // R$500.00 in cents
    maxExams: 25,
    priceId: process.env.STRIPE_PRICE_ID_SENIOR!,
  },
}
