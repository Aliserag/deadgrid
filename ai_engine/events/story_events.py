#!/usr/bin/env python3
import json
import sys
import random

def generate_story_event(game_state):
    """Generate dynamic story events based on game state"""
    
    events = []
    
    basic_events = [
        {
            "title": "Distant Gunfire",
            "description": "You hear gunshots echoing from the north. Someone else is still fighting.",
            "choices": [
                {"text": "Investigate", "effect": {"log": "You move toward the sound cautiously"}},
                {"text": "Stay hidden", "effect": {"log": "You decide it's safer to avoid conflict"}}
            ]
        },
        {
            "title": "Radio Static",
            "description": "Your radio crackles to life with a distorted message: '...survivors...safe zone...west...'",
            "choices": [
                {"text": "Head west", "effect": {"log": "You decide to search for the safe zone"}},
                {"text": "Ignore it", "effect": {"log": "Could be a trap. You stay put"}}
            ]
        },
        {
            "title": "Strange Noise",
            "description": "You hear an unusual groaning sound nearby. It doesn't sound like zombies.",
            "choices": [
                {"text": "Investigate", "effect": {"log": "You carefully approach the source"}},
                {"text": "Leave area", "effect": {"log": "Better safe than sorry"}}
            ]
        }
    ]
    
    camp_events = [
        {
            "title": "Survivor at the Gates",
            "description": "A desperate survivor begs to join your camp. They look exhausted but could be useful.",
            "choices": [
                {"text": "Accept them", "effect": {"survivors": 1, "resources": {"food": -2}}},
                {"text": "Turn them away", "effect": {"log": "You can't afford more mouths to feed"}}
            ]
        },
        {
            "title": "Food Spoilage",
            "description": "Some of your food supplies have gone bad due to poor storage.",
            "choices": [
                {"text": "Salvage what you can", "effect": {"resources": {"food": -3}}},
                {"text": "Risk eating it", "effect": {"resources": {"medicine": -2}}}
            ]
        }
    ]
    
    low_resource_events = [
        {
            "title": "Desperate Times",
            "description": "Your supplies are running dangerously low. You spot a well-guarded cache nearby.",
            "choices": [
                {"text": "Attempt to steal", "effect": {"resources": {"food": 5, "water": 3}, "factionReputation": {"Raiders": -10}}},
                {"text": "Try to trade", "effect": {"resources": {"ammo": -2, "food": 3}}}
            ]
        }
    ]
    
    if game_state.get('hasCamp'):
        if random.random() < 0.3:
            events.extend(camp_events)
    
    resources = game_state.get('resources', {})
    if resources.get('food', 0) < 5 or resources.get('water', 0) < 5:
        if random.random() < 0.4:
            events.extend(low_resource_events)
    
    events.extend(basic_events)
    
    if events:
        selected_event = random.choice(events)
        return {"event": selected_event}
    
    return {"event": None}

if __name__ == "__main__":
    try:
        game_state_str = sys.argv[1]
        game_state = json.loads(game_state_str)
        
        result = generate_story_event(game_state)
        
        print(json.dumps(result))
    except Exception as e:
        error_response = {"error": str(e)}
        print(json.dumps(error_response))
        sys.exit(1)