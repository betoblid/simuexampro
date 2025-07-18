import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
})

export { stripe }

export const SUBSCRIPTION_PLANS = {
  junior: {
    name: "Júnior",
    price: 1000, // R$10.00 in cents
    maxExams: 3,
    priceId: process.env.STRIPE_PRICE_ID_JUNIOR!,
  },
  pleno: {
    name: "Pleno",
    price: 3000, // R$30.00 in cents
    maxExams: 5,
    priceId: process.env.STRIPE_PRICE_ID_PLENO!,
  },
  senior: {
    name: "Sênior",
    price: 5000, // R$50.00 in cents
    maxExams: 10,
    priceId: process.env.STRIPE_PRICE_ID_SENIOR!,
  },
}
