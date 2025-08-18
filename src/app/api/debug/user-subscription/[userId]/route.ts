import { type NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { stripe } from "@/lib/stripe"

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params
    const userIdNum = Number.parseInt(userId)

    console.log("🔍 Checking subscription for user:", userIdNum)

    // Get user data
    const userQuery = `
      SELECT 
        u.id,
        u.email,
        u.name,
        us.id as subscription_id,
        us.stripe_subscription_id,
        us.stripe_customer_id,
        us.status,
        us.current_period_start,
        us.current_period_end,
        us.created_at,
        us.updated_at,
        sp.name as plan_name,
        sp.max_exams_per_month
      FROM users u
      LEFT JOIN user_subscriptions us ON u.id = us.user_id
      LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE u.id = $1
      ORDER BY us.created_at DESC
    `

    const result = await pool.query(userQuery, [userIdNum])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userData = result.rows[0]
    let stripeData = null

    // If user has a Stripe subscription, get data from Stripe
    if (userData.stripe_subscription_id) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(userData.stripe_subscription_id)
        stripeData = {
          id: stripeSubscription.id,
          status: stripeSubscription.status,
          created: new Date(stripeSubscription.created * 1000),
        }
      } catch (error) {
        console.error("Error fetching Stripe subscription:", error)
        stripeData = { error: "Failed to fetch from Stripe" }
      }
    }

    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
      },
      database_subscription: userData.subscription_id
        ? {
            id: userData.subscription_id,
            stripe_subscription_id: userData.stripe_subscription_id,
            stripe_customer_id: userData.stripe_customer_id,
            status: userData.status,
            plan_name: userData.plan_name,
            max_exams_per_month: userData.max_exams_per_month,
            current_period_start: userData.current_period_start,
            current_period_end: userData.current_period_end,
            created_at: userData.created_at,
            updated_at: userData.updated_at,
          }
        : null,
      stripe_subscription: stripeData,
      all_subscriptions: result.rows
        .map((row) => ({
          id: row.subscription_id,
          status: row.status,
          plan_name: row.plan_name,
          created_at: row.created_at,
        }))
        .filter((sub) => sub.id),
    })
  } catch (error) {
    console.error("Debug user subscription error:", error)
    return NextResponse.json(
      {
        error: "Debug failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
