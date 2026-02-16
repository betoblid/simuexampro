import { type NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { stripe, SUBSCRIPTION_PLANS } from "@/lib/stripe";

type PlanKey = keyof typeof SUBSCRIPTION_PLANS;

const PLAN_NAME_CANDIDATES: Record<PlanKey, string[]> = {
  junior: ["Júnior", "Junior", "JÃºnior"],
  pleno: ["Pleno"],
  senior: ["Sênior", "Senior", "SÃªnior"],
};

function normalizeBaseUrl(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function getPlanKey(value: unknown): PlanKey | null {
  if (value === "junior" || value === "pleno" || value === "senior") return value;
  return null;
}

async function resolvePlanDbId(planKey: PlanKey, priceId: string): Promise<number | null> {
  const byPrice = await pool.query(
    "SELECT id FROM subscription_plans WHERE stripe_price_id = $1 LIMIT 1",
    [priceId],
  );

  if (byPrice.rows.length > 0) {
    return Number(byPrice.rows[0].id);
  }

  const byName = await pool.query(
    "SELECT id FROM subscription_plans WHERE name = ANY($1::text[]) ORDER BY id LIMIT 1",
    [PLAN_NAME_CANDIDATES[planKey]],
  );

  if (byName.rows.length === 0) {
    return null;
  }

  const planDbId = Number(byName.rows[0].id);

  // Keep DB plan and Stripe price aligned to avoid future lookup failures.
  await pool.query(
    "UPDATE subscription_plans SET stripe_price_id = $1 WHERE id = $2 AND stripe_price_id <> $1",
    [priceId, planDbId],
  );

  return planDbId;
}

async function resolveStripeCustomerId(user: { id: number; email: string; name: string }): Promise<string> {
  const existingCustomer = await pool.query(
    "SELECT stripe_customer_id FROM user_subscriptions WHERE user_id = $1 AND stripe_customer_id IS NOT NULL ORDER BY updated_at DESC LIMIT 1",
    [user.id],
  );

  const existingId = existingCustomer.rows[0]?.stripe_customer_id as string | undefined;
  if (existingId) {
    try {
      const customer = await stripe.customers.retrieve(existingId);
      if (!("deleted" in customer && customer.deleted)) {
        return customer.id;
      }
    } catch {
      // fall back to creating a new customer below
    }
  }

  const created = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: String(user.id) },
  });

  return created.id;
}

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

    const body = await request.json();
    const planKey = getPlanKey(body?.planId);
    if (!planKey) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const userResult = await pool.query("SELECT id, email, name FROM users WHERE id = $1", [decoded.userId]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userResult.rows[0];
    const plan = SUBSCRIPTION_PLANS[planKey];

    const planDbId = await resolvePlanDbId(planKey, plan.priceId);
    if (!planDbId) {
      return NextResponse.json(
        { error: "Plan not configured in subscription_plans for this Stripe price." },
        { status: 500 },
      );
    }

    const customerId = await resolveStripeCustomerId(user);

    const appUrl = normalizeBaseUrl(
      process.env.NEXT_PUBLIC_APP_URL ||
        process.env.NEXT_PUBLIC_BASE_URL ||
        (process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_")
          ? "https://www.simuexampro.com"
          : "http://localhost:3000"),
    );

    const metadata = {
      userId: String(user.id),
      planId: planKey,
      planDbId: String(planDbId),
    };

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: String(user.id),
      mode: "payment",
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${appUrl}/success?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/subscription?canceled=true`,
      metadata,
      payment_intent_data: { metadata },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Create checkout session error:", error?.raw?.message || error?.message || error);
    return NextResponse.json(
      { error: error?.raw?.message || error?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
