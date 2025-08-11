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
      toast( "Você pode tentar novamente quando quiser.")
    }
  }, [searchParams, toast])

  const plans = [
    {
      id: "junior",
      name: "Júnior",
      price: "US$ 200",
      period: "/mês",
      maxExams: 3,
      features: ["Até 3 provas mensais", "Histórico de resultados", "Suporte básico", "Acesso a todas as provas"],
    },
    {
      id: "pleno",
      name: "Pleno",
      price: "US$ 350",
      period: "/mês",
      maxExams: 5,
      features: [
        "Até 5 provas mensais",
        "Histórico detalhado",
        "Suporte prioritário",
        "Análise de desempenho",
        "Relatórios mensais",
      ],
      popular: true,
    },
    {
      id: "senior",
      name: "Sênior",
      price: "US$ 500",
      period: "/mês",
      maxExams: 10,
      features: [
        "Até 10 provas mensais",
        "Relatórios avançados",
        "Suporte premium",
        "Simulados exclusivos",
        "Análise comparativa",
        "Acesso antecipado a novas provas",
      ],
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
        toast( data.error || "Erro ao processar assinatura")
      }
    } catch (error) {
      toast("Erro de conexão. Tente novamente.")
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
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Escolha seu Plano de Assinatura</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Selecione o plano que melhor atende às suas necessidades de estudo. Todos os planos incluem acesso completo
            à nossa plataforma.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? "border-blue-500 shadow-lg scale-105" : ""}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">Mais Popular</Badge>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </CardDescription>
                <div className="text-sm text-gray-600">Até {plan.maxExams} provas por mês</div>
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
                  {loading === plan.id ? "Processando..." : "Assinar Agora"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Perguntas Frequentes</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-2">Posso cancelar a qualquer momento?</h4>
              <p className="text-gray-600 text-sm">
                Sim, você pode cancelar sua assinatura a qualquer momento. O cancelamento será efetivo no final do
                período de cobrança atual.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">O que acontece se eu exceder o limite?</h4>
              <p className="text-gray-600 text-sm">
                Se você atingir o limite de provas do seu plano, precisará aguardar o próximo mês ou fazer upgrade para
                um plano superior.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Posso mudar de plano?</h4>
              <p className="text-gray-600 text-sm">
                Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças serão aplicadas
                no próximo ciclo de cobrança.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Os pagamentos são seguros?</h4>
              <p className="text-gray-600 text-sm">
                Sim, utilizamos o Stripe para processar pagamentos, garantindo máxima segurança para suas informações
                financeiras.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
