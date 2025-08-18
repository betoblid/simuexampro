import { NextResponse } from "next/server"
import { pool, testConnection } from "@/lib/db"

export async function GET() {
  try {
    // Test basic connection
    const connectionTest = await testConnection()

    if (!connectionTest) {
      return NextResponse.json(
        {
          error: "Failed to connect to database",
          status: "error",
        },
        { status: 500 },
      )
    }

    // Test table existence
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `

    const tablesResult = await pool.query(tablesQuery)

    // Test subscription plans
    const plansResult = await pool.query("SELECT COUNT(*) as count FROM subscription_plans")

    return NextResponse.json({
      status: "success",
      message: "Database connection successful",
      tables: tablesResult.rows.map((row) => row.table_name),
      plansCount: plansResult.rows[0].count,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      {
        error: "Database test failed",
        details: error instanceof Error ? error.message : "Unknown error",
        status: "error",
      },
      { status: 500 },
    )
  }
}
