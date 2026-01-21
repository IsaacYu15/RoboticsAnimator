import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function GET() {
  try {
    const result = await query("SELECT * FROM animations");
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to Retrieve Animation" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, duration_s, loop } = await req.json();
    const result = await query(
      "INSERT INTO animations (name, duration_s, loop) VALUES ($1, $2, $3) RETURNING *",
      [name, duration_s, loop],
    );
    console.log(result.rows[0]);
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to Create Animation" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, duration_s, loop } = await req.json();
    const result = await query(
      "UPDATE animations SET name = $1, duration_s = $2, loop = $3 WHERE id = $4 RETURNING *",
      [name, duration_s, loop, id],
    );
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to Update Animation" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await query("DELETE FROM animations WHERE id = $1", [id]);
    return NextResponse.json({ message: "Animation deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to Delete Animation" },
      { status: 500 },
    );
  }
}
