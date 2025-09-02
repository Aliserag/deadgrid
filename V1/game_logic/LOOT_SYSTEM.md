# DeadGrid Loot System

The loot system in DeadGrid introduces a variety of items that players can discover, collect, and use to enhance their survival chances in the zombie apocalypse.

## Features

- **Random Generation**: Loot is procedurally generated with unique properties based on source and context
- **Category System**: Items are organized into categories (weapons, armor, medical, food, tools, rare)
- **Rarity Tiers**: Items have different rarity levels that affect their power and uniqueness (common, uncommon, rare, epic, legendary, unique)
- **Effect System**: Each item has gameplay effects that provide bonuses when equipped
- **Visual Representation**: Items include appropriate emojis and color-coding by rarity
- **Source-Based Generation**: The type of loot found depends on where/how it was discovered

## Finding Loot

Loot can be discovered through various gameplay activities:

- **Combat**: Defeating zombies (lone zombies, groups, or hordes)
- **Exploration**: Exploring new areas or scouting
- **Scavenging**: Searching buildings and resource caches
- **Survivors**: Trading with or recruiting survivors (or killing/stealing from them)
- **Special Events**: Rare items can be found during special story events

The source of the loot influences what categories and rarities are likely to be found. For example:
- Zombies are more likely to drop weapons or medical items
- Buildings might contain a variety of items based on their type
- Military locations have better chances for high-quality weapons and armor
- Hospitals primarily contain medical supplies

## Rarity System

Loot comes in six rarity tiers, each with increasing power and complexity:

1. **Common** (white): Basic items with a single weak effect
2. **Uncommon** (green): Better items with a single moderate effect
3. **Rare** (blue): Good items with two moderate effects
4. **Epic** (purple): Very good items with two strong effects
5. **Legendary** (orange): Exceptional items with three strong effects
6. **Unique** (gold): One-of-a-kind items with three maximum effects

Rarer items are less common but provide stronger bonuses, making them valuable treasures to discover.

## Item Effects

Each item has one or more effects that provide gameplay bonuses when equipped. These effects vary by category and have maximum values to ensure game balance.

Example effects by category:
- **Weapons**: Damage, critical chance, durability, zombie damage, range
- **Armor**: Protection, durability, stealth, carrying capacity, weather resistance
- **Medical**: Healing effectiveness, infection resistance, recovery time, pain reduction
- **Food**: Nutrition, hydration, energy boost, spoil time, morale boost
- **Tools**: Effectiveness, durability, range, battery life, search radius
- **Rare**: Faction reputation, XP gain, zombie repellent, unique abilities

## Technical Implementation

The loot system is powered by an AI-driven generator that:

1. Determines appropriate loot category based on the source context
2. Selects a rarity tier based on weighted probabilities (adjusted by source)
3. Generates a name using components (prefix, base, suffix)
4. Selects appropriate effects based on the category and rarity
5. Creates descriptions and visual representations

All generated loot is stored in a JSON database at `game_logic/loot_database.json`.

## Testing

You can test the loot generation system using the provided script:

```bash
./scripts/test_loot_generation.sh
```

This will generate sample loot items from various sources and display statistics about the generated items.

## Integration Points

The loot system is integrated with several game mechanics:

- The inventory dialog allows players to view and manage their items
- Combat mechanics can trigger loot discovery when defeating zombies
- Exploration, scavenging, and scouting can discover new items
- Survivor interactions can lead to discovering items through various means
- Daily AI simulation can generate new loot as part of the evolving world 