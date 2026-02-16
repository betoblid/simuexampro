import { type NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

type ConfirmBody = {
  sessionId?: string;
};

const ACCESS_DURATION_DAYS = 30;

function toPositiveInt(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function getPeriod(createdUnixSeconds?: number) {
  const periodStart = createdUnixSeconds ? new Date(createdUnixSeconds * 1000) : new Date();
  const periodEnd = new Date(periodStart.getTime() + ACCESS_DURATION_DAYS * 24 * 60 * 60 * 1000);
  return { periodStart, periodEnd };
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) return NextResponse.json({ error: "Token not found" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = (await request.json()) as ConfirmBody;
    const sessionId = body?.sessionId;
    if (!sessionId) return NextResponse.json({ error: "sessionId is required" }, { status: 400 });

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price", "customer"],
    });

    const sessionUserId =
      toPositiveInt(session.metadata?.userId) ?? toPositiveInt(session.client_reference_id);

    if (!sessionUserId || sessionUserId !== decoded.userId) {
      return NextResponse.json({ error: "Session does not belong to this user" }, { status: 403 });
    }

    if (session.mode !== "payment") {
      return NextResponse.json({ error: "Unsupported checkout mode" }, { status: 400 });
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: `Checkout not paid yet (${session.payment_status})` },
        { status: 409 },
      );
    }

    const planDbId = toPositiveInt(session.metadata?.planDbId);
    if (!planDbId) {
      return NextResponse.json({ error: "Missing planDbId in checkout metadata" }, { status: 500 });
    }

    const planExists = await pool.query("SELECT id FROM subscription_plans WHERE id = $1 LIMIT 1", [planDbId]);
    if (planExists.rows.length === 0) {
      return NextResponse.json({ error: "Configured plan does not exist" }, { status: 500 });
    }

    const stripeCustomerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer && "id" in session.customer
          ? session.customer.id
          : null;

    const externalId =
      (typeof session.payment_intent === "string" && session.payment_intent) || session.id;

    const status = "active";
    const { periodStart, periodEnd } = getPeriod(session.created);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        `UPDATE user_subscriptions
           SET status = 'canceled', updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1
           AND status IN ('active', 'trialing')`,
        [decoded.userId],
      );

      await client.query(
        `INSERT INTO user_subscriptions (
           user_id,
           plan_id,
           stripe_subscription_id,
           stripe_customer_id,
           status,
           current_period_start,
           current_period_end,
           created_at,
           updated_at
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
         ON CONFLICT (stripe_subscription_id) DO UPDATE
           SET user_id = EXCLUDED.user_id,
               plan_id = EXCLUDED.plan_id,
               stripe_customer_id = EXCLUDED.stripe_customer_id,
               status = EXCLUDED.status,
               current_period_start = EXCLUDED.current_period_start,
               current_period_end = EXCLUDED.current_period_end,
               updated_at = CURRENT_TIMESTAMP`,
        [decoded.userId, planDbId, externalId, stripeCustomerId, status, periodStart, periodEnd],
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    return NextResponse.json({ ok: true, status });
  } catch (error: any) {
    console.error("Confirm checkout session error:", error?.message || error);
    return NextResponse.json({ error: "Failed to confirm checkout session" }, { status: 500 });
  }
}
