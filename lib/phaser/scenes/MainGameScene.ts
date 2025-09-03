import * as Phaser from 'phaser';
import { useGameStore } from '../store/gameStore';

export class MainGameScene extends Phaser.Scene {
  private tileSize = 32;
  private mapWidth = 50;
  private mapHeight = 50;
  private visibilityRadius = 7;
  
  private player!: Phaser.GameObjects.Sprite;
  private zombies: Phaser.GameObjects.Sprite[] = [];
  private npcs: Phaser.GameObjects.Sprite[] = [];
  private tiles: Phaser.GameObjects.Rectangle[][] = [];
  private fogOfWar: Phaser.GameObjects.Rectangle[][] = [];
  
  private currentTurn: 'player' | 'npcs' | 'zombies' | 'environment' = 'player';
  private turnText!: Phaser.GameObjects.Text;
  private isProcessingTurn = false;
  
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;

  constructor() {
    super({ key: 'MainGameScene' });
  }

  preload() {
    // Generate placeholder sprites
    this.generateSprites();
  }

  create() {
    // Create the game world
    this.createWorld();
    
    // Create player
    this.createPlayer();
    
    // Spawn initial zombies
    this.spawnZombies(10);
    
    // Setup camera
    this.setupCamera();
    
    // Setup controls
    this.setupControls();
    
    // Create UI elements
    this.createUI();
    
    // Start HUD scene
    this.scene.launch('HUDScene');
    
    // Update fog of war
    this.updateFogOfWar();
  }

  generateSprites() {
    // Create canvas textures for sprites
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Player sprite (green)
    graphics.fillStyle(0x4CAF50);
    graphics.fillCircle(16, 16, 12);
    graphics.generateTexture('player', 32, 32);
    graphics.clear();
    
    // Zombie sprite (brown)
    graphics.fillStyle(0x8B4513);
    graphics.fillCircle(16, 16, 10);
    graphics.fillStyle(0xFF0000);
    graphics.fillCircle(12, 12, 3);
    graphics.fillCircle(20, 12, 3);
    graphics.generateTexture('zombie', 32, 32);
    graphics.clear();
    
    // NPC sprite (blue)
    graphics.fillStyle(0x2196F3);
    graphics.fillCircle(16, 16, 10);
    graphics.generateTexture('npc', 32, 32);
    graphics.clear();
    
    // Tile sprites
    graphics.fillStyle(0x1a1a1a);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('ground', 32, 32);
    graphics.clear();
    
    graphics.fillStyle(0x333333);
    graphics.fillRect(0, 0, 32, 32);
    graphics.lineStyle(1, 0x444444);
    graphics.strokeRect(0, 0, 32, 32);
    graphics.generateTexture('wall', 32, 32);
    graphics.clear();
    
    graphics.fillStyle(0x4a4a4a);
    graphics.fillRect(0, 0, 32, 32);
    graphics.fillStyle(0x2a2a2a);
    graphics.fillRect(8, 8, 8, 8);
    graphics.fillRect(16, 16, 8, 8);
    graphics.generateTexture('building', 32, 32);
    graphics.clear();
  }

  createWorld() {
    // Generate tile-based world
    for (let y = 0; y < this.mapHeight; y++) {
      this.tiles[y] = [];
      this.fogOfWar[y] = [];
      
      for (let x = 0; x < this.mapWidth; x++) {
        const worldX = x * this.tileSize;
        const worldY = y * this.tileSize;
        
        // Random tile generation
        const rand = Math.random();
        let tileType = 'ground';
        
        if (rand < 0.1) {
          tileType = 'wall';
        } else if (rand < 0.2) {
          tileType = 'building';
        }
        
        // Create tile
        const tile = this.add.rectangle(
          worldX + this.tileSize / 2,
          worldY + this.tileSize / 2,
          this.tileSize,
          this.tileSize,
          tileType === 'wall' ? 0x333333 : tileType === 'building' ? 0x4a4a4a : 0x1a1a1a
        );
        
        tile.setStrokeStyle(1, 0x0a0a0a);
        tile.setData('type', tileType);
        tile.setData('x', x);
        tile.setData('y', y);
        this.tiles[y][x] = tile;
        
        // Create fog of war overlay
        const fog = this.add.rectangle(
          worldX + this.tileSize / 2,
          worldY + this.tileSize / 2,
          this.tileSize,
          this.tileSize,
          0x000000
        );
        fog.setDepth(10);
        this.fogOfWar[y][x] = fog;
      }
    }
  }

  createPlayer() {
    const startX = Math.floor(this.mapWidth / 2);
    const startY = Math.floor(this.mapHeight / 2);
    
    this.player = this.add.sprite(
      startX * this.tileSize + this.tileSize / 2,
      startY * this.tileSize + this.tileSize / 2,
      'player'
    );
    
    this.player.setDepth(5);
    this.player.setData('gridX', startX);
    this.player.setData('gridY', startY);
    
    // Initialize player stats
    const gameStore = useGameStore.getState();
    gameStore.setPlayerPosition({ x: startX, y: startY });
  }

