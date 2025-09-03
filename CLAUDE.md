# DeadGrid - Post-Apocalyptic Zombie Survival Game

## 🎮 Game Overview
DeadGrid is a turn-based zombie survival game with procedural generation, base building, and dark post-apocalyptic aesthetics inspired by "This War of Mine". Players navigate through a desolate world, manage resources, build camps, interact with NPCs, and survive against increasingly difficult zombie threats.

## 🛠️ Tech Stack
- **Frontend**: Next.js 15.5.2 with TypeScript
- **Game Engine**: Phaser 3 (best for AI-generated content and procedural generation)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **AI**: DeepSeek API for procedural content generation
- **Backend**: Python scripts for AI-driven events
- **Future**: Chainlink VRF for randomness, NFT characters

## 🎯 Core Game Modes

### 1. Solo Mode (Exploration)
- **Turn-based movement** on a procedurally generated map
- **Visibility system**: Fog of war reveals areas as you explore
- **Zombie spawning**: 
  - Single zombies (common)
  - Zombie groups (uncommon) 
  - Zombie hordes/swarms (rare)
- **Detection mechanics**: Distance-based probability of zombie detection
- **Resource scavenging**: Search buildings and locations for loot

### 2. Camp Mode (Base Building)
- **Two camp types**:
  - Open/Forest camps (easier to flee, lower defense)
  - Building camps (harder to flee, higher defense)
- **Base development**: Progressive upgrades and fortifications
- **Siege mechanics**: Defend against zombie attacks
- **Resource management**: Food, water, medicine, ammunition, materials
- **NPC recruitment**: Build a community of survivors

## 🧟 Zombie Mechanics

### Types
1. **Walker** (Single)
   - Health: 20 HP
   - Speed: Slow
   - Damage: 5-10
   - Detection range: 3 tiles
   - Loot: Common items

2. **Runner Group** (2-5 zombies)
   - Health: 15 HP each
   - Speed: Fast
   - Damage: 8-15 each
   - Detection range: 5 tiles
   - Loot: Uncommon items

3. **Horde** (10+ zombies)
   - Health: 10 HP each
   - Speed: Variable
   - Damage: 5-8 each
   - Detection range: 7 tiles
   - Loot: Rare items

### Behavior
- **Distance-based detection**: 
  - 1 tile: 90% detection chance
  - 2 tiles: 60% detection chance
  - 3 tiles: 30% detection chance
  - 4+ tiles: 10% detection chance
- **Turn-based movement**: Zombies move towards player when detected
- **Infection**: Killed NPCs turn into zombies

## ⚔️ Combat System

### Melee Combat
- **Range**: Adjacent tile only
- **Damage**: 10-20 + weapon modifier
- **Stamina cost**: 10
- **Noise level**: Low

### Ranged Combat
- **Range**: Based on weapon (pistol: 5 tiles, rifle: 8 tiles)
- **Damage**: 15-30 + weapon modifier
- **Ammo consumption**: 1-3 per shot
- **Noise level**: High (attracts zombies)

### Damage Calculation
```javascript
damage = baseDamage + random(-5, 5) + weaponModifier + skillModifier
criticalChance = 0.1 + luckModifier
if (critical) damage *= 2
```

## 👥 NPC System

### Factions (Hidden Initially)
1. **Survivors** - Regular people trying to survive
2. **Raiders** - Hostile, steal resources
3. **Traders** - Neutral, offer trades
4. **Cannibals** - Hostile, disguised as friendly
5. **Military Remnants** - Organized, territorial
6. **Cultists** - Unpredictable behavior

### NPC Behaviors
- **Friendly** (30%): Will trade, may join camp
- **Neutral** (50%): Ignore unless provoked
- **Hostile** (20%): Attack on sight

### NPC Stats
- Health: 50-100 HP
- Skills: Combat, Medical, Engineering, Scavenging
- Morale: Affects productivity and loyalty
- Hunger/Thirst: Requires resources

## 📦 Loot System

### Loot Categories
1. **Weapons**: Melee (knife, bat, axe), Ranged (pistol, rifle, bow)
2. **Ammunition**: Bullets, arrows
3. **Food**: Canned goods, water bottles, rations
4. **Medicine**: Bandages, antibiotics, painkillers
5. **Materials**: Wood, metal, cloth, electronics
6. **Special**: Maps, keys, notes, blueprints

