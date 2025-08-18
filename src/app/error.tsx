"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Home, RefreshCw, AlertCircle, ArrowLeft } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">ProvaOnline</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => window.history.back()}>
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

      {/* Error Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <Card className="w-full max-w-2xl text-center">
          <CardHeader>
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-yellow-100">
                <AlertCircle className="h-16 w-16 text-yellow-600" />
              </div>
            </div>
            <CardTitle className="text-3xl text-gray-900 mb-2">Oops! Something didn't work.</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              We encountered a technical problem. Don't worry, we are working to resolve it quickly.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === "development" && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
                <h4 className="font-medium text-gray-900 mb-2">Technical Details (Development):</h4>
                <div className="text-sm text-gray-700 font-mono bg-white p-3 rounded border overflow-auto max-h-32">
                  <div className="text-red-600 font-semibold mb-1">Error:</div>
                  {error.message}
                  {error.stack && (
                    <div className="mt-2 text-xs text-gray-500">
                      <div className="font-semibold">Stack Trace:</div>
                      <pre className="whitespace-pre-wrap">{error.stack}</pre>
                    </div>
                  )}
                </div>
                {error.digest && <p className="text-xs text-gray-500 mt-2">Error ID: {error.digest}</p>}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-800 mb-3">Quick Solutions:</h3>
              <ul className="text-sm text-blue-700 space-y-2 text-left">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                 Click on 'Try Again' to reload.
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Check your internet connection
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Clear the browser cache (Ctrl+F5)
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Try accessing in an incognito/private tab.
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button onClick={reset} className="bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>

              <Button variant="outline" onClick={() => window.history.back()} className="bg-transparent">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <Link href="/dashboard">
                <Button variant="outline" className="w-full bg-transparent">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>

            {/* Status Info */}
            <div className="pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">System Status</h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Platform</span>
                      <span className="flex items-center text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Online
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Database</span>
                      <span className="flex items-center text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Connected
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Need help?</h4>
                  <div className="space-y-1">
                    <a
                      href="mailto:suporte@provaonline.com"
                      className="block text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      📧 suporte@provaonline.com
                    </a>
                    <a href="tel:+5511999999999" className="block text-blue-600 hover:text-blue-800 hover:underline">
                      📞 (11) 99999-9999
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2024 ProvaOnline. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
