import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { pool } from "@/lib/db"
import type Stripe from "stripe"
import { add30Days } from "@/lib/addDays"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }
    
    console.log(`Received event: ${event.data.object.object}`)
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = Number.parseInt(session.metadata?.userId || "0")
  const planId = session.metadata?.planId

  if (!userId || !planId) {
    console.error("Missing metadata in checkout session")
    return
  }

  try {
    await pool.query("BEGIN")

    // Get plan details from our mapping
    const planName = planId === "junior" ? "Júnior" : planId === "pleno" ? "Pleno" : "Sênior"

    const planResult = await pool.query("SELECT id FROM subscription_plans WHERE name = $1", [planName])

    if (planResult.rows.length === 0) {
      console.error("Plan not found:", planName)
      await pool.query("ROLLBACK")
      return
    }

    const planDbId = planResult.rows[0].id

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

   
    // Deactivate any existing active subscriptions for this user
    await pool.query(
      `UPDATE user_subscriptions 
       SET status = 'canceled', updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND status = 'active'`,
      [userId],
    )

    // Create new subscription record
    await pool.query(
  `INSERT INTO user_subscriptions (
    user_id,
    plan_id,
    stripe_subscription_id,
    stripe_customer_id,
    status,
    current_period_start,
    current_period_end
  ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
  [
    userId,
    planDbId,
    subscription.id,
    session.customer,
    "active",
    new Date(subscription.start_date * 1000),
    add30Days(subscription.start_date),
  ]
)

    await pool.query("COMMIT")
    console.log(`Subscription created successfully for user ${userId}, plan ${planName}`)
  } catch (error) {
    await pool.query("ROLLBACK")
    console.error("Error handling checkout completion:", error)
    throw error
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {

  console.log(`Payment succeeded for invoice ${invoice.object}`)
 if ('subscription' in invoice && invoice.subscription) {
  await pool.query(
    `UPDATE user_subscriptions
     SET status = 'active', updated_at = CURRENT_TIMESTAMP
     WHERE stripe_subscription_id = $1`,
    [invoice.subscription]
  )
}

}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if ('subscription' in invoice && invoice.subscription) {
    await pool.query(
      `UPDATE user_subscriptions 
       SET status = 'past_due', updated_at = CURRENT_TIMESTAMP
       WHERE stripe_subscription_id = $1`,
      [invoice.subscription],
    )
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    await pool.query(
      `UPDATE user_subscriptions 
       SET status = $1, 
           current_period_start = $2, 
           current_period_end = $3, 
           updated_at = CURRENT_TIMESTAMP
       WHERE stripe_subscription_id = $4`,
      [
        subscription.status,
        new Date(subscription.start_date * 1000),
        add30Days(subscription.start_date),
        subscription.id,
      ],
    )
    console.log(`Subscription updated: ${subscription.id}, status: ${subscription.status}`)
  } catch (error) {
    console.error("Error updating subscription:", error)
    throw error
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await pool.query(
    `UPDATE user_subscriptions 
     SET status = 'canceled', updated_at = CURRENT_TIMESTAMP
     WHERE stripe_subscription_id = $1`,
    [subscription.id],
  )
}