  spawnZombies(count: number) {
    for (let i = 0; i < count; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * this.mapWidth);
        y = Math.floor(Math.random() * this.mapHeight);
      } while (this.tiles[y][x].getData('type') !== 'ground');
      
      const zombie = this.add.sprite(
        x * this.tileSize + this.tileSize / 2,
        y * this.tileSize + this.tileSize / 2,
        'zombie'
      );
      
      zombie.setDepth(4);
      zombie.setData('gridX', x);
      zombie.setData('gridY', y);
      zombie.setData('health', 20);
      zombie.setData('type', 'walker');
      zombie.setData('detected', false);
      
      this.zombies.push(zombie);
    }
  }

  setupCamera() {
    this.cameras.main.setBounds(0, 0, this.mapWidth * this.tileSize, this.mapHeight * this.tileSize);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(1.5);
  }

  setupControls() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,S,A,D');
    
    // Space to end turn
    this.input.keyboard!.on('keydown-SPACE', () => {
      if (this.currentTurn === 'player' && !this.isProcessingTurn) {
        this.endPlayerTurn();
      }
    });
    
    // Click to interact/attack
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.currentTurn === 'player' && !this.isProcessingTurn) {
        this.handleClick(pointer);
      }
    });
  }

  createUI() {
    // Turn indicator
    this.turnText = this.add.text(10, 10, 'Your Turn', {
      fontSize: '20px',
      color: '#4CAF50',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.turnText.setScrollFactor(0);
    this.turnText.setDepth(100);
  }

  update() {
    if (this.currentTurn === 'player' && !this.isProcessingTurn) {
      this.handlePlayerInput();
    }
  }

  handlePlayerInput() {
    const playerX = this.player.getData('gridX');
    const playerY = this.player.getData('gridY');
    let newX = playerX;
    let newY = playerY;
    let moved = false;
    
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.wasd.A)) {
      newX--;
      moved = true;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.wasd.D)) {
      newX++;
      moved = true;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.wasd.W)) {
      newY--;
      moved = true;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || Phaser.Input.Keyboard.JustDown(this.wasd.S)) {
      newY++;
      moved = true;
    }
    
    if (moved && this.canMoveTo(newX, newY)) {
      this.movePlayer(newX, newY);
      this.endPlayerTurn();
    }
  }

  canMoveTo(x: number, y: number): boolean {
    if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) {
      return false;
    }
    
    const tile = this.tiles[y][x];
    if (tile.getData('type') === 'wall') {
      return false;
    }
    
    // Check for zombies
    const zombieAtPosition = this.zombies.find(z => 
      z.getData('gridX') === x && z.getData('gridY') === y && z.active
    );
    
    return !zombieAtPosition;
  }

  movePlayer(x: number, y: number) {
    this.player.setData('gridX', x);
    this.player.setData('gridY', y);
    
    this.tweens.add({
      targets: this.player,
      x: x * this.tileSize + this.tileSize / 2,
      y: y * this.tileSize + this.tileSize / 2,
      duration: 200,
      onComplete: () => {
        this.updateFogOfWar();
        const gameStore = useGameStore.getState();
        gameStore.setPlayerPosition({ x, y });
      }
    });
  }

  updateFogOfWar() {
    const playerX = this.player.getData('gridX');
    const playerY = this.player.getData('gridY');
    
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const distance = Math.abs(x - playerX) + Math.abs(y - playerY);
        
        if (distance <= this.visibilityRadius) {
          // Visible area
          this.fogOfWar[y][x].setAlpha(0);
        } else if (distance <= this.visibilityRadius + 2) {
          // Partially visible
          this.fogOfWar[y][x].setAlpha(0.5);
        } else {
          // Hidden
          this.fogOfWar[y][x].setAlpha(0.9);
        }
      }
    }
  }

  handleClick(pointer: Phaser.Input.Pointer) {
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const gridX = Math.floor(worldPoint.x / this.tileSize);
    const gridY = Math.floor(worldPoint.y / this.tileSize);
    
    // Check if clicking on a zombie
    const zombie = this.zombies.find(z => 
      z.getData('gridX') === gridX && 
      z.getData('gridY') === gridY && 
      z.active
    );
    
    if (zombie) {
      this.attackZombie(zombie);
    }
  }

  attackZombie(zombie: Phaser.GameObjects.Sprite) {
    const playerX = this.player.getData('gridX');
    const playerY = this.player.getData('gridY');
    const zombieX = zombie.getData('gridX');
    const zombieY = zombie.getData('gridY');
    
    const distance = Math.abs(playerX - zombieX) + Math.abs(playerY - zombieY);
    
    // Check if in melee range
    if (distance <= 1) {
      const damage = Math.floor(Math.random() * 10) + 10;
      const health = zombie.getData('health') - damage;
      
      // Show damage text
      const damageText = this.add.text(
        zombie.x,
        zombie.y - 20,
        `-${damage}`,
        { fontSize: '16px', color: '#ff0000' }
      );
      
      this.tweens.add({
        targets: damageText,
        y: zombie.y - 40,
        alpha: 0,
        duration: 1000,
        onComplete: () => damageText.destroy()
      });
      
      if (health <= 0) {
        // Zombie dies
        zombie.setActive(false);
        zombie.setVisible(false);
        
        // Update score
        const gameStore = useGameStore.getState();
        gameStore.player.score += 10;
      } else {
        zombie.setData('health', health);
      }
      
      this.endPlayerTurn();
    }
  }

  endPlayerTurn() {
    this.isProcessingTurn = true;
    this.currentTurn = 'zombies';
    this.turnText.setText('Zombies Turn');
    this.turnText.setColor('#ff0000');
    
    // Process zombie turns
    this.time.delayedCall(500, () => {
      this.processZombieTurns();
    });
  }

  processZombieTurns() {
    const playerX = this.player.getData('gridX');
    const playerY = this.player.getData('gridY');
    
    let index = 0;
    const moveNextZombie = () => {
      if (index >= this.zombies.length) {
        // All zombies moved, environment turn
        this.currentTurn = 'environment';
        this.turnText.setText('Environment');
        this.turnText.setColor('#999999');
        
        this.time.delayedCall(500, () => {
          this.processEnvironmentTurn();
        });
        return;
      }
      
      const zombie = this.zombies[index];
      if (zombie.active) {
        const zombieX = zombie.getData('gridX');
        const zombieY = zombie.getData('gridY');
        const distance = Math.abs(playerX - zombieX) + Math.abs(playerY - zombieY);
        
        // Detection check
        let detectionChance = 0;
        if (distance <= 3) detectionChance = 0.9;
        else if (distance <= 5) detectionChance = 0.6;
        else if (distance <= 7) detectionChance = 0.3;
        else detectionChance = 0.1;
        
        if (Math.random() < detectionChance || zombie.getData('detected')) {
          zombie.setData('detected', true);
          
          // Move towards player
          let newX = zombieX;
          let newY = zombieY;
          
          if (zombieX < playerX) newX++;
          else if (zombieX > playerX) newX--;
          
          if (zombieY < playerY) newY++;
          else if (zombieY > playerY) newY--;
          
          if (this.canMoveTo(newX, newY)) {
            zombie.setData('gridX', newX);
            zombie.setData('gridY', newY);
            
            this.tweens.add({
              targets: zombie,
              x: newX * this.tileSize + this.tileSize / 2,
              y: newY * this.tileSize + this.tileSize / 2,
              duration: 200,
              onComplete: () => {
                // Check if zombie reached player
                if (newX === playerX && newY === playerY) {
                  this.zombieAttackPlayer();
                }
                index++;
                moveNextZombie();
              }
            });
          } else {
            index++;
            moveNextZombie();
          }
        } else {
          // Random movement
          const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
          const dir = dirs[Math.floor(Math.random() * dirs.length)];
          const newX = zombieX + dir[0];
          const newY = zombieY + dir[1];
          
          if (this.canMoveTo(newX, newY)) {
            zombie.setData('gridX', newX);
            zombie.setData('gridY', newY);
            
            this.tweens.add({
              targets: zombie,
              x: newX * this.tileSize + this.tileSize / 2,
              y: newY * this.tileSize + this.tileSize / 2,
              duration: 200,
              onComplete: () => {
                index++;
                moveNextZombie();
              }
            });
          } else {
            index++;
            moveNextZombie();
          }
        }
      } else {
        index++;
        moveNextZombie();
      }
    };
    
    moveNextZombie();
  }

  zombieAttackPlayer() {
    const damage = Math.floor(Math.random() * 10) + 5;
    const gameStore = useGameStore.getState();
    gameStore.updatePlayerHealth(gameStore.player.health - damage);
    
    // Screen shake
    this.cameras.main.shake(200, 0.01);
    
    // Flash red
    this.cameras.main.flash(200, 255, 0, 0, false);
    
    // Show damage
    const damageText = this.add.text(
      this.player.x,
      this.player.y - 20,
      `-${damage}`,
      { fontSize: '18px', color: '#ff0000', fontStyle: 'bold' }
    );
    
    this.tweens.add({
      targets: damageText,
      y: this.player.y - 40,
      alpha: 0,
      duration: 1000,
      onComplete: () => damageText.destroy()
    });
  }

  processEnvironmentTurn() {
    // Random zombie spawning
    if (Math.random() < 0.3) {
      this.spawnZombies(Math.floor(Math.random() * 3) + 1);
    }
    
    // Return to player turn
    this.currentTurn = 'player';
    this.turnText.setText('Your Turn');
    this.turnText.setColor('#4CAF50');
    this.isProcessingTurn = false;
  }
}