"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, BookOpen, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [subscriptionData, setSubscriptionData] = useState<any>(null)

  useEffect(() => {
    const success = searchParams.get("success")
    const sessionId = searchParams.get("session_id")

    if (success === "true") {
      // Aguarda um pouco para o webhook processar
      setTimeout(() => {
        fetchUserData()
      }, 3000)
    } else {
      router.push("/dashboard")
    }
  }, [searchParams, router])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/protected/user")
      if (response.ok) {
        const data = await response.json()
        console.log("User data:", data)
        setSubscriptionData(data.subscription)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-600">Processing your payment...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-green-100">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl text-green-600">Payment Confirmed!</CardTitle>
          <CardDescription className="text-lg">Your subscription has been successfully activated.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {subscriptionData && (
            <div className="bg-white border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                Subscription Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Plan</p>
                  <p className="font-medium text-lg">{subscriptionData.plan_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monthly Tests</p>
                  <p className="font-medium text-lg">{subscriptionData.max_exams_per_month} Tests</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium text-lg text-green-600">Active</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Next Billing</p>
                  <p className="font-medium text-lg">
                    {subscriptionData.current_period_end
                      ? new Date(subscriptionData.current_period_end).toLocaleDateString("en-US")
                      : "In processing"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">🎉 Congratulations!</h4>
            <ul className="text-sm text-blue-700 space-y-1">
             <li>• Your subscription is active and ready to use</li>
             <li>• You can start taking your tests now</li>
             <li>• Access the dashboard to see all available options</li>
             <li>• If you have any questions, contact our support</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard" className="flex-1">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <ArrowRight className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/exam" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                <BookOpen className="h-4 w-4 mr-2" />
                View Available Tests
              </Button>
            </Link>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">Thank you for choosing our platform! 🚀</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