### Loot Rarity
- Common (60%): Basic supplies
- Uncommon (25%): Better weapons, medicine
- Rare (10%): Special items, blueprints
- Legendary (5%): Unique weapons, faction items

## 🌍 Procedural Generation

### Daily Content Generation (via DeepSeek API)
```javascript
const DEEPSEEK_API_KEY = 'sk-88d05991389d45fbaee750ee9724a38c';

// Daily generation includes:
- New events (Europa Universalis style)
- Random encounters
- Weather patterns
- Story arcs
- Quest lines
- NPC personalities
- Loot tables
- Map expansions
```

### Event Types
1. **Random Encounters**: Traders, refugees, ambushes
2. **Weather Events**: Storms, fog, extreme temperatures
3. **Story Events**: Faction wars, supply drops, migrations
4. **Quest Events**: Rescue missions, supply runs, investigations

## 🎨 Visual Design

### Art Style
- **Inspiration**: "This War of Mine" aesthetic
- **Color Palette**: Desaturated grays, browns, muted reds
- **Atmosphere**: Dark, gritty, depressing
- **UI**: Minimalist, survival-focused

### Asset Sources
- **Free Assets**: 
  - itch.io zombie packs
  - OpenGameArt apocalypse sprites
  - Phaser example repositories
- **Generated Assets**: DeepSeek API for unique NPCs, items, locations

### Map Design
- **Grid-based**: 100x100 tile world
- **Biomes**: Urban ruins, forests, suburbs, industrial zones
- **Points of Interest**: Hospitals, police stations, grocery stores, military bases

## 🎮 Game Mechanics

### Turn System
1. **Player Phase**: Move, action, manage inventory
2. **NPC Phase**: NPCs perform actions
3. **Zombie Phase**: Zombies move/attack
4. **Environment Phase**: Weather, events, resource decay

### Resource Management
- **Food**: -1 per survivor per day
- **Water**: -2 per survivor per day
- **Medicine**: Used for healing/disease
- **Ammunition**: Consumed in combat
- **Materials**: Used for building/crafting

### Survival Mechanics
- **Health**: 0-100, death at 0
- **Stamina**: Affects movement and combat
- **Hunger**: Reduces health when depleted
- **Thirst**: Reduces stamina when depleted
- **Morale**: Affects NPC productivity
- **Temperature**: Environmental hazard

## 🏗️ Base Building

### Structures
1. **Walls**: Wood (25 HP), Metal (50 HP), Reinforced (100 HP)
2. **Gates**: Control access, can be locked
3. **Watchtowers**: Increase detection range
4. **Storage**: Increase resource capacity
5. **Workshops**: Craft items and weapons
6. **Medical Bay**: Heal survivors faster
7. **Garden**: Produce food over time
8. **Water Collector**: Gather rainwater

### Defense Mechanics
- **Defense Rating**: Walls + Traps + Armed Survivors
- **Siege Resolution**: 
  ```javascript
  survivalChance = defenseRating / (zombieCount * zombieStrength)
  casualties = zombieCount * (1 - survivalChance) * random(0.5, 1.5)
  ```

## 🔮 Future Features

### Blockchain Integration
- **NFT Characters**: Mint unique survivors
- **Character Death**: NFT burns on death
- **Chainlink VRF**: Verifiable randomness for loot/events
- **Token Economy**: Trade resources as tokens

### Multiplayer
- **Co-op Mode**: Build camps together
- **PvP Raids**: Attack other player camps
- **Trading**: Exchange resources/survivors

## 📝 Implementation Status

### Completed
- ✅ Basic project structure
- ✅ Next.js and Phaser 3 setup
- ✅ Fully working turn-based movement system (grid-based 25x25)
- ✅ Three zombie types with progressive difficulty:
  - Single zombies (20 HP, common)
  - Zombie groups (50 HP, uncommon)
  - Zombie swarms (100 HP, rare)
- ✅ Distance-based detection mechanics (90% at 1 tile, decreasing with distance)
- ✅ Complete NPC system with 6 factions:
  - Survivors, Raiders, Traders, Cannibals, Military, Cultists
  - Dynamic attitudes: friendly, neutral, hostile
  - NPCs turn into zombies when killed
