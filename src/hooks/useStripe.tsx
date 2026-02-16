"use client";

import { loadStripe, Stripe } from "@stripe/stripe-js";
import { useEffect, useState, useCallback } from "react";

type CreateStripeCheckoutParams = {
    planId: string;
};

export function useStripe() {
    const [stripe, setStripe] = useState<Stripe | null>(null);

    useEffect(() => {
        async function loadStripeAsync() {
            const stripeInstance = await loadStripe(
                process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!
            );
            setStripe(stripeInstance);
        }

        loadStripeAsync();
    }, []);

    const createStripeCheckout = useCallback(
        async ({ planId }: CreateStripeCheckoutParams) => {
            try {
                if (!stripe) {
                    console.warn("Stripe not loaded yet; proceeding with backend redirect.");
                }

                const response = await fetch("/api/protected/create-checkout-session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ planId }),
                });

                if (!response.ok) {
                    console.error("Failed to create checkout " + (await response.text()));
                    return;
                }

                const data: { url?: string } = await response.json();

                if (!data.url) {
                    console.error("API did not return a checkout URL.");
                    return;
                }

                window.location.href = data.url;
            } catch (err) {
                console.error("Internal error:", err);
            }
        },
        [stripe]
    );

    const handleCreateStripePortal = useCallback(async () => {
        try {
            const response = await fetch("/api/create-portal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (response.status === 401) {
                console.error("Session expired or invalid.");
                window.location.href = "/login";
                return;
            }

            if (!response.ok) {
                console.error("Failed to create portal: " + (await response.text()));
                return;
            }

            const data: { url?: string } = await response.json();

            if (!data.url) {
                console.error("API did not return a portal URL.");
                return;
            }

            window.location.href = data.url;
        } catch (err) {
            console.error("Error creating customer portal:", err);
        }
    }, []);

    return { stripe, createStripeCheckout, handleCreateStripePortal };
}
