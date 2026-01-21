import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const animationId = searchParams.get("animation_id");

    let result;

    if (animationId) {
      result = await query(
        "SELECT * FROM animation_events WHERE animation_id = $1 ORDER BY trigger_time ASC",
        [animationId],
      );
    } else {
      result = await query(
        "SELECT * FROM animation_events ORDER BY animation_id ASC",
      );
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to Retrieve Animation Events" },
      { status: 500 },
    );
  }
}
export async function POST(req: Request) {
  try {
    const { animation_id, component_id, trigger_time, action } =
      await req.json();
    const result = await query(
      "INSERT INTO animation_events (animation_id, component_id, trigger_time, action) VALUES ($1, $2, $3, $4) RETURNING *",
      [animation_id, component_id, trigger_time, action],
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to Create Animation Event" },
      { status: 500 },
    );
  }
}
