#!/usr/bin/env python3
import json
import sys
import random

def process_night_actions(game_state):
    """Process night phase actions and return updated game state"""
    
    zombie_spawn_rate = 0.3
    survivor_encounter_rate = 0.1
    resource_spawn_rate = 0.2
    
    city_grid = game_state['cityGrid']
    log = game_state.get('log', [])
    
    new_zombies = 0
    new_survivors = 0
    new_resources = 0
    
    for i, cell in enumerate(city_grid):
        if cell['type'] == 'empty':
            rand = random.random()
            
            if rand < zombie_spawn_rate:
                zombie_types = ['zombie', 'zombieGroup', 'zombieHorde']
                weights = [0.6, 0.3, 0.1]
                selected_type = random.choices(zombie_types, weights=weights)[0]
                city_grid[i]['type'] = selected_type
                new_zombies += 1
            elif rand < zombie_spawn_rate + survivor_encounter_rate:
                city_grid[i]['type'] = 'survivor'
                new_survivors += 1
            elif rand < zombie_spawn_rate + survivor_encounter_rate + resource_spawn_rate:
                city_grid[i]['type'] = 'resource'
                new_resources += 1
    
    if new_zombies > 0:
        log.append(f"Night {game_state['day']}: {new_zombies} zombie{'s' if new_zombies != 1 else ''} appeared in the city")
    if new_survivors > 0:
        log.append(f"Night {game_state['day']}: {new_survivors} survivor{'s' if new_survivors != 1 else ''} emerged from hiding")
    if new_resources > 0:
        log.append(f"Night {game_state['day']}: {new_resources} resource cache{'s' if new_resources != 1 else ''} discovered")
    
    if game_state.get('hasCamp') and game_state.get('campPosition') is not None:
        camp_pos = game_state['campPosition']
        nearby_zombies = 0
        
        adjacent_positions = []
        row = camp_pos // 10
        col = camp_pos % 10
        
        for dr in [-1, 0, 1]:
            for dc in [-1, 0, 1]:
                if dr == 0 and dc == 0:
                    continue
                new_row, new_col = row + dr, col + dc
                if 0 <= new_row < 10 and 0 <= new_col < 10:
                    adjacent_positions.append(new_row * 10 + new_col)
        
        for pos in adjacent_positions:
            if city_grid[pos]['type'] in ['zombie', 'zombieGroup', 'zombieHorde']:
                nearby_zombies += 1
        
        if nearby_zombies > 0:
            defense = game_state.get('campDefense', 0)
            survivors = game_state.get('survivors', 0)
            
            attack_strength = nearby_zombies * random.uniform(0.5, 1.5)
            defense_strength = (defense + survivors) * random.uniform(0.8, 1.2)
            
            if attack_strength > defense_strength:
                casualties = min(survivors, random.randint(1, max(1, nearby_zombies // 2)))
                game_state['survivors'] = max(0, survivors - casualties)
                log.append(f"Night {game_state['day']}: Camp attacked! {casualties} survivor{'s' if casualties != 1 else ''} lost")
            else:
                log.append(f"Night {game_state['day']}: Camp successfully defended against zombie attack!")
    
    game_state['cityGrid'] = city_grid
    game_state['log'] = log[-10:]
    game_state['zombies'] = sum(1 for cell in city_grid if cell['type'] in ['zombie', 'zombieGroup', 'zombieHorde'])
    
    return game_state

if __name__ == "__main__":
    try:
        game_state_str = sys.argv[1]
        game_state = json.loads(game_state_str)
        
        updated_state = process_night_actions(game_state)
        
        print(json.dumps(updated_state))
    except Exception as e:
        error_response = {"error": str(e)}
        print(json.dumps(error_response))
        sys.exit(1)