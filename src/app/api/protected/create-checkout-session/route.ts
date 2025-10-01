import { type NextRequest, NextResponse } from "next/server";
import { stripe, SUBSCRIPTION_PLANS } from "@/lib/stripe";
import { pool } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) return NextResponse.json({ error: "Token não encontrado" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

    const { planId } = await request.json();
    console.log("🛒 Creating checkout session for user:", decoded.userId, "plan:", planId);

    if (!planId || !SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]) {
      console.error("❌ Invalid plan ID:", planId);
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    // DB: buscar usuário
    const userResult = await pool.query(
      "SELECT id, email, name FROM users WHERE id = $1",
      [decoded.userId]
    );
    if (userResult.rows.length === 0) {
      console.error("❌ User not found:", decoded.userId);
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }
    const user = userResult.rows[0];
    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];

    console.log("👤 User found:", user.email, "Plan:", plan.name);

    // (opcional) usar/ criar customer
    let customerId: string | undefined;
    const existingCustomer = await pool.query(
      "SELECT stripe_customer_id FROM user_subscriptions WHERE user_id = $1 AND stripe_customer_id IS NOT NULL LIMIT 1",
      [user.id]
    );
    if (existingCustomer.rows.length > 0) {
      customerId = existingCustomer.rows[0].stripe_customer_id;
      console.log("🔄 Using existing customer:", customerId);
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: String(user.id) },
      });
      customerId = customer.id;
      console.log("✨ Created new customer:", customerId);
    }

    // URL base correta (com esquema http/https)
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_")
        ? "https://www.simuexampro.com"
        : "http://localhost:3000");

    // 👇 PAGAMENTO ÚNICO
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      // payment_method_types não é mais necessário; Stripe detecta
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${appUrl}/success?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/subscription?canceled=true`,
      metadata: {
        userId: String(user.id),
        planId: planId,
        userEmail: user.email,
        planName: plan.name,
      },
    });

    console.log("✅ Checkout session created:", session.id);
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("💥 Create checkout session error:", error?.raw?.message || error?.message || error);
    return NextResponse.json(
      { error: error?.raw?.message || error?.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}