import * as Phaser from 'phaser';
import { GAME_CONFIG, COLORS, TERRAIN_MOVEMENT_COST } from '../constants';
import { TurnSystem } from '../systems/TurnSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { IGameState, IEntity, IPosition, ITile, IAction } from '../core/interfaces';
import { EventGenerator } from '../generators/EventGenerator';

export class GameScene extends Phaser.Scene {
  private map!: Phaser.Tilemaps.Tilemap;
  private tileset!: Phaser.Tilemaps.Tileset;
  private groundLayer!: Phaser.Tilemaps.TilemapLayer;
  
  private player!: Phaser.GameObjects.Sprite;
  private zombies: Phaser.GameObjects.Sprite[] = [];
  private npcs: Phaser.GameObjects.Sprite[] = [];
  
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: any;
  
  private turnSystem!: TurnSystem;
  private combatSystem!: CombatSystem;
  private eventGenerator!: EventGenerator;
  
  private gameState!: GameState;
  private isPlayerTurn: boolean = true;
  private turnText!: Phaser.GameObjects.Text;
  private statsText!: Phaser.GameObjects.Text;
  
  private mapData: number[][] = [];
  private tileGraphics!: Phaser.GameObjects.Graphics;
  
  constructor() {
    super({ key: 'GameScene' });
  }
  
  preload(): void {
    // Generate placeholder sprites procedurally
    this.generatePlaceholderAssets();
  }
  
  create(): void {
    // Initialize systems
    this.turnSystem = new TurnSystem();
    this.combatSystem = new CombatSystem();
    this.eventGenerator = new EventGenerator();
    
    // Initialize game state
    this.initializeGameState();
    
    // Create the game world
    this.createWorld();
    
    // Create player
    this.createPlayer();
    
    // Create UI
    this.createUI();
    
    // Setup input
    this.setupInput();
    
    // Initialize systems with game state
    this.turnSystem.initialize(this.gameState);
    this.combatSystem.initialize(this.gameState);
    
    // Start the game loop
    this.startGameLoop();
  }
  
  update(time: number, delta: number): void {
    if (this.isPlayerTurn) {
      this.handlePlayerInput();
    } else {
      this.processAITurn();
    }
    
    // Update camera to follow player
    this.updateCamera();
    
    // Update UI
    this.updateUI();
  }
  
