import { verifyToken } from "@/lib/auth";
import { pool } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Token not found" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const subscriptionResult = await pool.query(
      `SELECT stripe_customer_id
         FROM user_subscriptions
        WHERE user_id = $1
          AND stripe_customer_id IS NOT NULL
        ORDER BY updated_at DESC
        LIMIT 1`,
      [decoded.userId],
    );

    const customerId = subscriptionResult.rows[0]?.stripe_customer_id as string | undefined;
    if (!customerId) {
      return NextResponse.json(
        { error: "No active subscription found for this user." },
        { status: 404 },
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_")
        ? "https://www.simuexampro.com"
        : "http://localhost:3000");

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Erro ao criar portal do cliente:", err);
    return NextResponse.json({ error: "Erro ao criar portal do cliente" }, { status: 500 });
  }
}
