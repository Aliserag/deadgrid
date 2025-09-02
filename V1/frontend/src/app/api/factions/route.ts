import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const factionsPath = path.join(process.cwd(), '..', 'game_logic', 'factions.json');
    const factionsData = fs.readFileSync(factionsPath, 'utf8');
    const factions = JSON.parse(factionsData);
    
    return NextResponse.json(factions);
  } catch (error) {
    console.error('Error reading factions data:', error);
    return NextResponse.json({ error: 'Failed to load factions data' }, { status: 500 });
  }
} 