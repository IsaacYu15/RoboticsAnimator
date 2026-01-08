import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function GET() {
  try {
    const result = await query("SELECT * FROM components");
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to Retrieve Module" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, type, pin } = await request.json();
    const result = await query(
      "UPDATE components SET type = $1, pin = $2 WHERE id = $3 RETURNING *",
      [type, pin, id]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to Update Module" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { type, pin, x, y } = await request.json();
    const result = await query(
      "INSERT INTO components (type, pin, x, y) VALUES ($1, $2, $3, $4) RETURNING *",
      [type, pin, x, y]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to Add New Module" },
      { status: 400 }
    );
  }
}
