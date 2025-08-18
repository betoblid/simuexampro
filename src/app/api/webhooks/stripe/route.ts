import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { pool } from "@/lib/db"
import type Stripe from "stripe"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  console.log("🔔 Webhook received")

  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

    console.log("📝 Webhook signature:", signature ? "Present" : "Missing")

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      console.log("✅ Webhook signature verified, event type:", event.type)
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    console.log("🎯 Processing event:", event.type, "ID:", event.id)

    switch (event.type) {
      case "checkout.session.completed":
        console.log("💳 Processing checkout.session.completed")
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case "invoice.payment_succeeded":
        console.log("💰 Processing invoice.payment_succeeded")
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case "invoice.payment_failed":
        console.log("❌ Processing invoice.payment_failed")
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case "customer.subscription.updated":
        console.log("🔄 Processing customer.subscription.updated")
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case "customer.subscription.deleted":
        console.log("🗑️ Processing customer.subscription.deleted")
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`)
    }

    console.log("✅ Webhook processed successfully")
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("💥 Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("🛒 Handling checkout completion for session:", session.id)

  const userId = Number.parseInt(session.metadata?.userId || "0")
  const planId = session.metadata?.planId

  console.log("👤 User ID:", userId, "Plan ID:", planId)

  if (!userId || !planId) {
    console.error("❌ Missing metadata in checkout session:", { userId, planId })
    throw new Error("Missing metadata in checkout session")
  }

  try {
    await pool.query("BEGIN")
    console.log("🔄 Transaction started")

    // Get plan details from our mapping
    const planName = planId === "junior" ? "Júnior" : planId === "pleno" ? "Pleno" : "Sênior"
    console.log("📋 Plan name:", planName)

    const planResult = await pool.query("SELECT id FROM subscription_plans WHERE name = $1", [planName])

    if (planResult.rows.length === 0) {
      console.error("❌ Plan not found:", planName)
      await pool.query("ROLLBACK")
      throw new Error(`Plan not found: ${planName}`)
    }

    const planDbId = planResult.rows[0].id
    console.log("🆔 Plan DB ID:", planDbId)

    // Get subscription details from Stripe
    if (!session.subscription) {
      console.error("❌ No subscription ID in session")
      await pool.query("ROLLBACK")
      throw new Error("No subscription ID in session")
    }

    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    console.log("📊 Stripe subscription retrieved:", subscription.id, "Status:", subscription.status)

    // Check if user exists
    const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [userId])
    if (userCheck.rows.length === 0) {
      console.error("❌ User not found:", userId)
      await pool.query("ROLLBACK")
      throw new Error(`User not found: ${userId}`)
    }

    // Deactivate any existing active subscriptions for this user
    const deactivateResult = await pool.query(
      `UPDATE user_subscriptions 
       SET status = 'canceled', updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND status IN ('active', 'trialing')
       RETURNING id`,
      [userId],
    )

    console.log("🔄 Deactivated existing subscriptions:", deactivateResult.rows.length)

    // Create new subscription record
    const insertResult = await pool.query(
      `INSERT INTO user_subscriptions (
        user_id, 
        plan_id, 
        stripe_subscription_id, 
        stripe_customer_id, 
        status,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id`,
      [
        userId,
        planDbId,
        subscription.id,
        session.customer,
        subscription.status,
      ],
    )

    const subscriptionDbId = insertResult.rows[0].id
    console.log("✅ New subscription created with ID:", subscriptionDbId)

    await pool.query("COMMIT")
    console.log("✅ Transaction committed successfully")
    console.log(`🎉 Subscription created successfully for user ${userId}, plan ${planName}`)
  } catch (error) {
    await pool.query("ROLLBACK")
    console.error("💥 Error handling checkout completion:", error)
    throw error
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log("💰 Handling payment succeeded for invoice:", invoice.id)

 if ('subscription' in invoice && invoice.subscription) {
    const result = await pool.query(
      `UPDATE user_subscriptions 
       SET status = 'active', updated_at = CURRENT_TIMESTAMP
       WHERE stripe_subscription_id = $1
       RETURNING id, user_id`,
      [invoice.subscription],
    )

    console.log("✅ Payment succeeded, updated subscriptions:", result.rows.length)
    if (result.rows.length > 0) {
      console.log("👤 Updated subscription for user:", result.rows[0].user_id)
    }
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log("❌ Handling payment failed for invoice:", invoice.id)

 if ('subscription' in invoice && invoice.subscription) {
    const result = await pool.query(
      `UPDATE user_subscriptions 
       SET status = 'past_due', updated_at = CURRENT_TIMESTAMP
       WHERE stripe_subscription_id = $1
       RETURNING id, user_id`,
      [invoice.subscription],
    )

    console.log("⚠️ Payment failed, updated subscriptions:", result.rows.length)
    if (result.rows.length > 0) {
      console.log("👤 Updated subscription for user:", result.rows[0].user_id)
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log("🔄 Handling subscription updated:", subscription.id, "Status:", subscription.status)

  try {
    const result = await pool.query(
      `UPDATE user_subscriptions 
       SET status = $1, 
           current_period_start = $2, 
           current_period_end = $3, 
           updated_at = CURRENT_TIMESTAMP
       WHERE stripe_subscription_id = $4
       RETURNING id, user_id`,
      [
        subscription.status,
        subscription.id,
      ],
    )

    console.log("✅ Subscription updated, affected rows:", result.rows.length)
    if (result.rows.length > 0) {
      console.log("👤 Updated subscription for user:", result.rows[0].user_id)
    }
  } catch (error) {
    console.error("💥 Error updating subscription:", error)
    throw error
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log("🗑️ Handling subscription deleted:", subscription.id)

  const result = await pool.query(
    `UPDATE user_subscriptions 
     SET status = 'canceled', updated_at = CURRENT_TIMESTAMP
     WHERE stripe_subscription_id = $1
     RETURNING id, user_id`,
    [subscription.id],
  )

  console.log("✅ Subscription deleted, affected rows:", result.rows.length)
  if (result.rows.length > 0) {
    console.log("👤 Canceled subscription for user:", result.rows[0].user_id)
  }
}
