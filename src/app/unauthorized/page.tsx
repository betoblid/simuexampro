import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Home, Lock, LogIn, UserPlus } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">ProvaOnline</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">
                  <LogIn className="h-4 w-4 mr-2" />
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Cadastrar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Unauthorized Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <Card className="w-full max-w-2xl text-center">
          <CardHeader>
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-red-100">
                <Lock className="h-16 w-16 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-3xl text-gray-900 mb-2">Acesso Negado</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Você precisa estar logado para acessar esta página.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="font-semibold text-red-800 mb-3">Por que estou vendo isso?</h3>
              <ul className="text-sm text-red-700 space-y-2 text-left">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                  Você não está logado no sistema
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                  Sua sessão pode ter expirado
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                  Você não tem permissão para acessar este conteúdo
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>É necessário ter uma assinatura ativa
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/login">
                <Button className="w-full">
                  <LogIn className="h-4 w-4 mr-2" />
                  Fazer Login
                </Button>
              </Link>

              <Link href="/register">
                <Button variant="outline" className="w-full bg-transparent">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Criar Conta
                </Button>
              </Link>
            </div>

            {/* Additional Options */}
            <div className="pt-6 border-t">
              <h4 className="font-medium text-gray-900 mb-4">Outras Opções</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/">
                  <Button variant="outline" className="w-full bg-transparent">
                    <Home className="h-4 w-4 mr-2" />
                    Página Inicial
                  </Button>
                </Link>
                <Link href="/subscription">
                  <Button variant="outline" className="w-full bg-transparent">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Ver Planos
                  </Button>
                </Link>
              </div>
            </div>

            {/* Help Section */}
            <div className="pt-6 border-t">
              <h4 className="font-medium text-gray-900 mb-2">Precisa de Ajuda?</h4>
              <p className="text-sm text-gray-600 mb-4">
                Se você acredita que deveria ter acesso a esta página, entre em contato conosco.
              </p>
              <div className="flex justify-center space-x-4 text-sm">
                <a href="mailto:suporte@provaonline.com" className="text-blue-600 hover:text-blue-800 hover:underline">
                  suporte@provaonline.com
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
  )
}
