import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { action, gameState } = await request.json();

    switch (action) {
      case 'generateNightEvent':
        // Call the event generator
        const { stdout: eventOutput } = await execAsync('python3 ../ai_engine/event_generator.py --type night');
        const event = JSON.parse(eventOutput);

        // Call the weather generator
        const { stdout: weatherOutput } = await execAsync('python3 ../ai_engine/weather_generator.py');
        const weather = JSON.parse(weatherOutput);

        // Call the economy generator for resource updates
        const { stdout: economyOutput } = await execAsync('python3 ../ai_engine/economy_generator.py --day ' + gameState.day);
        const economy = JSON.parse(economyOutput);

        return NextResponse.json({
          event,
          weather,
          economy,
        });

      case 'generateDay':
        // Call the day generator
        const { stdout: dayOutput } = await execAsync('python3 ../ai_engine/generate_day.py --day ' + gameState.day);
        const dayEvents = JSON.parse(dayOutput);

        return NextResponse.json({
          dayEvents,
        });

      case 'updateMap':
        // Call the map generator
        const { stdout: mapOutput } = await execAsync('python3 ../ai_engine/map_generator.py --day ' + gameState.day);
        const mapUpdate = JSON.parse(mapOutput);

        return NextResponse.json({
          mapUpdate,
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 