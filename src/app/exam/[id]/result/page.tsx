"use client"

import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, CheckCircle, XCircle, Home, RotateCcw, Eye } from "lucide-react"

export default function ExamResultPage() {
  const searchParams = useSearchParams()
  const params = useParams()
  const attemptId = searchParams.get("attemptId")
  const score = Number.parseInt(searchParams.get("score") || "0")
  const total = Number.parseInt(searchParams.get("total") || "0")
  const percentage = Number.parseFloat(searchParams.get("percentage") || "0")
  const examTitle = searchParams.get("title") || "Prova"

  const getPerformanceColor = () => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getPerformanceMessage = () => {
    if (percentage >= 80) return "Excelente desempenho!"
    if (percentage >= 60) return "Bom desempenho!"
    return "Continue estudando!"
  }

  const getGradeColor = () => {
    if (percentage >= 80) return "bg-green-100 border-green-300"
    if (percentage >= 60) return "bg-yellow-100 border-yellow-300"
    return "bg-red-100 border-red-300"
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-full ${getGradeColor()}`}>
              <Trophy className={`h-12 w-12 ${getPerformanceColor()}`} />
            </div>
          </div>
          <CardTitle className="text-2xl">Resultado da Prova</CardTitle>
          <CardDescription>Confira seu desempenho na prova realizada</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="text-center space-y-4">
            <div className={`text-6xl font-bold ${getPerformanceColor()}`}>{percentage.toFixed(1)}%</div>
            <p className={`text-xl font-medium ${getPerformanceColor()}`}>{getPerformanceMessage()}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progresso</span>
              <span>
                {score} de {total} questões corretas
              </span>
            </div>
            <Progress value={percentage} className="h-3" />
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">{score}</p>
              <p className="text-sm text-gray-600">Acertos</p>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">{total - score}</p>
              <p className="text-sm text-gray-600">Erros</p>
            </div>
          </div>

          {/* Performance Analysis */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Análise de Desempenho</h4>
            <div className="text-sm text-blue-700 space-y-1">
              {percentage >= 80 && <p>• Parabéns! Você demonstrou excelente conhecimento na área.</p>}
              {percentage >= 60 && percentage < 80 && (
                <p>• Bom trabalho! Continue estudando para melhorar ainda mais.</p>
              )}
              {percentage < 60 && <p>• Recomendamos revisar o conteúdo e fazer mais exercícios.</p>}
              <p>
                • Sua pontuação foi de {score} acertos em {total} questões.
              </p>
              <p>• Continue praticando para aprimorar seus conhecimentos.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/dashboard">
              <Button variant="outline" className="w-full bg-transparent">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>

            {attemptId && (
              <Link href={`/exam-attempt/${attemptId}/review`}>
                <Button variant="outline" className="w-full bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                  <Eye className="h-4 w-4 mr-2" />
                  Revisar Respostas
                </Button>
              </Link>
            )}

            <Link href={`/exam/${params.id}`}>
              <Button className="w-full">
                <RotateCcw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </Link>
          </div>

          {/* Share Results */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">Compartilhe seu resultado</p>
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const text = `Acabei de fazer uma prova no ProvaOnline e consegui ${percentage.toFixed(1)}% de aproveitamento! 🎉`
                  navigator.clipboard.writeText(text)
                }}
              >
                Copiar Resultado
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
