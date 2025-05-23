# DeadGrid Camp Attack System

The camp attack system in DeadGrid simulates zombie breakins to your camp, creating tense scenarios that require quick decision-making and resource management. Similar to Europa Universalis events, these encounters present multiple options with different success chances and consequences.

## Attack Mechanics

### Triggering Conditions

Camp attacks can trigger when:
- You have established a camp
- There are zombies in the vicinity of your camp
- A random daily chance calculation passes

### Attack Chance Factors

The following factors influence the probability of a camp attack:
- **Zombie Density**: More zombies nearby increases attack chance (+3% per density level)
- **Camp Defense**: Better defenses reduce attack chance (-8% per defense level)
- **Weather Conditions**: Fog (+15%) and storms (+10%) increase attack chances
- **Night Actions**: Setting up guards reduces chances (-20%)
- **Camp Type**: Open camps are more vulnerable (+10%) than building-based camps (-15%)
- **Recent Attacks**: An attack in the last 3 days reduces chances (-25% on day 1, scaling up)

## Attack Types

1. **Small Breach**: A few zombies (1-5) find a weak point in your defenses
   - Low severity, appears from day 1
   - Base chance: 15%

2. **Coordinated Attack**: Multiple zombies (4-12) attack different points simultaneously
   - Medium severity, appears from day 7
   - Base chance: 8%

3. **Horde Siege**: Massive zombie horde (10-30) surrounds and attacks the camp
   - High severity, appears from day 14
   - Base chance: 5%

4. **Stealth Infiltration**: Zombies (2-8) break in silently during the night
   - Medium severity, appears from day 5
   - Base chance: 7%

5. **Desperate Scavengers**: Human raiders attract zombies (3-10) to your camp
   - Medium severity, appears from day 10
   - Base chance: 6%

## Defense Options

Each attack event presents three main defense strategies:

### 1. Fight Back
- **Description**: Engage zombies with weapons to protect your camp
- **Requirements**: 3+ ammo, 2+ survivors
- **Success Factors**: Camp defense level, survivor count, ammo available
- **Base Success Chance**: 70%
- **Consequences**:
  - **Success**: 0-1 casualties, high zombie kills, medium ammo consumption
  - **Failure**: 1-3 casualties, few zombie kills, high ammo consumption, defense damage
  - **Loot**: +20% chance to find items after success

### 2. Barricade
- **Description**: Reinforce weak points and hold out against the attack
- **Requirements**: Building materials, 1+ survivors
- **Success Factors**: Camp defense level, materials used
- **Base Success Chance**: 50%
- **Consequences**:
  - **Success**: No casualties, defense improvement, medium zombie kills
  - **Failure**: 1-2 casualties, defense damage, few zombie kills
  - **Loot**: No bonus

### 3. Evacuate
- **Description**: Abandon camp temporarily and escape with what you can carry
- **Requirements**: 1+ survivors
- **Success Factors**: Camp type (open areas easier to evacuate)
- **Base Success Chance**: 80%
- **Consequences**:
  - **Success**: No casualties, but significant resource loss
  - **Failure**: 1-4 casualties, major resource loss
  - **Loot**: -20% chance to find items

## Resource Impact

Camp attacks can impact:
- **Survivors**: Potential casualties
- **Camp Defense**: Potential damage or improvement
- **Resources**: Food, water, medicine, and ammo loss
- **Loot**: Opportunity to find new items while repelling attacks

## Implementation Details

The attack system is implemented through:
1. `CampAttackSystem` class in `ai_engine/events/camp_attacks.py`
2. Event tables in `game_logic/event_tables/camp_attacks.json`
3. Integration with daily simulation in `ai_engine/generate_day.py`
4. UI handlers in the frontend game component

## Strategy Tips

- **Early Game**: Prioritize building camp defense to reduce attack chances
- **Mid Game**: Balance defense with offensive capabilities (ammo reserves)
- **Late Game**: Consider your camp type - buildings are safer but harder to evacuate
- **Night Actions**: Setting guards significantly reduces attack chances
- **Resource Management**: Keep enough ammo for camp defense
- **Loot Opportunities**: Successfully fighting back gives the best chance for finding loot 