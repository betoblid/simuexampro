import { NextResponse } from "next/server"
import { pool } from "@/lib/db"

export async function GET() {
  try {
    // Check webhook secret
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    // Check recent subscriptions
    const subscriptionsQuery = `
      SELECT 
        us.id,
        us.user_id,
        us.stripe_subscription_id,
        us.stripe_customer_id,
        us.status,
        us.created_at,
        us.updated_at,
        sp.name as plan_name,
        u.email as user_email
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      JOIN users u ON us.user_id = u.id
      ORDER BY us.created_at DESC
      LIMIT 10
    `

    const subscriptions = await pool.query(subscriptionsQuery)

    // Check environment variables
    const envCheck = {
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
      STRIPE_PRICE_ID_JUNIOR: !!process.env.STRIPE_PRICE_ID_JUNIOR,
      STRIPE_PRICE_ID_PLENO: !!process.env.STRIPE_PRICE_ID_PLENO,
      STRIPE_PRICE_ID_SENIOR: !!process.env.STRIPE_PRICE_ID_SENIOR,
    }

    return NextResponse.json({
      status: "success",
      webhookSecret: webhookSecret ? "Configured" : "Missing",
      environmentVariables: envCheck,
      recentSubscriptions: subscriptions.rows,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Debug webhook error:", error)
    return NextResponse.json(
      {
        error: "Debug failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
