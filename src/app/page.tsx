import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, BookOpen, Users, Trophy } from "lucide-react"

export default function HomePage() {
  const plans = [
    {
      name: "Júnior",
      price: "US$ 200",
      period: "/mês",
      maxExams: 3,
      features: ["Até 3 provas mensais", "Histórico de resultados", "Suporte básico"],
    },
    {
      name: "Pleno",
      price: "US$ 350",
      period: "/mês",
      maxExams: 5,
      features: ["Até 5 provas mensais", "Histórico detalhado", "Suporte prioritário", "Análise de desempenho"],
      popular: true,
    },
    {
      name: "Sênior",
      price: "US$ 500",
      period: "/mês",
      maxExams: 10,
      features: ["Até 10 provas mensais", "Relatórios avançados", "Suporte premium", "Simulados exclusivos"],
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
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link href="/register">
                <Button>Cadastrar</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-100 mb-6">Plataforma de Provas Online</h2>
          <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Prepare-se para seus exames com nossa plataforma completa de provas simuladas. Escolha seu plano e comece a
            estudar hoje mesmo!
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register">
              <Button size="lg" className="px-8">
                Começar Agora
              </Button>
            </Link>
            <Link href="#plans">
              <Button variant="default" size="lg" className="px-8 bg-transparent text-white border-white hover:bg-white hover:text-black">
                Ver Planos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Por que escolher nossa plataforma?</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">Milhares de Questões</h4>
              <p className="text-gray-600">Banco de questões atualizado com provas reais e simulados exclusivos</p>
            </div>
            <div className="text-center">
              <Trophy className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">Acompanhe seu Progresso</h4>
              <p className="text-gray-600">Relatórios detalhados e histórico completo de suas tentativas</p>
            </div>
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">Resultados Instantâneos</h4>
              <p className="text-gray-600">Correção automática e feedback imediato para melhorar seu desempenho</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section id="plans" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Escolha seu Plano</h3>
            <p className="text-xl text-gray-600">Planos flexíveis para atender suas necessidades de estudo</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? "border-blue-500 shadow-lg" : ""}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                    Mais Popular
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
                      Escolher Plano
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
          <p className="text-gray-400 mb-4">Sua plataforma completa para preparação de exames</p>
          <p className="text-gray-500 text-sm">© 2024 ProvaOnline. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
