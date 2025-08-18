import { type NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Token não encontrado" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { id } = await params
    const attemptId = Number.parseInt(id)

    // Get attempt details with user verification
    const query = `
      SELECT 
        ea.id,
        ea.score,
        ea.total_questions,
        ea.percentage,
        ea.completed_at,
        e.title as exam_title,
        ead.detailed_results
      FROM exam_attempts ea
      JOIN exams e ON ea.exam_id = e.id
      JOIN exam_attempt_details ead ON ea.id = ead.attempt_id
      WHERE ea.id = $1 AND ea.user_id = $2
    `

    const result = await pool.query(query, [attemptId, decoded.userId])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Resultado não encontrado" }, { status: 404 })
    }

    const attemptData = result.rows[0]

    return NextResponse.json({
      attemptId: attemptData.id,
      score: attemptData.score,
      totalQuestions: attemptData.total_questions,
      percentage: attemptData.percentage,
      examTitle: attemptData.exam_title,
      completedAt: attemptData.completed_at,
      detailedResults: attemptData.detailed_results,
    })
  } catch (error) {
    console.error("Get exam attempt details error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
