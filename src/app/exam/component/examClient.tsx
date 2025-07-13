"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"


interface Question {
  number: number
  question: string
  options: {
    a: string
    b: string
    c: string
    d: string
  }
  answer: string
}

interface ExamData {
  id: number
  title: string
  description: string
  questions: Question[]
  total_questions: number
}

type PageProps = {
  params: {
    id: string
  }
}

export function ExamClient({ params }: PageProps) {
  const [examData, setExamData] = useState<ExamData | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [examStarted, setExamStarted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchExamData()
  }, [])

  useEffect(() => {
    if (examStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (examStarted && timeLeft === 0) {
      handleSubmit()
    }
  }, [timeLeft, examStarted])

  const fetchExamData = async () => {
    try {
      const response = await fetch(`/api/protected/exam/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setExamData(data)
        setAnswers(new Array(data.questions.length).fill(""))
        // Set timer for 2 hours (7200 seconds)
        setTimeLeft(7200)
      } else {
        const error = await response.json()
        toast( error.error || "Erro ao carregar prova")
        router.push("/dashboard")
      }
    } catch (error) {
      toast( "Erro de conexão")
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = value
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < (examData?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    if (!examData) return

    setSubmitting(true)

    try {
      const response = await fetch(`/api/protected/exam/${params.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(
          `/exam/${params.id}/result?score=${result.score}&total=${result.totalQuestions}&percentage=${result.percentage}`,
        )
      } else {
        const error = await response.json()
        toast( error.error || "Erro ao enviar prova")
      }
    } catch (error) {
      toast("Erro de conexão")
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgress = () => {
    if (!examData) return 0
    return ((currentQuestion + 1) / examData.questions.length) * 100
  }

  const getAnsweredCount = () => {
    return answers.filter((answer) => answer !== "").length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Carregando prova...</p>
        </div>
      </div>
    )
  }

  if (!examData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Prova não encontrada</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button>Voltar ao Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-6 w-6 mr-2" />
              {examData.title}
            </CardTitle>
            <CardDescription>{examData.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{examData.total_questions}</p>
                <p className="text-sm text-gray-600">Questões</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">2:00:00</p>
                <p className="text-sm text-gray-600">Tempo Limite</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">Múltipla</p>
                <p className="text-sm text-gray-600">Escolha</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Instruções:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Você tem 2 horas para completar a prova</li>
                <li>• Cada questão tem apenas uma resposta correta</li>
                <li>• Você pode navegar entre as questões livremente</li>
                <li>• A prova será enviada automaticamente quando o tempo acabar</li>
                <li>• Certifique-se de ter uma conexão estável com a internet</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" className="flex-1 bg-transparent">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <Button onClick={() => setExamStarted(true)} className="flex-1">
                Iniciar Prova
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQ = examData.questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className="text-lg font-semibold">{examData.title}</h1>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                <span className={timeLeft < 600 ? "text-red-600 font-medium" : ""}>{formatTime(timeLeft)}</span>
              </div>
              <div className="text-sm text-gray-600">
                Questão {currentQuestion + 1} de {examData.questions.length}
              </div>
              <div className="text-sm text-gray-600">
                Respondidas: {getAnsweredCount()}/{examData.questions.length}
              </div>
            </div>
          </div>
          <Progress value={getProgress()} className="h-1" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navegação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {examData.questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`
                        w-10 h-10 rounded text-sm font-medium border-2 transition-colors
                        ${
                          currentQuestion === index
                            ? "bg-blue-600 text-white border-blue-600"
                            : answers[index]
                              ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                              : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                        }
                      `}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Questão {currentQ.number}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-lg leading-relaxed">{currentQ.question}</div>

                <RadioGroup value={answers[currentQuestion]} onValueChange={handleAnswerChange} className="space-y-4">
                  {Object.entries(currentQ.options).map(([key, value]) => (
                    <div key={key} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={key} id={`option-${key}`} className="mt-1" />
                      <Label htmlFor={`option-${key}`} className="flex-1 cursor-pointer leading-relaxed">
                        <span className="font-medium mr-2">{key.toUpperCase()})</span>
                        {value}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>

                  <div className="flex space-x-4">
                    {currentQuestion === examData.questions.length - 1 ? (
                      <Button onClick={handleSubmit} disabled={submitting} className="bg-green-600 hover:bg-green-700">
                        {submitting ? "Enviando..." : "Finalizar Prova"}
                      </Button>
                    ) : (
                      <Button onClick={handleNext} disabled={currentQuestion === examData.questions.length - 1}>
                        Próxima
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
