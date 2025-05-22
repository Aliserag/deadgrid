import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, gameState } = body;

    if (!action || !gameState) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Convert gameState to a string that can be passed as a command line argument
    const gameStateStr = JSON.stringify(gameState);

    // Get the project root directory (one level up from the frontend directory)
    const projectRoot = path.join(process.cwd(), '..');
    
    let scriptPath: string;
    let args: string[];

    switch (action) {
      case 'night_action':
        scriptPath = path.join(projectRoot, 'ai_engine', 'events', 'night_actions.py');
        args = [gameStateStr];
        break;
      case 'story_event':
        scriptPath = path.join(projectRoot, 'ai_engine', 'events', 'story_events.py');
        args = [gameStateStr];
        break;
      case 'update_map':
        scriptPath = path.join(projectRoot, 'ai_engine', 'map_generator.py');
        args = [gameStateStr];
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    console.log('Executing script:', scriptPath);
    console.log('With args:', args);

    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python3', [scriptPath, ...args]);
      let outputData = '';
      let errorData = '';

      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error('Python script error:', errorData);
          resolve(NextResponse.json(
            { error: 'Failed to execute Python script', details: errorData },
            { status: 500 }
          ));
          return;
        }

        try {
          // Try to parse the output as JSON
          const result = JSON.parse(outputData.trim());
          resolve(NextResponse.json(result));
        } catch (error) {
          console.error('JSON parse error:', error);
          console.error('Raw output:', outputData);
          resolve(NextResponse.json(
            { error: 'Invalid JSON response from Python script', details: outputData },
            { status: 500 }
          ));
        }
      });
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 