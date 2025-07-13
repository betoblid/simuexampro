"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, User, Trophy, LogOut, CreditCard } from "lucide-react"
import Link from "next/link"

interface UserData {
  id: number
  name: string
  email: string
  username: string
  phone?: string
  subscription?: {
    plan_name: string
    max_exams_per_month: number
    status: string
  }
  monthlyUsage: {
    exams_taken: number
  }
  recentAttempts: Array<{
    id: number
    exam_title: string
    score: number
    total_questions: number
    percentage: number
    completed_at: string
  }>
}

interface Exam {
  id: number
  title: string
  description: string
  total_questions: number
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
    fetchExams()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/protected/user")
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
      } else {
        router.push("/login")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  const fetchExams = async () => {
    try {
      const response = await fetch("/api/protected/exams")
      if (response.ok) {
        const data = await response.json()
        setExams(data)
      }
    } catch (error) {
      console.error("Error fetching exams:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const canTakeExam = () => {
    if (!userData?.subscription || !userData?.monthlyUsage) return false
    return userData.monthlyUsage.exams_taken < userData.subscription.max_exams_per_month
  }

  const getSubscriptionStatus = () => {
    if (!userData?.subscription) return "Sem plano ativo"
    return userData.subscription.status === "active" ? "Ativo" : "Inativo"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">ProvaOnline</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Olá, {userData?.name}</span>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="font-medium">{userData?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{userData?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Usuário</p>
                  <p className="font-medium">@{userData?.username}</p>
                </div>
                {userData?.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Telefone</p>
                    <p className="font-medium">{userData.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subscription Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Assinatura
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userData?.subscription ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{userData.subscription.plan_name}</span>
                      <Badge variant={userData.subscription.status === "active" ? "default" : "secondary"}>
                        {getSubscriptionStatus()}
                      </Badge>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Provas este mês</span>
                        <span>
                          {userData.monthlyUsage?.exams_taken || 0} / {userData.subscription.max_exams_per_month}
                        </span>
                      </div>
                      <Progress
                        value={
                          ((userData.monthlyUsage?.exams_taken || 0) / userData.subscription.max_exams_per_month) * 100
                        }
                        className="h-2"
                      />

                      {/* Botão de upgrade quando limite atingido */}
                      {(userData.monthlyUsage?.exams_taken || 0) >= userData.subscription.max_exams_per_month && (
                        <div className="mt-4">
                          <Link href="/subscription">
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transform transition hover:scale-105">
                              🚀 Atualizar Plano
                            </Button>
                          </Link>
                          <p className="text-xs text-center text-gray-500 mt-2">
                            Você atingiu o limite mensal. Faça upgrade para continuar!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">Você não possui um plano ativo</p>
                    <Link href="/subscription">
                      <Button>Escolher Plano</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Available Exams */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Provas Disponíveis
                </CardTitle>
                <CardDescription>Escolha uma prova para começar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {exams.map((exam) => (
                    <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{exam.title}</h3>
                        <p className="text-sm text-gray-600">{exam.description}</p>
                        <p className="text-sm text-gray-500">{exam.total_questions} questões</p>
                      </div>
                      <div>
                        {canTakeExam() ? (
                          <Link href={`/exam/${exam.id}`}>
                            <Button>Iniciar Prova</Button>
                          </Link>
                        ) : (
                          <Button disabled>Limite Atingido</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {!canTakeExam() && userData?.subscription && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      Você atingiu o limite de provas do seu plano este mês. Upgrade seu plano para fazer mais provas.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Resultados Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userData?.recentAttempts && userData.recentAttempts.length > 0 ? (
                  <div className="space-y-4">
                    {userData.recentAttempts.map((attempt) => (
                      <div key={attempt.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{attempt.exam_title}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(attempt.completed_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {attempt.score}/{attempt.total_questions}
                          </p>
                          <p className="text-sm text-gray-600">{attempt.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">Nenhuma prova realizada ainda</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
