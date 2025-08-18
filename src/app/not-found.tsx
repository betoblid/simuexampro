"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Home, Search, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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

      {/* 404 Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <Card className="w-full max-w-2xl text-center">
          <CardHeader>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="text-9xl font-bold text-blue-100 select-none">404</div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Search className="h-16 w-16 text-blue-400" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl text-gray-900 mb-2">Página Não Encontrada</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Ops! A página que você está procurando não existe ou foi movida.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-800 mb-3">O que você pode fazer:</h3>
              <ul className="text-sm text-blue-700 space-y-2 text-left">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Verificar se o endereço foi digitado corretamente
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Voltar à página inicial e navegar novamente
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Acessar seu dashboard para ver as provas disponíveis
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Entrar em contato conosco se o problema persistir
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => window.history.back()} className="bg-transparent">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>

              <Link href="/">
                <Button variant="outline" className="w-full bg-transparent">
                  <Home className="h-4 w-4 mr-2" />
                  Página Inicial
                </Button>
              </Link>

              <Link href="/dashboard">
                <Button className="w-full">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>

            {/* Popular Links */}
            <div className="pt-6 border-t">
              <h4 className="font-medium text-gray-900 mb-4">Links Populares</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Link href="/subscription" className="text-blue-600 hover:text-blue-800 hover:underline">
                  Planos de Assinatura
                </Link>
                <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 hover:underline">
                  Minhas Provas
                </Link>
                <Link href="/login" className="text-blue-600 hover:text-blue-800 hover:underline">
                  Fazer Login
                </Link>
                <Link href="/register" className="text-blue-600 hover:text-blue-800 hover:underline">
                  Criar Conta
                </Link>
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
  )
}
