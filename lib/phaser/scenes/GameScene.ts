import * as Phaser from 'phaser';
import { useGameStore } from '../store/gameStore';
import { Player } from '../entities/Player';
import { Zombie } from '../entities/Zombie';
import { MapGenerator } from '../utils/MapGenerator';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private zombies!: Phaser.Physics.Arcade.Group;
  private survivors!: Phaser.Physics.Arcade.Group;
  private items!: Phaser.Physics.Arcade.Group;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private buildings!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  private mapGenerator!: MapGenerator;
  private minimap!: Phaser.Cameras.Scene2D.Camera;
  private dayNightOverlay!: Phaser.GameObjects.Rectangle;
  
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Initialize map
    this.mapGenerator = new MapGenerator(this);
    const mapData = this.mapGenerator.generateMap(100, 100);
    
    // Create world bounds
    this.physics.world.setBounds(0, 0, mapData.width * 32, mapData.height * 32);
    
    // Create tile groups
    this.walls = this.physics.add.staticGroup();
    this.buildings = this.physics.add.staticGroup();
    
    // Render map
    this.renderMap(mapData);
    
    // Create player
    this.player = new Player(this, 1600, 1600);
    
    // Create zombie groups
    this.zombies = this.physics.add.group({
      classType: Zombie,
      runChildUpdate: true,
    });
    
    // Create survivor group
    this.survivors = this.physics.add.group();
    
    // Create items group
    this.items = this.physics.add.group();
    
    // Spawn initial zombies
    this.spawnZombies(20);
    
    // Spawn initial items
    this.spawnItems(15);
    
    // Setup camera
    this.cameras.main.startFollow(this.player.sprite);
    this.cameras.main.setZoom(2);
    this.cameras.main.setLerp(0.1, 0.1);
    
    // Setup minimap
    this.setupMinimap();
    
    // Setup day/night cycle
    this.setupDayNightCycle();
    
    // Setup controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,S,A,D');
    
    // Setup interactions
    this.setupInteractions();
    
    // Setup collisions
    this.setupCollisions();
    
    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
    
    // Update game store
    const gameStore = useGameStore.getState();
    gameStore.setCurrentScene('GameScene');
  }

  renderMap(mapData: any) {
    for (let y = 0; y < mapData.height; y++) {
      for (let x = 0; x < mapData.width; x++) {
        const tile = mapData.tiles[y][x];
        const worldX = x * 32;
        const worldY = y * 32;
        
        // Add floor everywhere
        this.add.image(worldX, worldY, 'floor').setOrigin(0);
        
        if (tile === 1) {
          // Wall
          const wall = this.walls.create(worldX + 16, worldY + 16, 'wall');
          wall.setSize(32, 32);
        } else if (tile === 2) {
          // Building
          const building = this.buildings.create(worldX + 16, worldY + 16, 'building');
          building.setSize(32, 32);
        }
      }
    }
  }

  spawnZombies(count: number) {
    const gameStore = useGameStore.getState();
    
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(200, 3000);
      const y = Phaser.Math.Between(200, 3000);
      const zombie = new Zombie(this, x, y, 'walker');
      this.zombies.add(zombie.sprite);
      
      gameStore.addZombie({
        id: `zombie_${i}`,
        type: 'walker',
        health: 50,
        position: { x, y },
        speed: 30,
      });
    }
  }

  spawnItems(count: number) {
    const itemTypes = ['food', 'water', 'medicine', 'ammo', 'weapon'];
    
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(200, 3000);
      const y = Phaser.Math.Between(200, 3000);
      const type = Phaser.Math.RND.pick(itemTypes);
      
      const item = this.physics.add.sprite(x, y, `item_${type}`);
      item.setData('type', type);
      item.setData('id', `item_${i}`);
      this.items.add(item);
      
      // Add floating animation
      this.tweens.add({
        targets: item,
        y: y - 5,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  setupMinimap() {
    const minimapWidth = 200;
    const minimapHeight = 200;
    
    this.minimap = this.cameras.add(
      this.scale.width - minimapWidth - 10,
      10,
      minimapWidth,
      minimapHeight
    );
    
    this.minimap.setZoom(0.05);
    this.minimap.setBackgroundColor(0x002222);
    this.minimap.startFollow(this.player.sprite);
    this.minimap.setAlpha(0.8);
  }

  setupDayNightCycle() {
    const gameStore = useGameStore.getState();
    
    // Create overlay for night effect
    this.dayNightOverlay = this.add.rectangle(
      0, 0,
      this.physics.world.bounds.width,
      this.physics.world.bounds.height,
      0x000033,
      0
    );
    this.dayNightOverlay.setOrigin(0);
    this.dayNightOverlay.setDepth(999);
    this.dayNightOverlay.setScrollFactor(1);
    
    // Update overlay based on time
    this.time.addEvent({
      delay: 60000, // Every minute
      callback: () => {
        gameStore.advanceTime(1);
        this.updateDayNight();
      },
      loop: true,
    });
    
    this.updateDayNight();
  }

  updateDayNight() {
    const gameStore = useGameStore.getState();
    const time = gameStore.time;
    
    let alpha = 0;
    if (time >= 20 || time < 6) {
      // Night time
      alpha = 0.7;
    } else if (time >= 18 && time < 20) {
      // Dusk
      alpha = (time - 18) * 0.35;
    } else if (time >= 6 && time < 8) {
      // Dawn
      alpha = 0.7 - ((time - 6) * 0.35);
    }
    
    this.dayNightOverlay.setAlpha(alpha);
  }

  setupCollisions() {
    // Player collisions
    this.physics.add.collider(this.player.sprite, this.walls);
    this.physics.add.collider(this.player.sprite, this.buildings);
    
    // Zombie collisions
    this.physics.add.collider(this.zombies, this.walls);
    this.physics.add.collider(this.zombies, this.buildings);
    this.physics.add.collider(this.zombies, this.zombies);
    
    // Player-zombie collision (combat)
    this.physics.add.overlap(
      this.player.sprite,
      this.zombies,
      this.handlePlayerZombieCollision,
      undefined,
      this
    );
    
    // Player-item collision (pickup)
    this.physics.add.overlap(
      this.player.sprite,
      this.items,
      this.handleItemPickup,
      undefined,
      this
    );
  }

  setupInteractions() {
    // Space bar for interact
    this.input.keyboard!.on('keydown-SPACE', () => {
      this.player.attack();
    });
    
    // E key for interact
    this.input.keyboard!.on('keydown-E', () => {
      this.interactWithNearby();
    });
  }

  setupKeyboardShortcuts() {
    // I for inventory
    this.input.keyboard!.on('keydown-I', () => {
      const gameStore = useGameStore.getState();
      gameStore.toggleInventory();
      this.scene.launch('InventoryScene');
    });
    
    // M for map
    this.input.keyboard!.on('keydown-M', () => {
      const gameStore = useGameStore.getState();
      gameStore.toggleMap();
      this.minimap.setVisible(!this.minimap.visible);
    });
    
    // ESC for pause
    this.input.keyboard!.on('keydown-ESC', () => {
      const gameStore = useGameStore.getState();
      gameStore.togglePause();
      if (gameStore.isPaused) {
        this.scene.pause();
      } else {
        this.scene.resume();
      }
    });
  }

  handlePlayerZombieCollision(playerSprite: any, zombieSprite: any) {
    const gameStore = useGameStore.getState();
    const zombie = zombieSprite.getData('entity') as Zombie;
    
    if (this.player.canAttack) {
      zombie.takeDamage(25);
      if (zombie.isDead) {
        gameStore.removeZombie(zombieSprite.getData('id'));
      }
    } else {
      // Player takes damage
      this.player.takeDamage(10);
      gameStore.updatePlayerHealth(this.player.health);
    }
  }

  handleItemPickup(playerSprite: any, itemSprite: any) {
    const gameStore = useGameStore.getState();
    const type = itemSprite.getData('type');
    const id = itemSprite.getData('id');
    
    gameStore.addItem({
      id,
      name: type,
      type: type as any,
      quantity: 1,
      icon: `item_${type}`,
    });
    
    // Show pickup notification
    const text = this.add.text(
      itemSprite.x,
      itemSprite.y - 20,
      `+1 ${type}`,
      {
        fontSize: '14px',
        color: '#00ff00',
      }
    );
    
    this.tweens.add({
      targets: text,
      y: itemSprite.y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy(),
    });
    
    itemSprite.destroy();
  }

  interactWithNearby() {
    // Check for nearby survivors or objects
    const nearbyObjects = this.physics.overlapCirc(
      this.player.sprite.x,
      this.player.sprite.y,
      50
    );
    
    nearbyObjects.forEach((obj: any) => {
      if (obj.getData && obj.getData('type') === 'survivor') {
        this.talkToSurvivor(obj);
      }
    });
  }

  talkToSurvivor(survivor: any) {
    // Show dialogue
    const dialogue = this.add.text(
      this.player.sprite.x,
      this.player.sprite.y - 50,
      'Hello survivor! Want to join my camp?',
      {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 },
      }
    );
    
    this.time.delayedCall(3000, () => {
      dialogue.destroy();
    });
  }

  update(time: number, delta: number) {
    // Update player
    this.player.update(this.cursors, this.wasd);
    
    // Update zombies AI
    this.zombies.children.entries.forEach((zombie: any) => {
      const entity = zombie.getData('entity') as Zombie;
      if (entity) {
        entity.update(this.player.sprite.x, this.player.sprite.y);
      }
    });
    
    // Update game store position
    const gameStore = useGameStore.getState();
    gameStore.setPlayerPosition({
      x: this.player.sprite.x,
      y: this.player.sprite.y,
    });
  }
}