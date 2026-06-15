import { NextResponse } from 'next/server';
// @ts-ignore
import { DatabaseSync } from 'node:sqlite';
import path from 'path';

export const dynamic = 'force-dynamic';

function removeAccents(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toUpperCase();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = (searchParams.get('name') || '').trim();
  const phone = (searchParams.get('phone') || '').trim().replace(/\s+/g, '');
  const code = (searchParams.get('code') || '').trim();
  const dob = (searchParams.get('dob') || '').trim();

  if (!name && !phone && !code && !dob) {
    return NextResponse.json({ records: [] });
  }

  try {
    // Open the SQLite database dynamically based on environment variable or fallback to local
    const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'vaccinations.db');
    const db = new DatabaseSync(dbPath);

    let query = 'SELECT * FROM records WHERE 1=1';
    const params: any[] = [];

    if (name) {
      query += ' AND search_name LIKE ?';
      params.push(`%${removeAccents(name)}%`);
    }
    if (phone) {
      query += ' AND phone LIKE ?';
      params.push(`%${phone}%`);
    }
    if (code) {
      query += ' AND customer_code LIKE ?';
      params.push(`%${code}%`);
    }
    if (dob) {
      query += ' AND dob LIKE ?';
      params.push(`%${dob}%`);
    }

    query += ' ORDER BY vaccination_date DESC, id ASC LIMIT 500';

    const statement = db.prepare(query);
    const rows = statement.all(...params);
    db.close();

    return NextResponse.json({ records: rows });
  } catch (error) {
    console.error('Error querying database:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
