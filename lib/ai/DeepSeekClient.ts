interface DeepSeekRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' };
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class DeepSeekClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.deepseek.com/v1';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async generateContent<T>(
    systemPrompt: string,
    userPrompt: string,
    responseFormat: 'json' | 'text' = 'json'
  ): Promise<T> {
    const request: DeepSeekRequest = {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 2000
    };
    
    if (responseFormat === 'json') {
      request.response_format = { type: 'json_object' };
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }
      
      const data: DeepSeekResponse = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content in DeepSeek response');
      }
      
      if (responseFormat === 'json') {
        return JSON.parse(content) as T;
      }
      
      return content as T;
    } catch (error) {
      console.error('DeepSeek API error:', error);
      throw error;
    }
  }
  
  async generateEvent() {
    const systemPrompt = `You are a creative AI generating dynamic events for a post-apocalyptic zombie survival game.
    Generate unique, immersive events that fit the dark, desperate atmosphere.
    Include meaningful choices with consequences.
    Return a JSON object with the following structure:
    {
      "title": "Event Title",
      "description": "Detailed event description",
      "choices": [
        {
          "text": "Choice text",
          "requirements": { "items": [], "skills": [] },
          "outcomes": {
            "success": { "description": "What happens on success", "effects": {} },
            "failure": { "description": "What happens on failure", "effects": {} }
          }
        }
      ],
      "rarity": "common|uncommon|rare",
      "tags": ["exploration", "combat", "social", etc]
    }`;
    
    const userPrompt = `Generate a unique random event for a zombie survival game. 
    Make it atmospheric and challenging. The event should present meaningful choices to the player.`;
    
    return this.generateContent(systemPrompt, userPrompt, 'json');
  }
  
  async generateNPC() {
    const systemPrompt = `You are creating NPCs for a post-apocalyptic zombie survival game.
    Generate unique survivors with personalities, backstories, and motivations.
    Return a JSON object with:
    {
      "name": "NPC Name",
      "description": "Physical description and demeanor",
      "backstory": "Brief backstory",
      "faction": "SURVIVORS|RAIDERS|TRADERS|MILITARY|CANNIBALS|INDEPENDENT",
      "personality": {
        "traits": ["trait1", "trait2"],
        "alignment": "friendly|neutral|hostile",
        "trust": 0
      },
      "dialogue": {
        "greeting": "Initial greeting",
        "trade": "Trade dialogue",
        "hostile": "Hostile dialogue"
      },
      "inventory": [],
      "skills": []
    }`;
    
    const userPrompt = `Generate a unique NPC survivor with interesting personality and backstory.`;
    
    return this.generateContent(systemPrompt, userPrompt, 'json');
  }
  
  async generateQuest() {
    const systemPrompt = `You are creating quests for a post-apocalyptic zombie survival game.
    Generate engaging quests with clear objectives and meaningful rewards.
    Return a JSON object with:
    {
      "title": "Quest Title",
      "description": "Quest description",
      "giver": "Quest giver name or null",
      "objectives": [
        {
          "description": "Objective description",
          "type": "kill|collect|deliver|explore|survive",
          "target": "target description",
          "quantity": 1
        }
      ],
      "rewards": {
        "items": [],
        "experience": 0,
        "reputation": {}
      },
      "dialogue": {
        "start": "Quest start dialogue",
        "progress": "In-progress dialogue",
        "complete": "Completion dialogue"
      }
    }`;
    
    const userPrompt = `Generate an interesting quest that fits the zombie apocalypse setting.`;
    
    return this.generateContent(systemPrompt, userPrompt, 'json');
  }
  
  async generateStoryArc() {
    const systemPrompt = `You are creating story arcs for a post-apocalyptic zombie survival game.
    Generate compelling multi-part storylines that evolve over time.
    Return a JSON object with:
    {
      "title": "Story Arc Title",
      "description": "Overall arc description",
      "chapters": [
        {
          "title": "Chapter Title",
          "description": "Chapter description",
          "events": [],
          "conditions": {
            "day": 0,
            "requirements": []
          }
        }
      ],
      "themes": ["survival", "betrayal", "hope", etc],
      "duration": "short|medium|long"
    }`;
    
    const userPrompt = `Generate a compelling story arc about survival in the zombie apocalypse.`;
    
    return this.generateContent(systemPrompt, userPrompt, 'json');
  }
  
  async generateLocation() {
    const systemPrompt = `You are creating locations for a post-apocalyptic zombie survival game.
    Generate atmospheric locations with loot possibilities and dangers.
    Return a JSON object with:
    {
      "name": "Location Name",
      "type": "building|camp|landmark|settlement",
      "description": "Atmospheric description",
      "danger_level": "safe|low|medium|high|extreme",
      "loot_tier": "poor|common|uncommon|rare",
      "features": ["feature1", "feature2"],
      "encounters": {
        "zombies": { "chance": 0.5, "types": ["single", "group"] },
        "npcs": { "chance": 0.3, "factions": [] },
        "events": { "chance": 0.2 }
      }
    }`;
    
    const userPrompt = `Generate an interesting location for exploration in the zombie apocalypse.`;
    
    return this.generateContent(systemPrompt, userPrompt, 'json');
  }
  
  async generateWeatherEvent() {
    const systemPrompt = `You are creating weather events for a post-apocalyptic game.
    Generate atmospheric weather that affects gameplay.
    Return a JSON object with:
    {
      "type": "clear|rain|fog|storm|snow|ash_fall|acid_rain",
      "description": "Atmospheric description",
      "duration": 1-24 (hours),
      "effects": {
        "visibility": 0.1-1.0,
        "movement_speed": 0.1-1.0,
        "zombie_spawn_rate": 0.5-2.0,
        "health_drain": 0-5 per hour
      },
      "special_events": []
    }`;
    
    const userPrompt = `Generate a weather event that creates interesting gameplay challenges.`;
    
    return this.generateContent(systemPrompt, userPrompt, 'json');
  }
}