- ✅ Full combat system:
  - Melee combat (adjacent tiles)
  - Ranged combat (G key, 5 tile range)
  - Damage animations and feedback
- ✅ Loot and inventory system:
  - Item pickups (E key)
  - Dynamic inventory display
  - Resource management
- ✅ Base building mode:
  - 8 structure types (walls, gates, watchtowers, etc.)
  - Resource costs and management
  - Grid-based placement system
- ✅ Camp establishment (C key when safe)
- ✅ DeepSeek API integration for procedural events
- ✅ Daily event system with choices and consequences
- ✅ Dark post-apocalyptic UI with complete legend
- ✅ Day/night cycle with increasing difficulty
- ✅ Death mechanics and game over screen

### In Progress
- 🔄 Asset integration from free sources
- 🔄 Sound effects and ambient music

### Pending
- ⏳ Save/load system
- ⏳ Weather effects
- ⏳ More complex story arcs
- ⏳ Blockchain integration (NFTs, VRF)

## 🚀 Getting Started

### Development
```bash
npm run dev
# Game runs on http://localhost:3000
```

### Build
```bash
npm run build
npm start
```

### Environment Variables
```env
DEEPSEEK_API_KEY=sk-88d05991389d45fbaee750ee9724a38c
```

## 📚 Code Structure
```
/components/game/
  - UltimateDeadGrid.tsx    # Main game with full V1 mechanics
  - CompleteDeadGrid.tsx    # Previous version with inventory
  - FixedDeadGrid.tsx       # Simple version with basic controls
  - SimpleGameTest.tsx      # Sprite testing component
  
/lib/game/
  - AssetManager.ts         # Centralized Post-Apocalypse asset loading
  - GridManager.ts          # Grid-based positioning and collision
  - TurnManager.ts          # Turn-based mechanics (Player→Enemies→Environment)
  
/lib/game/entities/
  - BaseEntity.ts           # Entity base class with health/movement
  - Player.ts               # Player entity with inventory/combat
  - Zombie.ts               # Zombie entity with detection AI

/public/assets/PostApocalypse_AssetPack_v1.1.2/
  /Character/               
    /Main/                  # Player sprites (idle, run, death)
    /Bat/                   # Melee weapon sprites
    /Guns/                  # Ranged weapon sprites
  /Enemies/
    /Zombie_Small/          # Small zombie sprites with death animations
    /Zombie_Big/            # Big zombie sprites with death animations
    /Zombie_Axe/            # Axe zombie sprites with death animations
  /Objects/
    /Pickable/              # Loot items (ammo, medkits, weapons)
    /Buildings/             # Base structures (tents, walls)
    /Vehicles/              # Abandoned vehicles
  /UI/
    /HP/                    # Heart health indicators
    /Inventory/             # Inventory UI and item icons
  /Tiles/                   # Background tilesets
```

## 🎯 Design Principles
1. **Atmosphere First**: Every decision should enhance the dark, hopeless atmosphere
2. **Meaningful Choices**: No choice should be obviously correct
3. **Emergent Storytelling**: Let player actions create unique narratives
4. **Resource Scarcity**: Everything should feel valuable
5. **Permadeath Stakes**: Make every turn count

## 🎮 Game Controls

### Movement
- **Arrow Keys / WASD**: Move player on grid
- **Space**: End turn

### Combat
- **Click on adjacent enemy**: Melee attack
- **G**: Ranged attack (requires ammo, auto-targets nearest enemy within 5 tiles)

### Interaction
- **E**: Pickup loot at current position
- **C**: Establish camp (when safe, no enemies within 3 tiles)
- **Click on NPC**: Interact (trade with friendly, attack hostile)

### Game Features
- **Three zombie types**: Single (common), Groups (uncommon), Swarms (rare)
- **Distance-based detection**: Zombies more likely to detect you when closer
- **Six NPC factions**: Each with different behaviors and items
- **Base building**: 8 structure types with resource management
- **Procedural events**: Daily generated events with meaningful choices
- **Death mechanics**: NPCs turn into zombies when killed

---

Last Updated: 2025-01-02
Version: 1.0.0