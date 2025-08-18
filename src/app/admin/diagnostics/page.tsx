"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Database, CreditCard, RefreshCw, Search } from "lucide-react"

interface DiagnosticResult {
  status: string
  message: string
  tables?: string[]
  plansCount?: string
  timestamp?: string
  error?: string
  details?: string
}

interface WebhookDebugResult {
  status: string
  webhookSecret: string
  environmentVariables: Record<string, boolean>
  recentSubscriptions: any[]
  timestamp: string
}

export default function DiagnosticsPage() {
  const [dbStatus, setDbStatus] = useState<DiagnosticResult | null>(null)
  const [webhookStatus, setWebhookStatus] = useState<WebhookDebugResult | null>(null)
  const [userSubscription, setUserSubscription] = useState<any>(null)
  const [userId, setUserId] = useState("")
  const [loading, setLoading] = useState(false)
  const [webhookLoading, setWebhookLoading] = useState(false)
  const [userLoading, setUserLoading] = useState(false)

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

  const testWebhook = async () => {
    setWebhookLoading(true)
    try {
      const response = await fetch("/api/debug/stripe-webhook")
      const data = await response.json()
      setWebhookStatus(data)
    } catch (error) {
      setWebhookStatus({
        status: "error",
        webhookSecret: "Error",
        environmentVariables: {},
        recentSubscriptions: [],
        timestamp: new Date().toISOString(),
      })
    } finally {
      setWebhookLoading(false)
    }
  }

  const checkUserSubscription = async () => {
    if (!userId) return

    setUserLoading(true)
    try {
      const response = await fetch(`/api/debug/user-subscription/${userId}`)
      const data = await response.json()
      setUserSubscription(data)
    } catch (error) {
      setUserSubscription({
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setUserLoading(false)
    }
  }

  useEffect(() => {
    testDatabase()
    testWebhook()
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
      <Badge variant={status === "success" ? "default" : "destructive"}>{status === "success" ? "OK" : "Erro"}</Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
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

                  {dbStatus.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-800 mb-1">Erro:</h4>
                      <p className="text-sm text-red-700">{dbStatus.error}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Clique em "Testar" para verificar a conexão</p>
              )}
            </CardContent>
          </Card>

          {/* Stripe Webhook Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="h-6 w-6 mr-2" />
                  Status do Webhook Stripe
                </div>
                <div className="flex items-center space-x-2">
                  {webhookStatus && getStatusBadge(webhookStatus.status)}
                  <Button variant="outline" size="sm" onClick={testWebhook} disabled={webhookLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${webhookLoading ? "animate-spin" : ""}`} />
                    Verificar
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>Status das configurações do Stripe e assinaturas recentes</CardDescription>
            </CardHeader>
            <CardContent>
              {webhookLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="ml-2">Verificando webhook...</span>
                </div>
              ) : webhookStatus ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Configurações:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Webhook Secret</span>
                          <Badge variant={webhookStatus.webhookSecret === "Configured" ? "default" : "destructive"}>
                            {webhookStatus.webhookSecret}
                          </Badge>
                        </div>
                        {Object.entries(webhookStatus.environmentVariables).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm font-mono">{key}</span>
                            <Badge variant={value ? "default" : "destructive"}>{value ? "OK" : "Missing"}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Assinaturas Recentes:</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {webhookStatus.recentSubscriptions.length > 0 ? (
                          webhookStatus.recentSubscriptions.map((sub, index) => (
                            <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                              <div className="flex justify-between">
                                <span>User: {sub.user_email}</span>
                                <Badge variant={sub.status === "active" ? "default" : "secondary"}>{sub.status}</Badge>
                              </div>
                              <div className="text-xs text-gray-600">
                                {sub.plan_name} - {new Date(sub.created_at).toLocaleDateString("pt-BR")}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">Nenhuma assinatura encontrada</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Clique em "Verificar" para testar o webhook</p>
              )}
            </CardContent>
          </Card>

          {/* User Subscription Checker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-6 w-6 mr-2" />
                Verificar Assinatura do Usuário
              </CardTitle>
              <CardDescription>Digite o ID do usuário para verificar o status da assinatura</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 mb-4">
                <div className="flex-1">
                  <Label htmlFor="userId">ID do Usuário</Label>
                  <Input
                    id="userId"
                    type="number"
                    placeholder="Digite o ID do usuário"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={checkUserSubscription} disabled={userLoading || !userId}>
                    {userLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {userSubscription && (
                <div className="space-y-4">
                  {userSubscription.error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700">{userSubscription.error}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Dados do Usuário:</h4>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          <p>
                            <strong>ID:</strong> {userSubscription.user.id}
                          </p>
                          <p>
                            <strong>Email:</strong> {userSubscription.user.email}
                          </p>
                          <p>
                            <strong>Nome:</strong> {userSubscription.user.name}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Assinatura no Banco:</h4>
                        {userSubscription.database_subscription ? (
                          <div className="bg-gray-50 p-3 rounded text-sm">
                            <p>
                              <strong>Status:</strong>
                              <Badge
                                className="ml-2"
                                variant={
                                  userSubscription.database_subscription.status === "active" ? "default" : "secondary"
                                }
                              >
                                {userSubscription.database_subscription.status}
                              </Badge>
                            </p>
                            <p>
                              <strong>Plano:</strong> {userSubscription.database_subscription.plan_name}
                            </p>
                            <p>
                              <strong>Stripe ID:</strong>{" "}
                              {userSubscription.database_subscription.stripe_subscription_id}
                            </p>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">Nenhuma assinatura encontrada</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                  <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener noreferrer">
                    Webhooks do Stripe
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://dashboard.stripe.com/subscriptions" target="_blank" rel="noopener noreferrer">
                    Assinaturas do Stripe
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
