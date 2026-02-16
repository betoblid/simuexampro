"use client"

import { useStripe } from "@/hooks/useStripe"


export function PortalButton() {

    const { handleCreateStripePortal } = useStripe();
    return(
        <>
            <button  onClick={() => handleCreateStripePortal()} className="cursor-pointer">Portal</button>
        </>
    )
}