import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { contentType, gameContext } = req.body;

    // Forward request to our MCP bridge
    const mcpResponse = await fetch('http://localhost:3001/generate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentType,
        prompt: `Generate a ${contentType} for day ${gameContext?.day || 1} of the zombie apocalypse. Context: ${JSON.stringify(gameContext)}`
      })
    });

    if (!mcpResponse.ok) {
      throw new Error('MCP bridge not available');
    }

    const data = await mcpResponse.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate content',
      details: error.message 
    });
  }
} 