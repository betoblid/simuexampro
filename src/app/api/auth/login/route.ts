import { type NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { verifyPassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    // Find user
    const result = await pool.query("SELECT id, name, email, username, password_hash FROM users WHERE email = $1", [
      email,
    ])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    const user = result.rows[0]

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    // Generate token
    const token = generateToken(user.id)

    // Create response
    const response = NextResponse.json({
      message: "Login realizado com sucesso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
      },
    })

    // Set cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
