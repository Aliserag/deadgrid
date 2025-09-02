import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const npcsPath = path.join(process.cwd(), '..', 'game_logic', 'npcs.json');
    const npcsData = fs.readFileSync(npcsPath, 'utf8');
    const npcs = JSON.parse(npcsData);
    
    return NextResponse.json(npcs);
  } catch (error) {
    console.error('Error reading NPCs data:', error);
    return NextResponse.json({ error: 'Failed to load NPCs data' }, { status: 500 });
  }
} 