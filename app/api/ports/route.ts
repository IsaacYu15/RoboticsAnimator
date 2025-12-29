import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET() {
  try {
    const result = await query('SELECT * FROM ports');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to Retrieve ESP32 Port' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { address } = await request.json();
    const result = await query(
      'INSERT INTO ports (address) VALUES ($1) RETURNING *',
      [address]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to Add New ESP32 Port' }, { status: 400 });
  }
}