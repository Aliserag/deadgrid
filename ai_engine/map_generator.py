#!/usr/bin/env python3
import json
import sys
import random

def update_map(game_state):
    """Update map based on player actions and time progression"""
    
    city_grid = game_state['cityGrid']
    day = game_state.get('day', 1)
    log = game_state.get('log', [])
    
    zombie_spread_rate = 0.15 + (day * 0.01)
    building_collapse_rate = 0.02
    
    new_grid = city_grid.copy()
    
    for i, cell in enumerate(city_grid):
        if cell['type'] in ['zombie', 'zombieGroup']:
            adjacent_cells = get_adjacent_cells(i, 10)
            
            for adj_idx in adjacent_cells:
                if adj_idx < len(city_grid) and city_grid[adj_idx]['type'] == 'empty':
                    if random.random() < zombie_spread_rate:
                        new_grid[adj_idx] = {'type': 'zombie', 'hasPlayer': False}
        
        elif cell['type'] == 'zombieHorde':
            adjacent_cells = get_adjacent_cells(i, 10)
            
            for adj_idx in adjacent_cells:
                if adj_idx < len(city_grid):
                    if city_grid[adj_idx]['type'] == 'empty' and random.random() < zombie_spread_rate * 2:
                        new_grid[adj_idx] = {'type': 'zombieGroup', 'hasPlayer': False}
                    elif city_grid[adj_idx]['type'] == 'zombie' and random.random() < 0.3:
                        new_grid[adj_idx] = {'type': 'zombieGroup', 'hasPlayer': False}
        
        elif cell['type'] == 'building':
            if random.random() < building_collapse_rate:
                new_grid[i] = {'type': 'empty', 'hasPlayer': cell.get('hasPlayer', False)}
                if i == game_state.get('playerPosition'):
                    log.append(f"Day {day}: The building you're in starts to collapse!")
    
    if day % 7 == 0:
        horde_positions = []
        for _ in range(random.randint(1, 3)):
            pos = random.randint(0, len(city_grid) - 1)
            if city_grid[pos]['type'] == 'empty':
                new_grid[pos] = {'type': 'zombieHorde', 'hasPlayer': False}
                horde_positions.append(pos)
        
        if horde_positions:
            log.append(f"Day {day}: Massive zombie hordes detected in the city!")
    
    if random.random() < 0.1:
        supply_drop_pos = random.randint(0, len(city_grid) - 1)
        if city_grid[supply_drop_pos]['type'] == 'empty':
            new_grid[supply_drop_pos] = {'type': 'resource', 'hasPlayer': False}
            log.append(f"Day {day}: Supply drop spotted in the city!")
    
    game_state['cityGrid'] = new_grid
    game_state['log'] = log[-10:]
    
    return game_state

def get_adjacent_cells(index, grid_size):
    """Get indices of adjacent cells in a square grid"""
    adjacent = []
    row = index // grid_size
    col = index % grid_size
    
    for dr in [-1, 0, 1]:
        for dc in [-1, 0, 1]:
            if dr == 0 and dc == 0:
                continue
            new_row, new_col = row + dr, col + dc
            if 0 <= new_row < grid_size and 0 <= new_col < grid_size:
                adjacent.append(new_row * grid_size + new_col)
    
    return adjacent

if __name__ == "__main__":
    try:
        game_state_str = sys.argv[1]
        game_state = json.loads(game_state_str)
        
        updated_state = update_map(game_state)
        
        print(json.dumps(updated_state))
    except Exception as e:
        error_response = {"error": str(e)}
        print(json.dumps(error_response))
        sys.exit(1)