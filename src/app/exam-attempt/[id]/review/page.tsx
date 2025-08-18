"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Home, BookOpen, Trophy, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

interface DetailedResult {
  questionNumber: number
  question: string
  options: {
    a: string
    b: string
    c: string
    d: string
  }
  userAnswer: string | null
  correctAnswer: string
  isCorrect: boolean
}

interface AttemptData {
  attemptId: number
  score: number
  totalQuestions: number
  percentage: number
  examTitle: string
  completedAt: string
  detailedResults: DetailedResult[]
}

export default function ExamAttemptReviewPage() {
  const [attemptData, setAttemptData] = useState<AttemptData | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    fetchAttemptData()
  }, [])

  const fetchAttemptData = async () => {
    try {
      const response = await fetch(`/api/protected/exam-attempt/${params.id}/details`)

      if (response.ok) {
        const data = await response.json()
        setAttemptData(data)
      } else {
        const error = await response.json()
        toast( error.error || "Erro ao carregar dados da prova")
        router.push("/dashboard")
      }
    } catch (error) {
      toast("Erro de conexão")
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const getOptionLabel = (key: string) => {
    return key.toUpperCase()
  }

  const getOptionClassName = (optionKey: string, question: DetailedResult) => {
    const baseClasses = "flex items-start space-x-3 p-4 border rounded-lg transition-colors"

    // User's answer
    if (question.userAnswer === optionKey) {
      if (question.isCorrect) {
        // User got it right
        return `${baseClasses} bg-green-100 border-green-300 text-green-800`
      } else {
        // User got it wrong
        return `${baseClasses} bg-red-100 border-red-300 text-red-800`
      }
    }

    // Correct answer (when user got it wrong)
    if (!question.isCorrect && question.correctAnswer === optionKey) {
      return `${baseClasses} bg-green-600 border-green-600 text-white font-medium`
    }

    // Other options
    return `${baseClasses} bg-gray-50 border-gray-200 text-gray-600`
  }

  const getOptionIcon = (optionKey: string, question: DetailedResult) => {
    if (question.userAnswer === optionKey) {
      return question.isCorrect ? (
        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
      ) : (
        <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
      )
    }

    if (!question.isCorrect && question.correctAnswer === optionKey) {
      return <CheckCircle className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
    }

    return <div className="h-5 w-5 mt-0.5 flex-shrink-0" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading Review...</p>
        </div>
      </div>
    )
  }

  if (!attemptData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Data not found</CardTitle>
            <CardDescription>It was not possible to load the exam data.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const correctAnswers = attemptData.score
  const incorrectAnswers = attemptData.totalQuestions - attemptData.score

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Review of the Exam</h1>
                <p className="text-gray-600">{attemptData.examTitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Link href="/dashboard">
                <Button variant="ghost">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-6 w-6 mr-2 text-blue-600" />
              Summary of Results
            </CardTitle>
            <CardDescription>
              Test conducted on{" "}
              {new Date(attemptData.completedAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{attemptData.totalQuestions}</div>
                <div className="text-sm text-gray-600">Total number of questions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{correctAnswers}</div>
                <div className="text-sm text-gray-600">Hits</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{incorrectAnswers}</div>
                <div className="text-sm text-gray-600">Errors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{Number(attemptData.percentage).toFixed(1)}%</div>
                <div className="text-sm text-gray-600">harnessing</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Your correct answer</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                <XCircle className="h-4 w-4 text-red-600" />
                <span>Your answer is incorrect</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                <CheckCircle className="h-4 w-4 text-white" />
                <span>Correct answer</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Review */}
        <div className="space-y-8">
          {attemptData.detailedResults.map((result, index) => (
            <Card key={index} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">Question {result.questionNumber}</CardTitle>
                  <Badge variant={result.isCorrect ? "default" : "destructive"} className="ml-4">
                    {result.isCorrect ? "Correct" : "Incorrect"}
                  </Badge>
                </div>
                <CardDescription className="text-base leading-relaxed text-gray-900">{result.question}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(result.options).map(([key, value]) => (
                    <div key={key} className={getOptionClassName(key, result)}>
                      {getOptionIcon(key, result)}
                      <div className="flex-1">
                        <span className="font-medium mr-2">{getOptionLabel(key)})</span>
                        <span>{value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional info for incorrect answers */}
                {!result.isCorrect && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <strong>Your answer:</strong>{" "}
                      {result.userAnswer
                        ? `${getOptionLabel(result.userAnswer)}) ${result.options[result.userAnswer as keyof typeof result.options]}`
                        : "Não respondida"}
                    </div>
                    <div className="text-sm text-blue-800 mt-1">
                      <strong>Correct answer:</strong> {getOptionLabel(result.correctAnswer)}){" "}
                      {result.options[result.correctAnswer as keyof typeof result.options]}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              <Home className="h-4 w-4 mr-2" />
             Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
