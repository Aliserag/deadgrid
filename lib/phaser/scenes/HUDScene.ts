import * as Phaser from 'phaser';
import { useGameStore } from '../store/gameStore';

export class HUDScene extends Phaser.Scene {
  private healthBar!: Phaser.GameObjects.Graphics;
  private staminaBar!: Phaser.GameObjects.Graphics;
  private healthText!: Phaser.GameObjects.Text;
  private ammoText!: Phaser.GameObjects.Text;
  private dayText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private resourcesText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'HUDScene' });
  }

  create() {
    this.createHealthBar();
    this.createStatsDisplay();
    this.createResourceDisplay();
    this.createActionButtons();
    
    // Update HUD every frame
    this.time.addEvent({
      delay: 100,
      callback: this.updateHUD,
      callbackScope: this,
      loop: true
    });
  }

  createHealthBar() {
    // Background
    const barBg = this.add.rectangle(10, 10, 204, 24, 0x000000);
    barBg.setOrigin(0);
    barBg.setStrokeStyle(2, 0x333333);
    
    // Health bar
    this.healthBar = this.add.graphics();
    this.updateHealthBar();
    
    // Stamina bar background
    const staminaBg = this.add.rectangle(10, 40, 204, 16, 0x000000);
    staminaBg.setOrigin(0);
    staminaBg.setStrokeStyle(2, 0x333333);
    
    // Stamina bar
    this.staminaBar = this.add.graphics();
    this.updateStaminaBar();
    
    // Health text
    this.healthText = this.add.text(12, 12, 'HP: 100/100', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
  }

  createStatsDisplay() {
    // Day counter
    this.dayText = this.add.text(250, 10, 'Day 1', {
      fontSize: '18px',
      color: '#ffcc00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    
    // Score
    this.scoreText = this.add.text(250, 35, 'Score: 0', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    
    // Ammo
    this.ammoText = this.add.text(400, 10, 'Ammo: 20', {
      fontSize: '14px',
      color: '#ffff00',
      fontFamily: 'monospace'
    });
  }

  createResourceDisplay() {
    // Resources panel
    const resourceBg = this.add.rectangle(1270, 10, 250, 100, 0x000000);
    resourceBg.setOrigin(1, 0);
    resourceBg.setStrokeStyle(2, 0x333333);
    resourceBg.setAlpha(0.8);
    
    this.resourcesText = this.add.text(1040, 20, '', {
      fontSize: '12px',
      color: '#cccccc',
      fontFamily: 'monospace'
    });
    
    this.updateResources();
  }

  createActionButtons() {
    // Quick action buttons
    const buttons = [
      { x: 10, y: 680, text: '[I]nventory', key: 'I' },
      { x: 120, y: 680, text: '[B]ase', key: 'B' },
      { x: 200, y: 680, text: '[M]ap', key: 'M' },
      { x: 270, y: 680, text: '[Space] End Turn', key: 'SPACE' }
    ];
    
    buttons.forEach(btn => {
      const bg = this.add.rectangle(btn.x, btn.y, 100, 30, 0x222222);
      bg.setOrigin(0, 1);
      bg.setStrokeStyle(1, 0x444444);
      bg.setInteractive();
      
      const text = this.add.text(btn.x + 50, btn.y - 15, btn.text, {
        fontSize: '11px',
        color: '#999999',
        fontFamily: 'monospace'
      });
      text.setOrigin(0.5);
      
      bg.on('pointerover', () => {
        bg.setFillStyle(0x333333);
        text.setColor('#ffffff');
      });
      
      bg.on('pointerout', () => {
        bg.setFillStyle(0x222222);
        text.setColor('#999999');
      });
      
      bg.on('pointerdown', () => {
        this.input.keyboard!.emit(`keydown-${btn.key}`);
      });
    });
  }

  updateHUD() {
    this.updateHealthBar();
    this.updateStaminaBar();
    this.updateStats();
    this.updateResources();
  }

  updateHealthBar() {
    const gameStore = useGameStore.getState();
    const healthPercent = gameStore.player.health / gameStore.player.maxHealth;
    
    this.healthBar.clear();
    
    // Health bar fill
    let color = 0x00ff00;
    if (healthPercent < 0.3) color = 0xff0000;
    else if (healthPercent < 0.6) color = 0xffff00;
    
    this.healthBar.fillStyle(color);
    this.healthBar.fillRect(12, 12, 200 * healthPercent, 20);
    
    // Update text
    this.healthText?.setText(`HP: ${Math.floor(gameStore.player.health)}/${gameStore.player.maxHealth}`);
  }

  updateStaminaBar() {
    const gameStore = useGameStore.getState();
    const staminaPercent = gameStore.player.stamina / gameStore.player.maxStamina;
    
    this.staminaBar.clear();
    this.staminaBar.fillStyle(0x0099ff);
    this.staminaBar.fillRect(12, 42, 200 * staminaPercent, 12);
  }

  updateStats() {
    const gameStore = useGameStore.getState();
    
    this.dayText?.setText(`Day ${gameStore.day}`);
    this.scoreText?.setText(`Score: ${(gameStore.player as any).score || 0}`);
    this.ammoText?.setText(`Ammo: ${gameStore.resources.ammo}`);
  }

  updateResources() {
    const gameStore = useGameStore.getState();
    const resources = gameStore.resources;
    
    const text = `Resources:
Food: ${resources.food}
Water: ${resources.water}
Medicine: ${resources.medicine}
Materials: ${resources.materials}`;
    
    this.resourcesText?.setText(text);
  }
}