  private generatePlaceholderAssets(): void {
    // Create simple colored rectangles for sprites
    const graphics = this.add.graphics();
    
    // Player sprite (blue)
    graphics.fillStyle(COLORS.ENTITIES.PLAYER, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    
    // Zombie sprite (dark red)
    graphics.clear();
    graphics.fillStyle(COLORS.ENTITIES.ZOMBIE, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('zombie', 32, 32);
    
    // NPC sprites
    graphics.clear();
    graphics.fillStyle(COLORS.ENTITIES.NPC_FRIENDLY, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('npc_friendly', 32, 32);
    
    graphics.clear();
    graphics.fillStyle(COLORS.ENTITIES.NPC_HOSTILE, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('npc_hostile', 32, 32);
    
    // Terrain tiles
    const terrainTypes = ['grass', 'forest', 'road', 'building', 'water', 'mountain'];
    const terrainColors = [
      COLORS.TERRAIN.GRASS,
      COLORS.TERRAIN.FOREST,
      COLORS.TERRAIN.ROAD,
      COLORS.TERRAIN.BUILDING,
      COLORS.TERRAIN.WATER,
      COLORS.TERRAIN.MOUNTAIN
    ];
    
    terrainTypes.forEach((type, index) => {
      graphics.clear();
      graphics.fillStyle(terrainColors[index], 1);
      graphics.fillRect(0, 0, 32, 32);
      graphics.generateTexture(type, 32, 32);
    });
    
    graphics.destroy();
  }
  
  private initializeGameState(): void {
    this.gameState = new GameState();
    this.gameState.player = {
      id: 'player',
      type: 'player',
      position: { x: 25, y: 25 },
      properties: {
        health: 100,
        maxHealth: 100,
        hunger: 100,
        thirst: 100,
        stamina: 100
      },
      update: () => {}
    };
  }
  
  private createWorld(): void {
    // Generate procedural map
    this.generateMap();
    
    // Create tile graphics
    this.tileGraphics = this.add.graphics();
    this.renderMap();
    
    // Spawn initial zombies
    this.spawnZombies(5);
    
    // Spawn initial NPCs
    this.spawnNPCs(3);
  }
  
  private generateMap(): void {
    const { MAP_WIDTH, MAP_HEIGHT } = GAME_CONFIG;
    
    // Initialize map with grass
    for (let y = 0; y < MAP_HEIGHT; y++) {
      this.mapData[y] = [];
      for (let x = 0; x < MAP_WIDTH; x++) {
        this.mapData[y][x] = 0; // Grass
      }
    }
    
    // Add forests
    for (let i = 0; i < 20; i++) {
      const x = Math.floor(Math.random() * MAP_WIDTH);
      const y = Math.floor(Math.random() * MAP_HEIGHT);
      const size = Math.floor(Math.random() * 5) + 3;
      
      for (let dy = -size; dy <= size; dy++) {
        for (let dx = -size; dx <= size; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < MAP_WIDTH && ny >= 0 && ny < MAP_HEIGHT) {
            if (Math.random() > 0.3) {
              this.mapData[ny][nx] = 1; // Forest
            }
          }
        }
      }
    }
    
    // Add roads
    for (let i = 0; i < 3; i++) {
      if (Math.random() > 0.5) {
        // Horizontal road
        const y = Math.floor(Math.random() * MAP_HEIGHT);
        for (let x = 0; x < MAP_WIDTH; x++) {
          this.mapData[y][x] = 2; // Road
        }
      } else {
        // Vertical road
        const x = Math.floor(Math.random() * MAP_WIDTH);
        for (let y = 0; y < MAP_HEIGHT; y++) {
          this.mapData[y][x] = 2; // Road
        }
      }
    }
    
    // Add buildings
    for (let i = 0; i < 10; i++) {
      const x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
      const y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
      this.mapData[y][x] = 3; // Building
    }
    
    // Add water
    for (let i = 0; i < 5; i++) {
      const x = Math.floor(Math.random() * MAP_WIDTH);
      const y = Math.floor(Math.random() * MAP_HEIGHT);
      const size = Math.floor(Math.random() * 3) + 2;
      
      for (let dy = -size; dy <= size; dy++) {
        for (let dx = -size; dx <= size; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < MAP_WIDTH && ny >= 0 && ny < MAP_HEIGHT) {
            if (Math.random() > 0.4) {
              this.mapData[ny][nx] = 4; // Water
            }
          }
        }
      }
    }
  }
  
  private renderMap(): void {
    const { TILE_SIZE } = GAME_CONFIG;
    const terrainColors = [
      COLORS.TERRAIN.GRASS,
      COLORS.TERRAIN.FOREST,
      COLORS.TERRAIN.ROAD,
      COLORS.TERRAIN.BUILDING,
      COLORS.TERRAIN.WATER,
      COLORS.TERRAIN.MOUNTAIN
    ];
    
    this.tileGraphics.clear();
    
    for (let y = 0; y < this.mapData.length; y++) {
      for (let x = 0; x < this.mapData[y].length; x++) {
        const tileType = this.mapData[y][x];
        const color = terrainColors[tileType] || terrainColors[0];
        
        this.tileGraphics.fillStyle(color, 1);
        this.tileGraphics.fillRect(
          x * TILE_SIZE,
          y * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE
        );
        
        // Add grid lines for visibility
        this.tileGraphics.lineStyle(1, 0x222222, 0.3);
        this.tileGraphics.strokeRect(
          x * TILE_SIZE,
          y * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE
        );
      }
    }
  }
  
  private createPlayer(): void {
    const { x, y } = this.gameState.player.position;
    this.player = this.add.sprite(
      x * GAME_CONFIG.TILE_SIZE + 16,
      y * GAME_CONFIG.TILE_SIZE + 16,
      'player'
    );
    this.player.setDepth(10);
  }
  
  private spawnZombies(count: number): void {
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * GAME_CONFIG.MAP_WIDTH);
      const y = Math.floor(Math.random() * GAME_CONFIG.MAP_HEIGHT);
      
      const zombie = this.add.sprite(
        x * GAME_CONFIG.TILE_SIZE + 16,
        y * GAME_CONFIG.TILE_SIZE + 16,
        'zombie'
      );
      zombie.setDepth(5);
      
      this.zombies.push(zombie);
      
      // Add to game state
      const zombieEntity: IEntity = {
        id: `zombie_${i}`,
        type: 'zombie',
        position: { x, y },
        properties: {
          health: 30,
          damage: 10,
          speed: 1,
          detectionRange: 5
        },
        update: () => {}
      };
      
      this.gameState.zombies.push(zombieEntity as any);
    }
  }
  
