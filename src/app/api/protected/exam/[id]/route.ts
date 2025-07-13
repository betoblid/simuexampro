import { type NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const examId = Number.parseInt(id)

    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Token não encontrado" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Check if user can take exam (subscription and monthly limit)
    const currentDate = new Date()
    const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`

    const userQuery = `
      SELECT 
        u.id,
        sp.max_exams_per_month,
        us.status as subscription_status,
        COALESCE(meu.exams_taken, 0) as exams_taken
      FROM users u
      LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
      LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
      LEFT JOIN monthly_exam_usage meu ON u.id = meu.user_id AND meu.month_year = $2
      WHERE u.id = $1
    `

    const userResult = await pool.query(userQuery, [decoded.userId, monthYear])

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const user = userResult.rows[0]

    // Check subscription and limits
    if (!user.subscription_status || user.subscription_status !== "active") {
      return NextResponse.json({ error: "Assinatura inativa" }, { status: 403 })
    }

    if (user.exams_taken >= user.max_exams_per_month) {
      return NextResponse.json({ error: "Limite mensal de provas atingido" }, { status: 403 })
    }

    // Get exam data
    const examResult = await pool.query(
      "SELECT id, title, description, questions, total_questions FROM exams WHERE id = $1",
      [examId],
    )

    if (examResult.rows.length === 0) {
      return NextResponse.json({ error: "Prova não encontrada" }, { status: 404 })
    }

    return NextResponse.json(examResult.rows[0])
  } catch (error) {
    console.error("Get exam error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
