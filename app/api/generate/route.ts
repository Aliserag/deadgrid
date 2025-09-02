import { NextRequest, NextResponse } from 'next/server';
import { DeepSeekClient } from '@/lib/ai/DeepSeekClient';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-88d05991389d45fbaee750ee9724a38c';

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json();
    const client = new DeepSeekClient(DEEPSEEK_API_KEY);
    
    let result;
    switch (type) {
      case 'event':
        result = await client.generateEvent();
        break;
      case 'npc':
        result = await client.generateNPC();
        break;
      case 'quest':
        result = await client.generateQuest();
        break;
      case 'story':
        result = await client.generateStoryArc();
        break;
      case 'location':
        result = await client.generateLocation();
        break;
      case 'weather':
        result = await client.generateWeatherEvent();
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid generation type' },
          { status: 400 }
        );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}