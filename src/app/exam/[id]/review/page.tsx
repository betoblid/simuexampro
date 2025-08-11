"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Home, RotateCcw, BookOpen, Trophy } from "lucide-react"

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

export default function ExamReviewPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()

  // Get data from URL params
  const score = Number.parseInt(searchParams.get("score") || "0")
  const total = Number.parseInt(searchParams.get("total") || "0")
  const percentage = Number.parseFloat(searchParams.get("percentage") || "0")
  const examTitle = searchParams.get("title") || "Prova"

  // Parse detailed results from URL (in a real app, you might want to fetch this from an API)
  const detailedResultsParam = searchParams.get("results")
  let detailedResults: DetailedResult[] = []

  if (detailedResultsParam) {
    try {
      detailedResults = JSON.parse(decodeURIComponent(detailedResultsParam))
    } catch (error) {
      console.error("Error parsing detailed results:", error)
    }
  }

  const correctAnswers = score
  const incorrectAnswers = total - score

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Revisão da Prova</h1>
                <p className="text-gray-600">{examTitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
              Resumo dos Resultados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{total}</div>
                <div className="text-sm text-gray-600">Total de Questões</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{correctAnswers}</div>
                <div className="text-sm text-gray-600">Acertos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{incorrectAnswers}</div>
                <div className="text-sm text-gray-600">Erros</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{percentage.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Aproveitamento</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Legenda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Sua resposta correta</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                <XCircle className="h-4 w-4 text-red-600" />
                <span>Sua resposta incorreta</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                <CheckCircle className="h-4 w-4 text-white" />
                <span>Resposta correta</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Review */}
        <div className="space-y-8">
          {detailedResults.map((result, index) => (
            <Card key={index} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">Questão {result.questionNumber}</CardTitle>
                  <Badge variant={result.isCorrect ? "default" : "destructive"} className="ml-4">
                    {result.isCorrect ? "Correta" : "Incorreta"}
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
                      <strong>Sua resposta:</strong>{" "}
                      {result.userAnswer
                        ? `${getOptionLabel(result.userAnswer)}) ${result.options[result.userAnswer as keyof typeof result.options]}`
                        : "Não respondida"}
                    </div>
                    <div className="text-sm text-blue-800 mt-1">
                      <strong>Resposta correta:</strong> {getOptionLabel(result.correctAnswer)}){" "}
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
              Voltar ao Dashboard
            </Button>
          </Link>
          <Link href={`/exam/${params.id}`} className="flex-1">
            <Button className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </Link>
          <Link
            href={`/exam/${params.id}/result?score=${score}&total=${total}&percentage=${percentage}`}
            className="flex-1"
          >
            <Button variant="outline" className="w-full bg-transparent">
              <Trophy className="h-4 w-4 mr-2" />
              Ver Resultado
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
