import { type NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const examId = Number.parseInt(id)

    const { answers } = await request.json()

    // Get exam data
    const examResult = await pool.query("SELECT id, title, questions, total_questions FROM exams WHERE id = $1", [
      examId,
    ])

    if (examResult.rows.length === 0) {
      return NextResponse.json({ error: "Prova não encontrada" }, { status: 404 })
    }

    const exam = examResult.rows[0]
    const questions = exam.questions

    // Calculate score and create detailed results
    let score = 0
    const detailedResults = []

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      const userAnswer = answers[i] || null
      const isCorrect = userAnswer === question.answer

      if (isCorrect) {
        score++
      }

      detailedResults.push({
        questionNumber: question.number,
        question: question.question,
        options: question.options,
        userAnswer,
        correctAnswer: question.answer,
        isCorrect,
      })
    }

    const percentage = (score / exam.total_questions) * 100

    // Save exam attempt
    const currentDate = new Date()
    const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`

    await pool.query("BEGIN")

    try {
      // Insert exam attempt
      const attemptResult = await pool.query(
        `INSERT INTO exam_attempts (user_id, exam_id, answers, score, total_questions, percentage, month_year)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [decoded.userId, examId, JSON.stringify(answers), score, exam.total_questions, percentage, monthYear],
      )

      const attemptId = attemptResult.rows[0].id

      // Insert detailed results
      await pool.query(
        `INSERT INTO exam_attempt_details (attempt_id, detailed_results)
         VALUES ($1, $2)`,
        [attemptId, JSON.stringify(detailedResults)],
      )

      // Update monthly usage
      await pool.query(
        `INSERT INTO monthly_exam_usage (user_id, month_year, exams_taken)
         VALUES ($1, $2, 1)
         ON CONFLICT (user_id, month_year)
         DO UPDATE SET exams_taken = monthly_exam_usage.exams_taken + 1, updated_at = CURRENT_TIMESTAMP`,
        [decoded.userId, monthYear],
      )

      await pool.query("COMMIT")

      return NextResponse.json({
        attemptId,
        score,
        totalQuestions: exam.total_questions,
        percentage: Number.parseFloat(percentage.toFixed(2)),
        examTitle: exam.title,
      })
    } catch (error) {
      await pool.query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Submit exam error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
