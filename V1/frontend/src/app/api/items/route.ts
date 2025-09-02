import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const itemsPath = path.join(process.cwd(), '..', 'game_logic', 'loot_database.json');
    const itemsData = fs.readFileSync(itemsPath, 'utf8');
    const items = JSON.parse(itemsData);
    
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error reading items data:', error);
    return NextResponse.json({ error: 'Failed to load items data' }, { status: 500 });
  }
} 