import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Add export config to specify that this route should be dynamically rendered
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('type') || 'exploration';
    
    const eventPath = path.join(process.cwd(), '..', 'game_logic', 'event_tables', `${eventType}_events.json`);
    
    if (!fs.existsSync(eventPath)) {
      return NextResponse.json({ error: 'Event type not found' }, { status: 404 });
    }
    
    const eventData = fs.readFileSync(eventPath, 'utf8');
    const events = JSON.parse(eventData);
    
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error reading events data:', error);
    return NextResponse.json({ error: 'Failed to load events data' }, { status: 500 });
  }
} 