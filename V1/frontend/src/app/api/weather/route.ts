import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const weatherPath = path.join(process.cwd(), '..', 'game_logic', 'weather.json');
    const weatherData = fs.readFileSync(weatherPath, 'utf8');
    const weather = JSON.parse(weatherData);
    
    return NextResponse.json(weather);
  } catch (error) {
    console.error('Error reading weather data:', error);
    return NextResponse.json({ error: 'Failed to load weather data' }, { status: 500 });
  }
} 