  private spawnNPCs(count: number): void {
    const factions = ['SURVIVORS', 'TRADERS', 'RAIDERS'];
    const alignments = ['friendly', 'neutral', 'hostile'];
    
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * GAME_CONFIG.MAP_WIDTH);
      const y = Math.floor(Math.random() * GAME_CONFIG.MAP_HEIGHT);
      const alignment = alignments[Math.floor(Math.random() * alignments.length)];
      
      const npc = this.add.sprite(
        x * GAME_CONFIG.TILE_SIZE + 16,
        y * GAME_CONFIG.TILE_SIZE + 16,
        `npc_${alignment}`
      );
      npc.setDepth(5);
      
      this.npcs.push(npc);
      
      // Add to game state
      const npcEntity: IEntity = {
        id: `npc_${i}`,
        type: 'npc',
        position: { x, y },
        properties: {
          health: 50,
          faction: factions[Math.floor(Math.random() * factions.length)],
          alignment: alignment
        },
        update: () => {}
      };
      
      this.gameState.npcs.push(npcEntity as any);
    }
  }
  
  private createUI(): void {
    // Turn indicator
    this.turnText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.turnText.setScrollFactor(0);
    this.turnText.setDepth(100);
    
    // Stats display
    this.statsText = this.add.text(10, 50, '', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.statsText.setScrollFactor(0);
    this.statsText.setDepth(100);
  }
  
  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasdKeys = this.input.keyboard!.addKeys('W,A,S,D,SPACE,E,Q');
    
    // Handle turn-based movement
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      if (this.isPlayerTurn) {
        let action: IAction | null = null;
        
        switch (event.key) {
          case 'ArrowUp':
          case 'w':
            action = { type: 'move', parameters: { direction: 'north' } };
            break;
          case 'ArrowDown':
          case 's':
            action = { type: 'move', parameters: { direction: 'south' } };
            break;
          case 'ArrowLeft':
          case 'a':
            action = { type: 'move', parameters: { direction: 'west' } };
            break;
          case 'ArrowRight':
          case 'd':
            action = { type: 'move', parameters: { direction: 'east' } };
            break;
          case ' ':
            action = { type: 'wait' };
            break;
          case 'e':
            action = { type: 'interact' };
            break;
        }
        
        if (action) {
          this.processPlayerAction(action);
        }
      }
    });
  }
  
  private handlePlayerInput(): void {
    // Input is handled through event listeners
  }
  
  private processPlayerAction(action: IAction): void {
    // Process the action
    this.turnSystem.processTurn(this.gameState.player, action);
    
    // Update player sprite position
    const { x, y } = this.gameState.player.position;
    this.player.setPosition(
      x * GAME_CONFIG.TILE_SIZE + 16,
      y * GAME_CONFIG.TILE_SIZE + 16
    );
    
    // End player turn
    this.isPlayerTurn = false;
    
    // Process AI turns
    this.time.delayedCall(200, () => {
      this.processAITurn();
    });
  }
  
  private processAITurn(): void {
    // Process zombie AI
    this.gameState.zombies.forEach((zombie, index) => {
      const sprite = this.zombies[index];
      if (sprite && zombie.properties.health > 0) {
        // Simple AI: move towards player if in detection range
        const distance = this.calculateDistance(
          zombie.position,
          this.gameState.player.position
        );
        
        if (distance <= zombie.properties.detectionRange) {
          const action = this.getZombieAction(zombie, this.gameState.player);
          this.turnSystem.processTurn(zombie, action);
          
          // Update sprite position
          sprite.setPosition(
            zombie.position.x * GAME_CONFIG.TILE_SIZE + 16,
            zombie.position.y * GAME_CONFIG.TILE_SIZE + 16
          );
        }
      }
    });
    
    // Process NPC AI
    this.gameState.npcs.forEach((npc, index) => {
      const sprite = this.npcs[index];
      if (sprite && npc.properties.health > 0) {
        // NPCs have more complex behavior based on alignment
        const action = this.getNPCAction(npc);
        this.turnSystem.processTurn(npc, action);
        
        // Update sprite position
        sprite.setPosition(
          npc.position.x * GAME_CONFIG.TILE_SIZE + 16,
          npc.position.y * GAME_CONFIG.TILE_SIZE + 16
        );
      }
    });
    
    // Return to player turn
    this.time.delayedCall(500, () => {
      this.isPlayerTurn = true;
      this.gameState.turn++;
    });
  }
  
  private getZombieAction(zombie: IEntity, target: IEntity): IAction {
    const dx = target.position.x - zombie.position.x;
    const dy = target.position.y - zombie.position.y;
    
    // If adjacent, attack
    if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
      return { type: 'attack', target };
    }
    
    // Otherwise, move towards target
    if (Math.abs(dx) > Math.abs(dy)) {
      return {
        type: 'move',
        parameters: { direction: dx > 0 ? 'east' : 'west' }
      };
    } else {
      return {
        type: 'move',
        parameters: { direction: dy > 0 ? 'south' : 'north' }
      };
    }
  }
  
  private getNPCAction(npc: IEntity): IAction {
    // Random movement for now
    const directions = ['north', 'south', 'east', 'west', 'wait'];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    
    if (direction === 'wait') {
      return { type: 'wait' };
    }
    
    return { type: 'move', parameters: { direction } };
  }
  
  private calculateDistance(pos1: IPosition, pos2: IPosition): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  private updateCamera(): void {
    const { x, y } = this.gameState.player.position;
    this.cameras.main.centerOn(
      x * GAME_CONFIG.TILE_SIZE,
      y * GAME_CONFIG.TILE_SIZE
    );
  }
  
  private updateUI(): void {
    this.turnText.setText(`Turn: ${this.gameState.turn} | Day: ${this.gameState.day}`);
    
    const player = this.gameState.player;
    this.statsText.setText(
      `Health: ${player.properties.health}/${player.properties.maxHealth}\n` +
      `Hunger: ${Math.floor(player.properties.hunger)}\n` +
      `Thirst: ${Math.floor(player.properties.thirst)}\n` +
      `Stamina: ${Math.floor(player.properties.stamina)}`
    );
  }
  
  private startGameLoop(): void {
    // Decay stats over time
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        const player = this.gameState.player;
        player.properties.hunger = Math.max(0, player.properties.hunger - GAME_CONFIG.HUNGER_DECAY_RATE);
        player.properties.thirst = Math.max(0, player.properties.thirst - GAME_CONFIG.THIRST_DECAY_RATE);
        
        // Check for random events
        if (Math.random() < 0.1) {
          this.triggerRandomEvent();
        }
      },
      loop: true
    });
  }
  
  private async triggerRandomEvent(): Promise<void> {
    const event = await this.eventGenerator.generate();
    console.log('Random event triggered:', event.title);
    // TODO: Show event UI
  }
}

// Simple GameState implementation for now
class GameState implements IGameState {
  turn: number = 0;
  day: number = 1;
  player: any;
  zombies: any[] = [];
  npcs: any[] = [];
  
  getCurrentTurn(): number {
    return this.turn;
  }
  
  getPlayer(): any {
    return this.player;
  }
  
  getWorld(): any {
    return {
      getMap: () => ({}),
      getWeather: () => ({ type: 'clear', intensity: 0, effects: [] }),
      getTimeOfDay: () => 12,
      getLocations: () => []
    };
  }
  
  getNPCs(): any[] {
    return this.npcs;
  }
  
  getZombies(): any[] {
    return this.zombies;
  }
}