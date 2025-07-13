"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Database, CreditCard, RefreshCw } from "lucide-react"

interface DiagnosticResult {
  status: string
  message: string
  tables?: string[]
  plansCount?: string
  timestamp?: string
  error?: string
  details?: string
}

export default function DiagnosticsPage() {
  const [dbStatus, setDbStatus] = useState<DiagnosticResult | null>(null)
  const [loading, setLoading] = useState(false)

  const testDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-db")
      const data = await response.json()
      setDbStatus(data)
    } catch (error) {
      setDbStatus({
        status: "error",
        message: "Failed to test database connection",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testDatabase()
  }, [])

  const getStatusIcon = (status: string) => {
    return status === "success" ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    )
  }

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "success" ? "default" : "destructive"}>
        {status === "success" ? "Conectado" : "Erro"}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Diagnóstico do Sistema</h1>
          <p className="text-gray-600">Verifique o status das conexões e configurações</p>
        </div>

        <div className="grid gap-6">
          {/* Database Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Database className="h-6 w-6 mr-2" />
                  Conexão com Banco de Dados
                </div>
                <div className="flex items-center space-x-2">
                  {dbStatus && getStatusBadge(dbStatus.status)}
                  <Button variant="outline" size="sm" onClick={testDatabase} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Testar
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>Status da conexão com PostgreSQL e estrutura das tabelas</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="ml-2">Testando conexão...</span>
                </div>
              ) : dbStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center">
                    {getStatusIcon(dbStatus.status)}
                    <span className="ml-2 font-medium">{dbStatus.message}</span>
                  </div>

                  {dbStatus.status === "success" && dbStatus.tables && (
                    <div>
                      <h4 className="font-medium mb-2">Tabelas Encontradas:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {dbStatus.tables.map((table) => (
                          <Badge key={table} variant="outline">
                            {table}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {dbStatus.status === "success" && dbStatus.plansCount && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Planos de assinatura cadastrados: <strong>{dbStatus.plansCount}</strong>
                      </p>
                    </div>
                  )}

                  {dbStatus.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-800 mb-1">Erro:</h4>
                      <p className="text-sm text-red-700">{dbStatus.error}</p>
                      {dbStatus.details && <p className="text-xs text-red-600 mt-2">{dbStatus.details}</p>}
                    </div>
                  )}

                  {dbStatus.timestamp && (
                    <p className="text-xs text-gray-500">
                      Último teste: {new Date(dbStatus.timestamp).toLocaleString("pt-BR")}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Clique em "Testar" para verificar a conexão</p>
              )}
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-6 w-6 mr-2" />
                Variáveis de Ambiente
              </CardTitle>
              <CardDescription>Status das configurações necessárias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "DATABASE_URL", value: process.env.DATABASE_URL },
                  { name: "STRIPE_SECRET_KEY", value: process.env.STRIPE_SECRET_KEY },
                  { name: "STRIPE_PRICE_ID_JUNIOR", value: process.env.STRIPE_PRICE_ID_JUNIOR },
                  { name: "STRIPE_PRICE_ID_PLENO", value: process.env.STRIPE_PRICE_ID_PLENO },
                  { name: "STRIPE_PRICE_ID_SENIOR", value: process.env.STRIPE_PRICE_ID_SENIOR },
                  { name: "JWT_SECRET", value: process.env.JWT_SECRET },
                  { name: "NEXT_PUBLIC_BASE_URL", value: process.env.NEXT_PUBLIC_BASE_URL },
                ].map((env) => (
                  <div key={env.name} className="flex items-center justify-between">
                    <span className="font-mono text-sm">{env.name}</span>
                    <div className="flex items-center">
                      {env.value ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <Badge variant="outline">Configurado</Badge>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500 mr-2" />
                          <Badge variant="destructive">Não configurado</Badge>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Links úteis para configuração e administração</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" asChild>
                  <a href="/dashboard" target="_blank" rel="noreferrer">
                    Acessar Dashboard
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/subscription" target="_blank" rel="noreferrer">
                    Página de Assinaturas
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/api/test-db" target="_blank" rel="noreferrer">
                    API de Teste do Banco
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer">
                    Dashboard do Stripe
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
