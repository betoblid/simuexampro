import { type NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { name, email, username, phone, password } = await request.json()

    // Validate required fields
    if (!name || !email || !username || !password) {
      return NextResponse.json({ error: "Todos os campos obrigatórios devem ser preenchidos" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1 OR username = $2", [email, username])

    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: "Email ou nome de usuário já existe" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const result = await pool.query(
      `INSERT INTO users (name, email, username, phone, password_hash) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, username`,
      [name, email, username, phone || null, hashedPassword],
    )

    const user = result.rows[0]

    return NextResponse.json({
      message: "Usuário criado com sucesso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
