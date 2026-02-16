import { type NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { stripe, SUBSCRIPTION_PLANS } from "@/lib/stripe";
import type Stripe from "stripe";
import type { PoolClient } from "pg";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
const ACCESS_DURATION_DAYS = 30;

type PlanKey = keyof typeof SUBSCRIPTION_PLANS;

const PLAN_NAME_CANDIDATES: Record<PlanKey, string[]> = {
  junior: ["Júnior", "Junior", "JÃºnior"],
  pleno: ["Pleno"],
  senior: ["Sênior", "Senior", "SÃªnior"],
};

function getPlanKey(value: string | undefined | null): PlanKey | null {
  if (value === "junior" || value === "pleno" || value === "senior") return value;
  return null;
}

function toPositiveInt(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function extractStripeId(
  value:
    | string
    | Stripe.Customer
    | Stripe.DeletedCustomer
    | Stripe.PaymentIntent
    | null
    | undefined,
): string | null {
  if (typeof value === "string" && value) return value;
  if (value && typeof value === "object" && "id" in value && typeof value.id === "string") return value.id;
  return null;
}

function buildAccessPeriod(createdUnixSeconds?: number): { periodStart: Date; periodEnd: Date } {
  const periodStart = createdUnixSeconds ? new Date(createdUnixSeconds * 1000) : new Date();
  const periodEnd = new Date(periodStart.getTime() + ACCESS_DURATION_DAYS * 24 * 60 * 60 * 1000);
  return { periodStart, periodEnd };
}

async function ensureUserExists(client: PoolClient, userId: number): Promise<boolean> {
  const result = await client.query("SELECT id FROM users WHERE id = $1", [userId]);
  return result.rows.length > 0;
}

async function getPlanDbIdByPrice(client: PoolClient, priceId: string): Promise<number | null> {
  const result = await client.query(
    "SELECT id FROM subscription_plans WHERE stripe_price_id = $1 LIMIT 1",
    [priceId],
  );
  if (result.rows.length === 0) return null;
  return Number(result.rows[0].id);
}

async function getPlanDbIdByNames(client: PoolClient, planKey: PlanKey): Promise<number | null> {
  const result = await client.query(
    "SELECT id FROM subscription_plans WHERE name = ANY($1::text[]) ORDER BY id LIMIT 1",
    [PLAN_NAME_CANDIDATES[planKey]],
  );
  if (result.rows.length === 0) return null;
  return Number(result.rows[0].id);
}

async function resolvePlanDbIdForCheckout(
  client: PoolClient,
  session: Stripe.Checkout.Session,
): Promise<number | null> {
  const planDbIdFromMetadata = toPositiveInt(session.metadata?.planDbId);
  if (planDbIdFromMetadata) {
    const exists = await client.query("SELECT id FROM subscription_plans WHERE id = $1 LIMIT 1", [
      planDbIdFromMetadata,
    ]);
    if (exists.rows.length > 0) return planDbIdFromMetadata;
  }

  const planKey = getPlanKey(session.metadata?.planId);
  if (planKey) {
    const byConfiguredPrice = await getPlanDbIdByPrice(client, SUBSCRIPTION_PLANS[planKey].priceId);
    if (byConfiguredPrice) return byConfiguredPrice;
  }

  const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["line_items.data.price"],
  });
  const lineItemPriceId = fullSession.line_items?.data?.[0]?.price?.id;
  if (lineItemPriceId) {
    const byLineItemPrice = await getPlanDbIdByPrice(client, lineItemPriceId);
    if (byLineItemPrice) return byLineItemPrice;
  }

  if (planKey) {
    return getPlanDbIdByNames(client, planKey);
  }

  return null;
}

async function resolvePlanDbIdForPaymentIntent(
  client: PoolClient,
  paymentIntent: Stripe.PaymentIntent,
): Promise<number | null> {
  const planDbIdFromMetadata = toPositiveInt(paymentIntent.metadata?.planDbId);
  if (planDbIdFromMetadata) {
    const exists = await client.query("SELECT id FROM subscription_plans WHERE id = $1 LIMIT 1", [
      planDbIdFromMetadata,
    ]);
    if (exists.rows.length > 0) return planDbIdFromMetadata;
  }

  const planKey = getPlanKey(paymentIntent.metadata?.planId);
  if (!planKey) return null;

  const byConfiguredPrice = await getPlanDbIdByPrice(client, SUBSCRIPTION_PLANS[planKey].priceId);
  if (byConfiguredPrice) return byConfiguredPrice;

  return getPlanDbIdByNames(client, planKey);
}

