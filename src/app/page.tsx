import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, BookOpen, Users, Trophy } from "lucide-react"

export default function HomePage() {
  const plans = [
    {
      name: "Junior",
      price: "$ 200",
      period: "/month",
      maxExams: 3,
      features: ["Up to 3 monthly tests", "Historical results", "Basic Support"],
    },
    {
      name: "Full ",
      price: "$ 350",
      period: "/month",
      maxExams: 5,
      features: ["Up to 5 monthly tests", "Detailed history", "Priority Support", "Basic Support"],
      popular: true,
    },
    {
      name: "Senior",
      price: "US$ 500",
      period: "/month",
      maxExams: 10,
      features: ["Up to 10 monthly tests", "Detailed history", "Premium Support", "Exclusive simulations"],
    },
  ]

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
            <div className="flex space-x-4">
              <Link href="/login">
                <Button variant="ghost">Enter</Button>
              </Link>
              <Link href="/register">
                <Button>Register</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-100 mb-6">Online Evidence Platform</h2>
          <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
           Prepare for your exams with our complete mock exam platform. Choose your plan and start studying today!
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register">
              <Button size="lg" className="px-8">
               Get Started
              </Button>
            </Link>
            <Link href="#plans">
              <Button variant="default" size="lg" className="px-8 bg-transparent text-white border-white hover:bg-white hover:text-black">
              View Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why choose our platform?</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">Thousands of Questions</h4>
              <p className="text-gray-600">Updated question bank with real tests and exclusive mock tests</p>
            </div>
            <div className="text-center">
              <Trophy className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">Track Your Progress</h4>
              <p className="text-gray-600">Detailed reports and complete history of your attempts</p>
            </div>
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">Instant Results</h4>
              <p className="text-gray-600">Automatic correction and immediate feedback to improve your performance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section id="plans" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Choose your Plan</h3>
            <p className="text-xl text-gray-600">Flexible plans to meet your study needs</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? "border-blue-500 shadow-lg" : ""}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                    Most popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                     Choose Plan
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-blue-400 mr-3" />
            <h4 className="text-2xl font-bold">ProvaOnline</h4>
          </div>
          <p className="text-gray-400 mb-4">Your all-in-one platform for exam preparation</p>
          <p className="text-gray-500 text-sm">&copy; 2024 ProvaOnline. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
