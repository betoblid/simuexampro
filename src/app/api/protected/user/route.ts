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

    // Get current month-year for usage tracking
    const currentDate = new Date()
    const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`

    // Get user data with subscription and monthly usage
    const userQuery = `
  SELECT 
    u.id, u.name, u.email, u.username, u.phone,
    sp.name as plan_name, 
    sp.max_exams_per_month,
    us.status as subscription_status,
    us.current_period_start,
    us.current_period_end,
    us.stripe_subscription_id,
    COALESCE(meu.exams_taken, 0) as exams_taken
  FROM users u
  LEFT JOIN user_subscriptions us ON u.id = us.user_id 
    AND us.status IN ('active', 'trialing')
    AND (us.current_period_end IS NULL OR us.current_period_end > NOW())
  LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
  LEFT JOIN monthly_exam_usage meu ON u.id = meu.user_id AND meu.month_year = $2
  WHERE u.id = $1
  ORDER BY us.created_at DESC
  LIMIT 1
`

    const userResult = await pool.query(userQuery, [decoded.userId, monthYear])

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const user = userResult.rows[0]

    // Get recent exam attempts
    const attemptsQuery = `
      SELECT 
        ea.id, e.title as exam_title, ea.score, ea.total_questions, 
        ea.percentage, ea.completed_at
      FROM exam_attempts ea
      JOIN exams e ON ea.exam_id = e.id
      WHERE ea.user_id = $1
      ORDER BY ea.completed_at DESC
      LIMIT 5
    `

    const attemptsResult = await pool.query(attemptsQuery, [decoded.userId])

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      phone: user.phone,
      subscription: user.plan_name
        ? {
            plan_name: user.plan_name,
            max_exams_per_month: user.max_exams_per_month,
            status: user.subscription_status,
            current_period_start: user.current_period_start,
            current_period_end: user.current_period_end,
            stripe_subscription_id: user.stripe_subscription_id,
          }
        : null,
      monthlyUsage: {
        exams_taken: user.exams_taken,
      },
      recentAttempts: attemptsResult.rows,
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}