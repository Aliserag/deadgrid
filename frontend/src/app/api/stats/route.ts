import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const statsPath = path.join(process.cwd(), '..', 'survivors', 'stats.json');
    const statsData = fs.readFileSync(statsPath, 'utf8');
    const stats = JSON.parse(statsData);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error reading stats data:', error);
    return NextResponse.json({ error: 'Failed to load stats data' }, { status: 500 });
  }
} 