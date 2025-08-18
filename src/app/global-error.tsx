"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Home, RefreshCw, AlertTriangle } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
          {/* Header */}
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <Link href="/" className="flex items-center">
                  <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                  <h1 className="text-2xl font-bold text-gray-900">ProvaOnline</h1>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost">
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          {/* Error Content */}
          <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
            <Card className="w-full max-w-2xl text-center">
              <CardHeader>
                <div className="flex justify-center mb-6">
                  <div className="p-4 rounded-full bg-red-100">
                    <AlertTriangle className="h-16 w-16 text-red-600" />
                  </div>
                </div>
                <CardTitle className="text-3xl text-gray-900 mb-2">Algo deu errado!</CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver o problema.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Error Details (only in development) */}
                {process.env.NODE_ENV === "development" && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
                    <h4 className="font-medium text-gray-900 mb-2">Detalhes do Erro (Desenvolvimento):</h4>
                    <div className="text-sm text-gray-700 font-mono bg-white p-3 rounded border overflow-auto max-h-32">
                      {error.message}
                    </div>
                    {error.digest && <p className="text-xs text-gray-500 mt-2">Error ID: {error.digest}</p>}
                  </div>
                )}

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <h3 className="font-semibold text-orange-800 mb-3">O que você pode fazer:</h3>
                  <ul className="text-sm text-orange-700 space-y-2 text-left">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                      Tentar recarregar a página
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                      Verificar sua conexão com a internet
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                      Voltar à página inicial e tentar novamente
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                      Aguardar alguns minutos e tentar novamente
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button onClick={reset} variant="outline" className="bg-transparent">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar Novamente
                  </Button>

                  <Link href="/">
                    <Button className="w-full">
                      <Home className="h-4 w-4 mr-2" />
                      Página Inicial
                    </Button>
                  </Link>
                </div>

                {/* Support Info */}
                <div className="pt-6 border-t">
                  <h4 className="font-medium text-gray-900 mb-2">Precisa de Ajuda?</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Se o problema persistir, entre em contato com nosso suporte técnico.
                  </p>
                  <div className="flex justify-center space-x-4 text-sm">
                    <a
                      href="mailto:suporte@provaonline.com"
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      suporte@simuexampro.com
                    </a>
                    <span className="text-gray-400">|</span>
                    <a href="tel:+5511999999999" className="text-blue-600 hover:text-blue-800 hover:underline">
                      (11) 99999-9999
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <footer className="bg-white border-t mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="text-center text-gray-500 text-sm">
                <p>© 2024 ProvaOnline. Todos os direitos reservados.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
