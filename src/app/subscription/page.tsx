"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, BookOpen, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function SubscriptionPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const searchParams = useSearchParams()

  useEffect(() => {
    const canceled = searchParams.get("canceled")
    if (canceled === "true") {
      toast( "You can try again whenever you want. If you have any questions, please contact us.")
    }
  }, [searchParams, toast])

  const plans = [
    {
      id: "junior",
      name: "Junior",
      price: "$ 200",
      period: "/month",
      maxExams: 3,
       features: ["Up to 3 monthly tests", "Historical results", "Basic Support"],
    },
    {
      id: "pleno",
      name: "Full",
       price: "$ 350",
      period: "/month",
      maxExams: 5,
      features: ["Up to 5 monthly tests", "Detailed history", "Priority Support", "Basic Support"],
      popular: true,
    },
    {
      id: "senior",
      name: "Senior",
       price: "$ 500",
      period: "/month",
      maxExams: 10,
      features: ["Up to 10 monthly tests", "Detailed history", "Premium Support", "Exclusive simulations"],
    },
  ]

  const handleSubscribe = async (planId: string) => {
    setLoading(planId)

    try {
      const response = await fetch("/api/protected/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        toast( data.error || "Error processing signaturen. Please try again.")
      }
    } catch (error) {
      toast("Connection error. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">ProvaOnline</h1>
            </div>
            <Link href="/dashboard">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
               Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose your Subscription Plan</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
           Select the plan that best suits your study needs. All plans include full access to our platform.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? "border-blue-500 shadow-lg scale-105" : ""}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">Most popular</Badge>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </CardDescription>
                <div className="text-sm text-gray-600">Up to {plan.maxExams} tests per month</div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${plan.popular ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                >
                  {loading === plan.id ? "Processing..." : "Subscribe Now"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Faq</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-2">Can I cancel at any time?</h4>
              <p className="text-gray-600 text-sm">
                Yes, you can cancel your subscription at any time. Cancellation will be effective at the end of the current billing period.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Can I change my plan?</h4>
              <p className="text-gray-600 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. The changes will apply in the next billing cycle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">What happens if I exceed the limit?</h4>
              <p className="text-gray-600 text-sm">
                If you reach your plan's proof limit, you'll need to wait until the next month or upgrade to a higher plan.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Are payments secure?</h4>
              <p className="text-gray-600 text-sm">
                Yes, we use Stripe to process payments, ensuring maximum security for your financial information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
