import { type NextRequest, NextResponse } from "next/server"
import { stripe, SUBSCRIPTION_PLANS } from "@/lib/stripe"
import { pool } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Token não encontrado" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { planId } = await request.json()

    if (!planId || !SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 })
    }

    // Get user data
    const userResult = await pool.query("SELECT id, email, name FROM users WHERE id = $1", [decoded.userId])

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const user = userResult.rows[0]
    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]

    // Create or get Stripe customer
    let customerId: string

    const existingCustomer = await pool.query(
      "SELECT stripe_customer_id FROM user_subscriptions WHERE user_id = $1 AND stripe_customer_id IS NOT NULL LIMIT 1",
      [user.id],
    )

    if (existingCustomer.rows.length > 0) {
      customerId = existingCustomer.rows[0].stripe_customer_id
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id.toString(),
        },
      })
      customerId = customer.id
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?canceled=true`,
      metadata: {
        userId: user.id.toString(),
        planId: planId,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Create checkout session error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
