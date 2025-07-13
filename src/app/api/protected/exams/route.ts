import { type NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Token não encontrado" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Get all available exams
    const result = await pool.query(
      "SELECT id, title, description, total_questions FROM exams ORDER BY created_at DESC",
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Get exams error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
