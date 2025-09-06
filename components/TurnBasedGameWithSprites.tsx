'use client';

import { useEffect, useRef, useState } from 'react';
import * as Phaser from 'phaser';
import { EventManager, GameEvent } from '@/lib/events/EventManager';
import { loadAllSprites } from '@/lib/assets/sprites';

// Game types
type ZombieType = 'single' | 'group' | 'swarm';
type NPCFaction = 'survivors' | 'raiders' | 'traders' | 'cannibals' | 'military' | 'cultists';
type NPCAttitude = 'friendly' | 'neutral' | 'hostile';

interface Zombie {
  sprite: Phaser.GameObjects.Sprite;
  type: ZombieType;
  health: number;
  maxHealth: number;
  gridX: number;
  gridY: number;
  detected: boolean;
  detectionChance: number;
}

interface NPC {
  sprite: Phaser.GameObjects.Sprite;
  name: string;
  faction: NPCFaction;
  attitude: NPCAttitude;
  health: number;
  maxHealth: number;
  gridX: number;
  gridY: number;
  items: string[];
}

interface LootItem {
  sprite: Phaser.GameObjects.Sprite;
  type: string;
  gridX: number;
  gridY: number;
}

// Enhanced game scene with sprites
class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private zombies: Zombie[] = [];
  private npcs: NPC[] = [];
  private loot: LootItem[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private turnText!: Phaser.GameObjects.Text;
  private healthText!: Phaser.GameObjects.Text;
  private ammoText!: Phaser.GameObjects.Text;
  private inventoryText!: Phaser.GameObjects.Text;
  private isPlayerTurn = true;
  private playerHealth = 100;
  private playerMaxHealth = 100;
  private playerAmmo = 20;
  private playerInventory: string[] = ['Pistol', 'Knife'];
  private hasGun = true;
  private tileSize = 32;
  private mapSize = 25;
  private playerPos = { x: 12, y: 12 };
  private turnCount = 0;
  private day = 1;
  private eventManager: EventManager;
  private currentEvent: GameEvent | null = null;
  private eventUI: Phaser.GameObjects.Container | null = null;

  constructor() {
    super({ key: 'GameScene' });
    this.eventManager = new EventManager();
  }

  async preload() {
    // Load all sprite assets
    await loadAllSprites(this);
  }

  create() {
    // Create dark tiled background
    this.createBackground();
    
    // Create grid
    this.createGrid();
    
    // Create player sprite
    this.player = this.add.sprite(
      this.playerPos.x * this.tileSize + 16,
      this.playerPos.y * this.tileSize + 16,
      'player'
    );
    this.player.setScale(0.8);
    
    // Initial spawn
    this.spawnInitialEntities();
    
    // Create UI
    this.createUI();
    
    // Setup controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    
    // Handle keyboard input
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      if (this.isPlayerTurn && !this.currentEvent) {
        this.handlePlayerMove(event);
      }
    });
    
    // Handle mouse clicks
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isPlayerTurn && !this.currentEvent) {
        this.handleClick(pointer);
      }
    });
  }

  createBackground() {
    // Create a dark tiled floor
    for (let x = 0; x < this.mapSize; x++) {
      for (let y = 0; y < this.mapSize; y++) {
        const tile = this.add.rectangle(
          x * this.tileSize + 16,
          y * this.tileSize + 16,
          this.tileSize - 1,
          this.tileSize - 1,
          0x1a1a1a
        );
        
        // Add some variation
        if (Math.random() < 0.1) {
          tile.setFillStyle(0x222222);
        } else if (Math.random() < 0.05) {
          tile.setFillStyle(0x0f0f0f);
        }
      }
    }
  }

  spawnInitialEntities() {
    // Spawn initial zombies of different types
    this.spawnZombieByType('single', 3);
    this.spawnZombieByType('group', 1);
    
    // Spawn NPCs
    this.spawnNPCs(3);
    
    // Spawn initial loot
    this.spawnLoot(5);
  }

  createGrid() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.3);
    
    for (let x = 0; x <= this.mapSize; x++) {
      graphics.moveTo(x * this.tileSize, 0);
      graphics.lineTo(x * this.tileSize, this.mapSize * this.tileSize);
    }
    
    for (let y = 0; y <= this.mapSize; y++) {
      graphics.moveTo(0, y * this.tileSize);
      graphics.lineTo(this.mapSize * this.tileSize, y * this.tileSize);
    }
    
    graphics.strokePath();
  }

  createUI() {
    // Create UI background panel
    const uiPanel = this.add.rectangle(640, 35, 1280, 70, 0x000000, 0.8);
    uiPanel.setStrokeStyle(2, 0x444444);
    
    // Turn indicator
    this.turnText = this.add.text(10, 10, 'YOUR TURN - Day 1', {
      fontSize: '20px',
      color: '#4CAF50',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    
    // Health display with bar
    const healthBg = this.add.rectangle(10, 45, 204, 16, 0x000000);
    healthBg.setOrigin(0);
    healthBg.setStrokeStyle(2, 0x444444);
    
    const healthBar = this.add.rectangle(12, 47, 200, 12, 0x00ff00);
    healthBar.setOrigin(0);
    
    this.healthText = this.add.text(220, 45, `HP: ${this.playerHealth}/${this.playerMaxHealth}`, {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    
    // Ammo display
    this.ammoText = this.add.text(400, 10, `🔫 Ammo: ${this.playerAmmo}`, {
      fontSize: '16px',
      color: '#ffcc00',
      fontFamily: 'monospace'
    });
    
    // Inventory display
    this.inventoryText = this.add.text(400, 35, `📦 ${this.playerInventory.join(', ')}`, {
      fontSize: '14px',
      color: '#999999',
      fontFamily: 'monospace'
    });
    
    // Controls help
    this.add.text(640, 680, '[↑↓←→/WASD] Move  [G] Shoot  [E] Pickup  [C] Camp  [Space] End Turn', {
      fontSize: '12px',
      color: '#666666',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
  }

  spawnZombieByType(type: ZombieType, count: number) {
    const spriteKeys = {
      single: 'zombieSingle',
      group: 'zombieGroup',
      swarm: 'zombieSwarm'
    };
    
    const zombieConfigs = {
      single: { health: 30, scale: 0.8 },
      group: { health: 50, scale: 0.9 },
      swarm: { health: 100, scale: 1.0 }
    };
    
    const config = zombieConfigs[type];
    
    for (let i = 0; i < count; i++) {
      let x, y;
      // Ensure zombies spawn at least 5 tiles away from player
      do {
        x = Math.floor(Math.random() * this.mapSize);
        y = Math.floor(Math.random() * this.mapSize);
      } while (Math.abs(x - this.playerPos.x) + Math.abs(y - this.playerPos.y) < 5);
      
      const sprite = this.add.sprite(
        x * this.tileSize + 16,
        y * this.tileSize + 16,
        spriteKeys[type]
      );
      sprite.setScale(config.scale);
      sprite.setInteractive();
      
      // Add health bar above zombie
      const healthBarBg = this.add.rectangle(sprite.x, sprite.y - 20, 30, 4, 0x000000);
      const healthBar = this.add.rectangle(sprite.x, sprite.y - 20, 28, 2, 0xff0000);
      
      const zombie: Zombie = {
        sprite,
        type,
        health: config.health,
        maxHealth: config.health,
        gridX: x,
        gridY: y,
        detected: false,
        detectionChance: 0
      };
      
      sprite.setData('healthBarBg', healthBarBg);
      sprite.setData('healthBar', healthBar);
      sprite.setData('zombie', zombie);
      
      this.zombies.push(zombie);
    }
  }

  spawnNPCs(count: number) {
    const factions: NPCFaction[] = ['survivors', 'raiders', 'traders', 'cannibals', 'military', 'cultists'];
    const attitudes: NPCAttitude[] = ['friendly', 'neutral', 'hostile'];
    const names = ['Alex', 'Sam', 'Jordan', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn'];
    
    const spriteKeys = {
      survivors: 'npcSurvivor',
      raiders: 'npcRaider',
      traders: 'npcTrader',
      cannibals: 'npcRaider',
      military: 'npcSurvivor',
      cultists: 'npcRaider'
    };
    
    for (let i = 0; i < count; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * this.mapSize);
        y = Math.floor(Math.random() * this.mapSize);
      } while (Math.abs(x - this.playerPos.x) + Math.abs(y - this.playerPos.y) < 3);
      
      const faction = factions[Math.floor(Math.random() * factions.length)];
      let attitude: NPCAttitude = attitudes[Math.floor(Math.random() * attitudes.length)];
      
      // Faction-based attitude tendencies
      if (faction === 'raiders' || faction === 'cannibals') {
        attitude = Math.random() < 0.8 ? 'hostile' : 'neutral';
      } else if (faction === 'traders') {
        attitude = Math.random() < 0.7 ? 'neutral' : 'friendly';
      } else if (faction === 'survivors') {
        attitude = Math.random() < 0.6 ? 'friendly' : 'neutral';
      }
      
      const sprite = this.add.sprite(
        x * this.tileSize + 16,
        y * this.tileSize + 16,
        spriteKeys[faction]
      );
      sprite.setScale(0.8);
      sprite.setInteractive();
      
      // Add attitude indicator
      const indicatorColor = attitude === 'friendly' ? 0x00ff00 :
                            attitude === 'neutral' ? 0xffff00 : 0xff0000;
      const indicator = this.add.circle(sprite.x + 10, sprite.y - 10, 3, indicatorColor);
      
      const npc: NPC = {
        sprite,
        name: names[Math.floor(Math.random() * names.length)],
        faction,
        attitude,
        health: 80,
        maxHealth: 80,
        gridX: x,
        gridY: y,
        items: this.generateNPCItems(faction)
      };
      
      sprite.setData('indicator', indicator);
      sprite.setData('npc', npc);
      
      this.npcs.push(npc);
    }
  }

  generateNPCItems(faction: NPCFaction): string[] {
    const items: string[] = [];
    const factionItems = {
      survivors: ['Food', 'Water', 'Bandages'],
      raiders: ['Ammo', 'Knife', 'Food'],
      traders: ['Medicine', 'Ammo', 'Tools'],
      cannibals: ['Meat', 'Knife'],
      military: ['Rifle', 'Ammo', 'MedKit'],
      cultists: ['Herbs', 'Knife', 'Book']
    };
    
    const available = factionItems[faction];
    const itemCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < itemCount; i++) {
      items.push(available[Math.floor(Math.random() * available.length)]);
    }
    
    return items;
  }

  spawnLoot(count: number) {
    const lootTypes = ['Ammo', 'Food', 'Medicine'];
    const spriteKeys: Record<string, string> = {
      'Ammo': 'lootAmmo',
      'Food': 'lootFood',
      'Medicine': 'lootMedicine'
    };
    
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * this.mapSize);
      const y = Math.floor(Math.random() * this.mapSize);
      const lootType = lootTypes[Math.floor(Math.random() * lootTypes.length)];
      
      const sprite = this.add.sprite(
        x * this.tileSize + 16,
        y * this.tileSize + 16,
        spriteKeys[lootType]
      );
      sprite.setScale(0.8);
      
      // Add glow effect
      this.tweens.add({
        targets: sprite,
        alpha: 0.6,
        duration: 1000,
        yoyo: true,
        repeat: -1
      });
      
      const loot: LootItem = {
        sprite,
        type: lootType,
        gridX: x,
        gridY: y
      };
      
      this.loot.push(loot);
    }
  }

  handlePlayerMove(event: KeyboardEvent) {
    let newX = this.playerPos.x;
    let newY = this.playerPos.y;
    let moved = false;
    
    switch(event.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        newX--;
        moved = true;
        this.player.setFlipX(true);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        newX++;
        moved = true;
        this.player.setFlipX(false);
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
        newY--;
        moved = true;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        newY++;
        moved = true;
        break;
      case 'g':
      case 'G':
        this.handleRangedAttack();
        return;
      case 'e':
      case 'E':
        this.pickupLoot();
        return;
      case 'c':
      case 'C':
        this.establishCamp();
        return;
      case ' ':
        this.endPlayerTurn();
        return;
    }
    
    if (moved && newX >= 0 && newX < this.mapSize && newY >= 0 && newY < this.mapSize) {
      // Check for collisions
      const zombie = this.zombies.find(z => 
        z.gridX === newX && z.gridY === newY && z.sprite.active
      );
      
      const npc = this.npcs.find(n => 
        n.gridX === newX && n.gridY === newY && n.sprite.active
      );
      
      if (!zombie && !npc) {
        this.playerPos.x = newX;
        this.playerPos.y = newY;
        
        this.tweens.add({
          targets: this.player,
          x: newX * this.tileSize + 16,
          y: newY * this.tileSize + 16,
          duration: 200
        });
        
        // Check for loot at new position
        this.checkForLoot();
        
        this.endPlayerTurn();
      }
    }
  }

  handleClick(pointer: Phaser.Input.Pointer) {
    const gridX = Math.floor(pointer.x / this.tileSize);
    const gridY = Math.floor(pointer.y / this.tileSize);
    
    // Check if clicking on a zombie
    const zombie = this.zombies.find(z => 
      z.gridX === gridX && z.gridY === gridY && z.sprite.active
    );
    
    if (zombie) {
      const distance = Math.abs(this.playerPos.x - gridX) + Math.abs(this.playerPos.y - gridY);
      
      if (distance <= 1) {
        this.meleeAttack(zombie);
      }
      return;
    }
    
    // Check if clicking on an NPC
    const npc = this.npcs.find(n => 
      n.gridX === gridX && n.gridY === gridY && n.sprite.active
    );
    
    if (npc) {
      const distance = Math.abs(this.playerPos.x - gridX) + Math.abs(this.playerPos.y - gridY);
      
      if (distance <= 1) {
        this.interactWithNPC(npc);
      }
    }
  }

  meleeAttack(target: Zombie | NPC) {
    const baseDamage = 'health' in target && target.health ? 15 : 10;
    const damage = Math.floor(Math.random() * baseDamage) + 10;
    
    if ('type' in target) {
      // It's a zombie
      target.health -= damage;
      
      // Update health bar
      const healthBar = target.sprite.getData('healthBar');
      if (healthBar) {
        const healthPercent = target.health / target.maxHealth;
        healthBar.setScale(healthPercent, 1);
      }
      
      this.showDamage(target.sprite, damage);
      
      // Add hit effect
      this.tweens.add({
        targets: target.sprite,
        tint: 0xff0000,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          target.sprite.clearTint();
        }
      });
      
      if (target.health <= 0) {
        this.killZombie(target);
      }
    } else {
      // It's an NPC
      if (target.attitude === 'hostile') {
        target.health -= damage;
        this.showDamage(target.sprite, damage);
        
        if (target.health <= 0) {
          this.killNPC(target);
        }
      }
    }
    
    this.endPlayerTurn();
  }

  handleRangedAttack() {
    if (this.playerAmmo <= 0) {
      this.showMessage('No ammo!', this.player.x, this.player.y - 30, '#ff0000');
      return;
    }
    
    // Find all targets within range (5 tiles)
    const targets = [...this.zombies, ...this.npcs.filter(n => n.attitude === 'hostile')]
      .filter(t => t.sprite.active);
    
    let closestTarget: Zombie | NPC | null = null;
    let closestDistance = 6;
    
    targets.forEach(target => {
      const distance = Math.abs(this.playerPos.x - target.gridX) + 
                      Math.abs(this.playerPos.y - target.gridY);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestTarget = target;
      }
    });
    
    if (closestTarget) {
      const target = closestTarget as any;
      this.playerAmmo--;
      this.ammoText.setText(`🔫 Ammo: ${this.playerAmmo}`);
      
      // Show bullet trail
      const bullet = this.add.circle(this.player.x, this.player.y, 2, 0xffff00);
      this.tweens.add({
        targets: bullet,
        x: target.sprite.x,
        y: target.sprite.y,
        duration: 100,
        onComplete: () => {
          bullet.destroy();
          
          // Apply damage
          const damage = Math.floor(Math.random() * 20) + 15;
          
          if ('type' in target) {
            target.health -= damage;
            
            // Update health bar
            const healthBar = target.sprite.getData('healthBar');
            if (healthBar) {
              const healthPercent = target.health / target.maxHealth;
              healthBar.setScale(healthPercent, 1);
            }
            
            this.showDamage(target.sprite, damage);
            
            if (target.health <= 0) {
              this.killZombie(target);
            }
          } else {
            target.health -= damage;
            this.showDamage(target.sprite, damage);
            
            if (target.health <= 0) {
              this.killNPC(target);
            }
          }
        }
      });
      
      this.endPlayerTurn();
    } else {
      this.showMessage('No targets in range!', this.player.x, this.player.y - 30, '#ffcc00');
    }
  }

  interactWithNPC(npc: NPC) {
    if (npc.attitude === 'hostile') {
      this.meleeAttack(npc);
    } else {
      // Trade or dialogue
      const message = npc.attitude === 'friendly' 
        ? `${npc.name}: Want to trade?`
        : `${npc.name}: Move along, stranger.`;
      
      this.showMessage(message, npc.sprite.x, npc.sprite.y - 30, '#ffffff', 2000);
      
      if (npc.attitude === 'friendly' && npc.items.length > 0) {
        // Simple trade - give random item
        const item = npc.items.pop()!;
        this.playerInventory.push(item);
        this.inventoryText.setText(`📦 ${this.playerInventory.join(', ')}`);
        this.showMessage(`+${item}`, this.player.x, this.player.y - 30, '#00ff00');
      }
    }
  }

  pickupLoot() {
    const lootAtPosition = this.loot.find(l => 
      l.gridX === this.playerPos.x && l.gridY === this.playerPos.y
    );
    
    if (lootAtPosition) {
      this.playerInventory.push(lootAtPosition.type);
      this.inventoryText.setText(`📦 ${this.playerInventory.join(', ')}`);
      
      // Special handling for ammo
      if (lootAtPosition.type === 'Ammo') {
        this.playerAmmo += 10;
        this.ammoText.setText(`🔫 Ammo: ${this.playerAmmo}`);
      }
      
      // Special handling for medicine
      if (lootAtPosition.type === 'Medicine') {
        this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + 20);
        this.updateHealthBar();
      }
      
      // Remove loot
      lootAtPosition.sprite.destroy();
      this.loot = this.loot.filter(l => l !== lootAtPosition);
      
      this.showMessage(`+${lootAtPosition.type}`, this.player.x, this.player.y - 30, '#00ff00');
    }
  }

  checkForLoot() {
    const lootAtPosition = this.loot.find(l => 
      l.gridX === this.playerPos.x && l.gridY === this.playerPos.y
    );
    
    if (lootAtPosition) {
      this.showMessage(`Press E to pickup ${lootAtPosition.type}`, 
        this.player.x, this.player.y + 30, '#ffff00', 1500);
    }
  }

  establishCamp() {
    // Check if in a safe location (no enemies nearby)
    const enemiesNearby = this.zombies.some(z => {
      const distance = Math.abs(this.playerPos.x - z.gridX) + Math.abs(this.playerPos.y - z.gridY);
      return z.sprite.active && distance <= 3;
    });
    
    const hostileNPCsNearby = this.npcs.some(n => {
      const distance = Math.abs(this.playerPos.x - n.gridX) + Math.abs(this.playerPos.y - n.gridY);
      return n.sprite.active && n.attitude === 'hostile' && distance <= 3;
    });
    
    if (enemiesNearby || hostileNPCsNearby) {
      this.showMessage('Too dangerous to camp here!', this.player.x, this.player.y - 30, '#ff0000');
    } else {
      // Save game state for base building mode
      const gameState = {
        day: this.day,
        health: this.playerHealth,
        maxHealth: this.playerMaxHealth,
        ammo: this.playerAmmo,
        inventory: this.playerInventory,
        position: this.playerPos
      };
      
      // Store in registry for scene transition
      this.registry.set('gameState', gameState);
      
      this.showMessage('Establishing camp...', this.player.x, this.player.y - 30, '#00ff00', 2000);
      
      // Transition to base building scene
      this.time.delayedCall(2000, () => {
        this.scene.launch('BaseBuilderScene');
        this.scene.pause();
      });
    }
  }

  showDamage(target: Phaser.GameObjects.Sprite, damage: number) {
    const damageText = this.add.text(target.x, target.y - 20, `-${damage}`, {
      fontSize: '14px',
      color: '#ff0000',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    
    this.tweens.add({
      targets: damageText,
      y: target.y - 40,
      alpha: 0,
      duration: 1000,
      onComplete: () => damageText.destroy()
    });
  }

  showMessage(text: string, x: number, y: number, color: string, duration: number = 1000) {
    const message = this.add.text(x, y, text, {
      fontSize: '12px',
      color: color,
      fontFamily: 'monospace',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: message,
      alpha: 0,
      duration: duration,
      onComplete: () => message.destroy()
    });
  }

  killZombie(zombie: Zombie) {
    // Death animation
    this.tweens.add({
      targets: zombie.sprite,
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      duration: 300,
      onComplete: () => {
        zombie.sprite.setActive(false);
        zombie.sprite.setVisible(false);
        
        // Clean up health bars
        const healthBarBg = zombie.sprite.getData('healthBarBg');
        const healthBar = zombie.sprite.getData('healthBar');
        if (healthBarBg) healthBarBg.destroy();
        if (healthBar) healthBar.destroy();
      }
    });
    
    // Drop loot
    if (Math.random() < 0.5) {
      const lootTypes = ['Ammo', 'Food', 'Medicine'];
      const lootType = lootTypes[Math.floor(Math.random() * lootTypes.length)];
      const spriteKeys: Record<string, string> = {
        'Ammo': 'lootAmmo',
        'Food': 'lootFood',
        'Medicine': 'lootMedicine'
      };
      
      const sprite = this.add.sprite(
        zombie.gridX * this.tileSize + 16,
        zombie.gridY * this.tileSize + 16,
        spriteKeys[lootType]
      );
      sprite.setScale(0.8);
      
      this.tweens.add({
        targets: sprite,
        alpha: 0.6,
        duration: 1000,
        yoyo: true,
        repeat: -1
      });
      
      this.loot.push({
        sprite,
        type: lootType,
        gridX: zombie.gridX,
        gridY: zombie.gridY
      });
    }
  }

  killNPC(npc: NPC) {
    // NPCs turn into zombies when killed!
    const indicator = npc.sprite.getData('indicator');
    if (indicator) indicator.destroy();
    
    // Fade out NPC
    this.tweens.add({
      targets: npc.sprite,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        npc.sprite.setActive(false);
        npc.sprite.setVisible(false);
        
        // Spawn a zombie at the NPC's location
        const zombieSprite = this.add.sprite(
          npc.gridX * this.tileSize + 16,
          npc.gridY * this.tileSize + 16,
          'zombieSingle'
        );
        zombieSprite.setScale(0.8);
        zombieSprite.setInteractive();
        
        // Add health bar
        const healthBarBg = this.add.rectangle(zombieSprite.x, zombieSprite.y - 20, 30, 4, 0x000000);
        const healthBar = this.add.rectangle(zombieSprite.x, zombieSprite.y - 20, 28, 2, 0xff0000);
        
        const zombie: Zombie = {
          sprite: zombieSprite,
          type: 'single',
          health: 30,
          maxHealth: 30,
          gridX: npc.gridX,
          gridY: npc.gridY,
          detected: true,
          detectionChance: 1
        };
        
        zombieSprite.setData('healthBarBg', healthBarBg);
        zombieSprite.setData('healthBar', healthBar);
        zombieSprite.setData('zombie', zombie);
        
        this.zombies.push(zombie);
        
        // Drop NPC's items
        npc.items.forEach(item => {
          if (Math.random() < 0.7) {
            const spriteKeys: Record<string, string> = {
              'Ammo': 'lootAmmo',
              'Food': 'lootFood',
              'Medicine': 'lootMedicine',
              'Water': 'lootFood',
              'Bandages': 'lootMedicine',
              'Knife': 'lootAmmo',
              'Rifle': 'lootAmmo',
              'MedKit': 'lootMedicine',
              'Tools': 'lootAmmo',
              'Meat': 'lootFood',
              'Herbs': 'lootMedicine',
              'Book': 'lootMedicine'
            };
            
            const spriteKey = spriteKeys[item] || 'lootFood';
            const sprite = this.add.sprite(
              npc.gridX * this.tileSize + 16 + Math.random() * 10 - 5,
              npc.gridY * this.tileSize + 16 + Math.random() * 10 - 5,
              spriteKey
            );
            sprite.setScale(0.6);
            
            this.loot.push({
              sprite,
              type: item,
              gridX: npc.gridX,
              gridY: npc.gridY
            });
          }
        });
        
        this.showMessage(`${npc.name} has turned!`, zombieSprite.x, zombieSprite.y, '#ff0000', 2000);
      }
    });
  }

  updateHealthBar() {
    const healthPercent = this.playerHealth / this.playerMaxHealth;
    this.healthText.setText(`HP: ${this.playerHealth}/${this.playerMaxHealth}`);
    
    // Update health bar color based on health
    let color = '#00ff00';
    if (healthPercent < 0.3) color = '#ff0000';
    else if (healthPercent < 0.6) color = '#ffff00';
    
    this.healthText.setColor(color);
  }

  endPlayerTurn() {
    this.isPlayerTurn = false;
    this.turnCount++;
    
    // Check for new day
    if (this.turnCount % 20 === 0) {
      this.day++;
      this.spawnNewEntities();
    }
    
    // Update detection for all zombies
    this.updateZombieDetection();
    
    this.turnText.setText(`ZOMBIES TURN - Day ${this.day}`);
    this.turnText.setColor('#ff0000');
    
    // Process zombie turns
    this.time.delayedCall(500, () => {
      this.processZombieTurns();
    });
  }

  updateZombieDetection() {
    this.zombies.forEach(zombie => {
      if (!zombie.sprite.active) return;
      
      const distance = Math.abs(this.playerPos.x - zombie.gridX) + 
                      Math.abs(this.playerPos.y - zombie.gridY);
      
      // Distance-based detection probability
      let detectionChance = 0;
      if (distance <= 2) {
        detectionChance = 0.9;
      } else if (distance <= 4) {
        detectionChance = 0.6;
      } else if (distance <= 6) {
        detectionChance = 0.3;
      } else if (distance <= 8) {
        detectionChance = 0.1;
      }
      
      // Swarms have better detection
      if (zombie.type === 'swarm') {
        detectionChance = Math.min(1, detectionChance * 1.5);
      }
      
      // Check if zombie detects player this turn
      if (!zombie.detected && Math.random() < detectionChance) {
        zombie.detected = true;
        this.showMessage('!', zombie.sprite.x, zombie.sprite.y - 20, '#ff0000');
      }
      
      zombie.detectionChance = detectionChance;
    });
  }

  spawnNewEntities() {
    // Spawn new zombies based on day
    const spawnChance = Math.min(0.8, 0.3 + (this.day * 0.05));
    
    if (Math.random() < spawnChance) {
      const rand = Math.random();
      let type: ZombieType;
      
      if (this.day < 3) {
        type = rand < 0.9 ? 'single' : 'group';
      } else if (this.day < 7) {
        if (rand < 0.6) type = 'single';
        else if (rand < 0.95) type = 'group';
        else type = 'swarm';
      } else {
        if (rand < 0.4) type = 'single';
        else if (rand < 0.8) type = 'group';
        else type = 'swarm';
      }
      
      const count = type === 'single' ? Math.floor(Math.random() * 3) + 1 :
                   type === 'group' ? 1 : 1;
      
      this.spawnZombieByType(type, count);
      this.showMessage(`New ${type} zombie${count > 1 ? 's' : ''} approaching!`, 
        640, 360, '#ff0000', 2000);
    }
    
    // Spawn new NPCs occasionally
    if (Math.random() < 0.3) {
      this.spawnNPCs(1);
      this.showMessage('A survivor has been spotted!', 640, 380, '#4169E1', 2000);
    }
    
    // Spawn loot
    if (Math.random() < 0.4) {
      this.spawnLoot(Math.floor(Math.random() * 3) + 1);
    }
    
    // Generate a procedural event
    this.generateDailyEvent();
  }

  async generateDailyEvent() {
    // 50% chance for an event each day
    if (Math.random() < 0.5) {
      const context = {
        health: this.playerHealth,
        resources: {
          food: this.playerInventory.filter(i => i === 'Food').length,
          water: this.playerInventory.filter(i => i === 'Water').length,
          medicine: this.playerInventory.filter(i => i === 'Medicine').length,
          ammo: this.playerAmmo
        },
        survivors: this.npcs.filter(n => n.attitude === 'friendly').length + 1
      };
      
      // Try to generate event with API, fallback to local
      let event = await this.eventManager.generateDailyEvent(this.day, context);
      
      if (!event) {
        // Use fallback event if API fails
        event = this.eventManager.generateFallbackEvent(this.day);
      }
      
      if (event) {
        this.currentEvent = event;
        this.displayEvent(event);
      }
    }
  }

  displayEvent(event: GameEvent) {
    // Pause game during event
    this.isPlayerTurn = false;
    
    // Create event UI
    this.eventUI = this.add.container(640, 360);
    
    // Background
    const bg = this.add.rectangle(0, 0, 600, 400, 0x000000, 0.95);
    bg.setStrokeStyle(3, 0x444444);
    if (this.eventUI) {
      this.eventUI.add(bg);
    }
    
    // Event type indicator
    const typeColor = event.type === 'crisis' ? '#ff0000' :
                     event.type === 'encounter' ? '#4169E1' :
                     event.type === 'discovery' ? '#00ff00' : '#ffcc00';
    
    const typeText = this.add.text(0, -180, event.type.toUpperCase(), {
      fontSize: '14px',
      color: typeColor,
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    if (this.eventUI) {
      this.eventUI.add(typeText);
    }
    
    // Title
    const titleText = this.add.text(0, -150, event.title, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    if (this.eventUI) {
      this.eventUI.add(titleText);
    }
    
    // Description
    const descText = this.add.text(0, -80, event.description, {
      fontSize: '14px',
      color: '#cccccc',
      fontFamily: 'monospace',
      wordWrap: { width: 550 },
      align: 'center'
    }).setOrigin(0.5);
    if (this.eventUI) {
      this.eventUI.add(descText);
    }
    
    // Choices
    event.choices.forEach((choice, index) => {
      const y = 20 + index * 60;
      
      const choiceBtn = this.add.rectangle(0, y, 500, 50, 0x222222);
      choiceBtn.setStrokeStyle(2, 0x666666);
      choiceBtn.setInteractive();
      if (this.eventUI) {
        this.eventUI.add(choiceBtn);
      }
      
      const choiceText = this.add.text(0, y, choice.text, {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'monospace'
      }).setOrigin(0.5);
      if (this.eventUI) {
        this.eventUI.add(choiceText);
      }
      
      choiceBtn.on('pointerover', () => {
        choiceBtn.setFillStyle(0x333333);
        choiceBtn.setStrokeStyle(2, 0x00ff00);
      });
      
      choiceBtn.on('pointerout', () => {
        choiceBtn.setFillStyle(0x222222);
        choiceBtn.setStrokeStyle(2, 0x666666);
      });
      
      choiceBtn.on('pointerdown', () => {
        this.handleEventChoice(event, choice);
      });
    });
  }

  handleEventChoice(event: GameEvent, choice: any) {
    // Apply effects
    const effects = choice.outcome.effects;
    
    if (effects.health) {
      this.playerHealth = Math.max(0, Math.min(this.playerMaxHealth, this.playerHealth + effects.health));
      this.updateHealthBar();
    }
    
    if (effects.ammo) {
      this.playerAmmo = Math.max(0, this.playerAmmo + effects.ammo);
      this.ammoText.setText(`🔫 Ammo: ${this.playerAmmo}`);
    }
    
    if (effects.food) {
      for (let i = 0; i < Math.abs(effects.food); i++) {
        if (effects.food > 0) {
          this.playerInventory.push('Food');
        } else {
          const idx = this.playerInventory.indexOf('Food');
          if (idx > -1) this.playerInventory.splice(idx, 1);
        }
      }
      this.inventoryText.setText(`📦 ${this.playerInventory.join(', ')}`);
    }
    
    // Spawn zombies if specified
    if (choice.outcome.spawnZombies) {
      this.spawnZombieByType('single', choice.outcome.spawnZombies);
    }
    
    // Show outcome
    this.showMessage(choice.outcome.description, 640, 500, '#ffffff', 3000);
    
    // Mark event as processed
    this.eventManager.markEventProcessed(event.id);
    this.currentEvent = null;
    
    // Remove event UI
    if (this.eventUI) {
      this.tweens.add({
        targets: this.eventUI,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          this.eventUI?.destroy();
          this.eventUI = null;
          // Continue with zombie turns
          this.processZombieTurns();
        }
      });
    }
  }

  processZombieTurns() {
    let zombieIndex = 0;
    
    const moveNextZombie = () => {
      if (zombieIndex >= this.zombies.length) {
        // Process NPC turns
        this.processNPCTurns();
        return;
      }
      
      const zombie = this.zombies[zombieIndex];
      zombieIndex++;
      
      if (!zombie.sprite.active) {
        moveNextZombie();
        return;
      }
      
      // Update health bar position
      const healthBarBg = zombie.sprite.getData('healthBarBg');
      const healthBar = zombie.sprite.getData('healthBar');
      if (healthBarBg) {
        healthBarBg.setPosition(zombie.sprite.x, zombie.sprite.y - 20);
      }
      if (healthBar) {
        healthBar.setPosition(zombie.sprite.x, zombie.sprite.y - 20);
      }
      
      const distance = Math.abs(this.playerPos.x - zombie.gridX) + 
                      Math.abs(this.playerPos.y - zombie.gridY);
      
      // Only move if detected or very close
      if (zombie.detected || distance <= 2) {
        let newX = zombie.gridX;
        let newY = zombie.gridY;
        
        // Smarter pathfinding based on zombie type
        if (zombie.type === 'swarm') {
          // Swarms are more aggressive
          if (zombie.gridX < this.playerPos.x) newX++;
          else if (zombie.gridX > this.playerPos.x) newX--;
          
          if (zombie.gridY < this.playerPos.y) newY++;
          else if (zombie.gridY > this.playerPos.y) newY--;
        } else {
          // Singles and groups move more randomly
          const moveRandom = Math.random() < 0.3;
          
          if (moveRandom) {
            // Random movement
            const dir = Math.floor(Math.random() * 4);
            switch(dir) {
              case 0: newX++; break;
              case 1: newX--; break;
              case 2: newY++; break;
              case 3: newY--; break;
            }
          } else {
            // Move towards player
            if (Math.random() < 0.5) {
              if (zombie.gridX < this.playerPos.x) newX++;
              else if (zombie.gridX > this.playerPos.x) newX--;
            } else {
              if (zombie.gridY < this.playerPos.y) newY++;
              else if (zombie.gridY > this.playerPos.y) newY--;
            }
          }
        }
        
        // Check bounds
        newX = Math.max(0, Math.min(this.mapSize - 1, newX));
        newY = Math.max(0, Math.min(this.mapSize - 1, newY));
        
        // Check for collision with other zombies
        const blocked = this.zombies.some(z => 
          z !== zombie && z.sprite.active && z.gridX === newX && z.gridY === newY
        );
        
        if (!blocked) {
          // Check if moving to player position
          if (newX === this.playerPos.x && newY === this.playerPos.y) {
            // Attack player
            const baseDamage = zombie.type === 'single' ? 5 : 
                              zombie.type === 'group' ? 10 : 15;
            const damage = Math.floor(Math.random() * baseDamage) + baseDamage;
            
            this.playerHealth -= damage;
            this.updateHealthBar();
            
            this.showDamage(this.player, damage);
            
            // Add hit effect on player
            this.tweens.add({
              targets: this.player,
              tint: 0xff0000,
              duration: 100,
              yoyo: true,
              onComplete: () => {
                this.player.clearTint();
              }
            });
            
            if (this.playerHealth <= 0) {
              this.gameOver();
            }
            
            // Flash screen red
            this.cameras.main.flash(200, 255, 0, 0, false);
            
            this.time.delayedCall(300, moveNextZombie);
          } else if (newX !== zombie.gridX || newY !== zombie.gridY) {
            // Move zombie
            zombie.gridX = newX;
            zombie.gridY = newY;
            
            this.tweens.add({
              targets: [zombie.sprite, healthBarBg, healthBar],
              x: newX * this.tileSize + 16,
              y: newY * this.tileSize + 16,
              duration: 200,
              onComplete: moveNextZombie
            });
          } else {
            moveNextZombie();
          }
        } else {
          moveNextZombie();
        }
      } else {
        // Not detected, maybe wander randomly
        if (Math.random() < 0.2) {
          const dir = Math.floor(Math.random() * 4);
          let newX = zombie.gridX;
          let newY = zombie.gridY;
          
          switch(dir) {
            case 0: newX++; break;
            case 1: newX--; break;
            case 2: newY++; break;
            case 3: newY--; break;
          }
          
          newX = Math.max(0, Math.min(this.mapSize - 1, newX));
          newY = Math.max(0, Math.min(this.mapSize - 1, newY));
          
          zombie.gridX = newX;
          zombie.gridY = newY;
          
          this.tweens.add({
            targets: [zombie.sprite, healthBarBg, healthBar],
            x: newX * this.tileSize + 16,
            y: newY * this.tileSize + 16,
            duration: 200,
            onComplete: moveNextZombie
          });
        } else {
          moveNextZombie();
        }
      }
    };
    
    moveNextZombie();
  }

  processNPCTurns() {
    let npcIndex = 0;
    
    const moveNextNPC = () => {
      if (npcIndex >= this.npcs.length) {
        // All NPCs moved, back to player
        this.isPlayerTurn = true;
        this.turnText.setText(`YOUR TURN - Day ${this.day}`);
        this.turnText.setColor('#4CAF50');
        
        // Auto-heal small amount each turn
        if (this.playerHealth < this.playerMaxHealth) {
          this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + 1);
          this.updateHealthBar();
        }
        return;
      }
      
      const npc = this.npcs[npcIndex];
      npcIndex++;
      
      if (!npc.sprite.active) {
        moveNextNPC();
        return;
      }
      
      // Update indicator position
      const indicator = npc.sprite.getData('indicator');
      if (indicator) {
        indicator.setPosition(npc.sprite.x + 10, npc.sprite.y - 10);
      }
      
      const distance = Math.abs(this.playerPos.x - npc.gridX) + 
                      Math.abs(this.playerPos.y - npc.gridY);
      
      // NPC behavior based on attitude
      if (npc.attitude === 'hostile' && distance <= 5) {
        // Hostile NPCs attack
        let newX = npc.gridX;
        let newY = npc.gridY;
        
        if (npc.gridX < this.playerPos.x) newX++;
        else if (npc.gridX > this.playerPos.x) newX--;
        
        if (npc.gridY < this.playerPos.y) newY++;
        else if (npc.gridY > this.playerPos.y) newY--;
        
        if (newX === this.playerPos.x && newY === this.playerPos.y) {
          // Attack player
          const damage = Math.floor(Math.random() * 8) + 7;
          this.playerHealth -= damage;
          this.updateHealthBar();
          
          this.showMessage(`${npc.name} attacks!`, npc.sprite.x, npc.sprite.y - 20, '#ff0000');
          this.showDamage(this.player, damage);
          
          if (this.playerHealth <= 0) {
            this.gameOver();
          }
          
          this.time.delayedCall(300, moveNextNPC);
        } else {
          // Move NPC
          npc.gridX = newX;
          npc.gridY = newY;
          
          this.tweens.add({
            targets: [npc.sprite, indicator],
            x: newX * this.tileSize + 16,
            y: newY * this.tileSize + 16,
            duration: 200,
            onComplete: moveNextNPC
          });
        }
      } else if (npc.attitude === 'friendly' && distance <= 3) {
        // Friendly NPCs might flee from zombies
        const nearbyZombie = this.zombies.find(z => {
          const zDist = Math.abs(npc.gridX - z.gridX) + Math.abs(npc.gridY - z.gridY);
          return z.sprite.active && zDist <= 2;
        });
        
        if (nearbyZombie) {
          // Flee from zombie
          let newX = npc.gridX;
          let newY = npc.gridY;
          
          if (nearbyZombie.gridX < npc.gridX) newX++;
          else if (nearbyZombie.gridX > npc.gridX) newX--;
          
          if (nearbyZombie.gridY < npc.gridY) newY++;
          else if (nearbyZombie.gridY > npc.gridY) newY--;
          
          newX = Math.max(0, Math.min(this.mapSize - 1, newX));
          newY = Math.max(0, Math.min(this.mapSize - 1, newY));
          
          npc.gridX = newX;
          npc.gridY = newY;
          
          this.showMessage('Help!', npc.sprite.x, npc.sprite.y - 20, '#ffffff');
          
          this.tweens.add({
            targets: [npc.sprite, indicator],
            x: newX * this.tileSize + 16,
            y: newY * this.tileSize + 16,
            duration: 200,
            onComplete: moveNextNPC
          });
        } else {
          moveNextNPC();
        }
      } else {
        moveNextNPC();
      }
    };
    
    moveNextNPC();
  }

  gameOver() {
    this.isPlayerTurn = false;
    this.healthText.setText('DEAD');
    this.healthText.setColor('#ff0000');
    
    // Death animation for player
    this.tweens.add({
      targets: this.player,
      angle: 90,
      alpha: 0.5,
      duration: 500
    });
    
    const gameOverBg = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.8);
    
    this.add.text(640, 300, 'YOU DIED', {
      fontSize: '64px',
      color: '#ff0000',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);
    
    this.add.text(640, 380, `Survived ${this.day} days`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    this.add.text(640, 420, `Zombies killed: ${this.zombies.filter(z => !z.sprite.active).length}`, {
      fontSize: '18px',
      color: '#999999',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    this.add.text(640, 480, 'Press F5 to restart', {
      fontSize: '18px',
      color: '#666666',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
  }
}

// Import base builder scene
import { BaseBuilderScene } from './BaseBuilderScene';

export default function TurnBasedGameWithSprites() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && containerRef.current && !gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: 1280,
        height: 720,
        backgroundColor: '#0a0a0a',
        scene: [GameScene, BaseBuilderScene],
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
          }
        },
        pixelArt: true,
        antialias: false
      };
      
      gameRef.current = new Phaser.Game(config);
      setIsLoading(false);
    }
    
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center">
      <div className="mb-4 text-center">
        <h1 className="text-6xl font-bold text-red-700 tracking-wider mb-2 
                     drop-shadow-[0_0_20px_rgba(185,28,28,0.5)]">
          DEADGRID
        </h1>
        <p className="text-gray-400 text-lg italic">Turn-Based Zombie Survival</p>
      </div>

      <div className="relative">
        <div 
          ref={containerRef} 
          className="border-4 border-gray-800 shadow-2xl rounded-lg overflow-hidden"
          style={{
            boxShadow: '0 0 50px rgba(0,0,0,0.9), inset 0 0 30px rgba(0,0,0,0.5)'
          }}
        />
      </div>

      <div className="mt-6 text-gray-400 text-sm text-center max-w-4xl">
        <p className="mb-2">🎮 A post-apocalyptic survival game with procedural generation</p>
        <p className="text-xs text-gray-600">Three zombie types • Six NPC factions • Base building • Dynamic events</p>
      </div>
    </div>
  );
}