async function upsertUserSubscription(
  client: PoolClient,
  params: {
    userId: number;
    planDbId: number;
    externalId: string;
    stripeCustomerId: string | null;
    status: string;
    periodStart: Date;
    periodEnd: Date;
  },
) {
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
    [
      params.userId,
      params.planDbId,
      params.externalId,
      params.stripeCustomerId,
      params.status,
      params.periodStart,
      params.periodEnd,
    ],
  );
}

async function cancelCurrentActivePlans(client: PoolClient, userId: number) {
  await client.query(
    `UPDATE user_subscriptions
       SET status = 'canceled', updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $1
       AND status IN ('active', 'trialing')`,
    [userId],
  );
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const stripeCustomerId = extractStripeId(session.customer);
  let userId = toPositiveInt(session.metadata?.userId) ?? toPositiveInt(session.client_reference_id);

  if (!userId && stripeCustomerId) {
    const customer = await stripe.customers.retrieve(stripeCustomerId);
    if (!("deleted" in customer && customer.deleted)) {
      userId = toPositiveInt(customer.metadata?.userId);
    }
  }

  if (!userId) {
    throw new Error(`Could not resolve userId for checkout session ${session.id}`);
  }

  const externalId = extractStripeId(session.payment_intent) || session.id;
  const status = session.payment_status === "paid" ? "active" : "pending";
  const { periodStart, periodEnd } = buildAccessPeriod(session.created);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const userExists = await ensureUserExists(client, userId);
    if (!userExists) throw new Error(`User ${userId} not found`);

    const planDbId = await resolvePlanDbIdForCheckout(client, session);
    if (!planDbId) {
      throw new Error(`Could not resolve plan for checkout session ${session.id}`);
    }

    await cancelCurrentActivePlans(client, userId);
    await upsertUserSubscription(client, {
      userId,
      planDbId,
      externalId,
      stripeCustomerId,
      status,
      periodStart,
      periodEnd,
    });

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { periodStart, periodEnd } = buildAccessPeriod(paymentIntent.created);

    const updateExisting = await client.query(
      `UPDATE user_subscriptions
         SET status = 'active',
             current_period_start = COALESCE(current_period_start, $2),
             current_period_end = COALESCE(current_period_end, $3),
             updated_at = CURRENT_TIMESTAMP
       WHERE stripe_subscription_id = $1
       RETURNING id`,
      [paymentIntent.id, periodStart, periodEnd],
    );

    if (updateExisting.rows.length > 0) {
      await client.query("COMMIT");
      return;
    }

    const stripeCustomerId = extractStripeId(paymentIntent.customer);
    let userId = toPositiveInt(paymentIntent.metadata?.userId);
    if (!userId && stripeCustomerId) {
      const customer = await stripe.customers.retrieve(stripeCustomerId);
      if (!("deleted" in customer && customer.deleted)) {
        userId = toPositiveInt(customer.metadata?.userId);
      }
    }

    if (!userId) {
      throw new Error(`Could not resolve userId for payment intent ${paymentIntent.id}`);
    }

    const userExists = await ensureUserExists(client, userId);
    if (!userExists) throw new Error(`User ${userId} not found`);

    const planDbId = await resolvePlanDbIdForPaymentIntent(client, paymentIntent);
    if (!planDbId) {
      throw new Error(`Could not resolve plan for payment intent ${paymentIntent.id}`);
    }

    await cancelCurrentActivePlans(client, userId);
    await upsertUserSubscription(client, {
      userId,
      planDbId,
      externalId: paymentIntent.id,
      stripeCustomerId,
      status: "active",
      periodStart,
      periodEnd,
    });

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  await pool.query(
    `UPDATE user_subscriptions
       SET status = 'canceled', updated_at = CURRENT_TIMESTAMP
     WHERE stripe_subscription_id = $1`,
    [paymentIntent.id],
  );
}

export async function POST(request: NextRequest) {
  try {
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is missing");
      return NextResponse.json({ error: "Webhook secret is not configured" }, { status: 500 });
    }

    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
