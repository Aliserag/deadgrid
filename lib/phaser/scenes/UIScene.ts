import * as Phaser from 'phaser';
import { useGameStore } from '../store/gameStore';

export class UIScene extends Phaser.Scene {
  private healthText!: Phaser.GameObjects.Text;
  private staminaText!: Phaser.GameObjects.Text;
  private dayText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private resourcesText!: Phaser.GameObjects.Text;
  private inventoryButton!: Phaser.GameObjects.Rectangle;
  private mapButton!: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    // Make this scene always on top
    this.scene.bringToTop();
    
    // Create HUD background
    const hudBg = this.add.rectangle(0, 0, 1280, 80, 0x000000, 0.7);
    hudBg.setOrigin(0);
    
    // Health and Stamina
    this.healthText = this.add.text(20, 20, 'Health: 100/100', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#00ff00',
    });
    
    this.staminaText = this.add.text(20, 45, 'Stamina: 100/100', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#0099ff',
    });
    
    // Day and Time
    this.dayText = this.add.text(300, 20, 'Day 1', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    
    this.timeText = this.add.text(300, 45, '08:00 AM', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#cccccc',
    });
    
    // Resources
    this.resourcesText = this.add.text(500, 20, '', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff',
    });
    
    // Inventory button
    this.inventoryButton = this.add.rectangle(1100, 40, 80, 40, 0x333333);
    this.inventoryButton.setInteractive({ useHandCursor: true });
    
    const inventoryText = this.add.text(1100, 40, 'Inventory', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffffff',
    });
    inventoryText.setOrigin(0.5);
    
    this.inventoryButton.on('pointerover', () => {
      this.inventoryButton.setFillStyle(0x555555);
    });
    
    this.inventoryButton.on('pointerout', () => {
      this.inventoryButton.setFillStyle(0x333333);
    });
    
    this.inventoryButton.on('pointerdown', () => {
      this.toggleInventory();
    });
    
    // Map button
    this.mapButton = this.add.rectangle(1200, 40, 60, 40, 0x333333);
    this.mapButton.setInteractive({ useHandCursor: true });
    
    const mapText = this.add.text(1200, 40, 'Map', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffffff',
    });
    mapText.setOrigin(0.5);
    
    this.mapButton.on('pointerover', () => {
      this.mapButton.setFillStyle(0x555555);
    });
    
    this.mapButton.on('pointerout', () => {
      this.mapButton.setFillStyle(0x333333);
    });
    
    this.mapButton.on('pointerdown', () => {
      this.toggleMap();
    });
    
    // Quick slots
    this.createQuickSlots();
    
    // Update loop
    this.time.addEvent({
      delay: 100,
      callback: this.updateUI,
      callbackScope: this,
      loop: true,
    });
  }

  createQuickSlots() {
    const slotSize = 50;
    const slotSpacing = 10;
    const startX = 540;
    const startY = 650;
    
    for (let i = 0; i < 5; i++) {
      const x = startX + (i * (slotSize + slotSpacing));
      
      // Slot background
      const slot = this.add.rectangle(x, startY, slotSize, slotSize, 0x333333, 0.8);
      slot.setStrokeStyle(2, 0x666666);
      
      // Slot number
      const slotNumber = this.add.text(x - slotSize/2 + 5, startY - slotSize/2 + 5, `${i + 1}`, {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#999999',
      });
      
      // Keyboard shortcut
      this.input.keyboard!.on(`keydown-${i + 1}`, () => {
        this.useQuickSlot(i);
      });
    }
  }

  useQuickSlot(index: number) {
    const gameStore = useGameStore.getState();
    const inventory = gameStore.inventory;
    
    if (inventory[index]) {
      const item = inventory[index];
      
      // Use item based on type
      switch (item.type) {
        case 'food':
          gameStore.updatePlayerHealth(gameStore.player.health + 20);
          this.showNotification('Used food: +20 Health');
          break;
        case 'medicine':
          gameStore.updatePlayerHealth(gameStore.player.maxHealth);
          this.showNotification('Used medicine: Full Health');
          break;
        case 'weapon':
          gameStore.equipWeapon(item);
          this.showNotification(`Equipped ${item.name}`);
          break;
      }
      
      // Remove consumable items
      if (item.type !== 'weapon') {
        gameStore.removeItem(item.id, 1);
      }
    }
  }

  showNotification(text: string) {
    const notification = this.add.text(640, 360, text, {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 },
    });
    notification.setOrigin(0.5);
    notification.setAlpha(0);
    
    this.tweens.add({
      targets: notification,
      alpha: 1,
      duration: 300,
      yoyo: true,
      hold: 1000,
      onComplete: () => notification.destroy(),
    });
  }

  toggleInventory() {
    const gameStore = useGameStore.getState();
    gameStore.toggleInventory();
    
    if (gameStore.showInventory) {
      this.scene.launch('InventoryScene');
    } else {
      this.scene.stop('InventoryScene');
    }
  }

  toggleMap() {
    const gameStore = useGameStore.getState();
    gameStore.toggleMap();
    this.showNotification(gameStore.showMap ? 'Map Enabled' : 'Map Disabled');
  }

  updateUI() {
    const gameStore = useGameStore.getState();
    const { player, day, time, resources } = gameStore;
    
    // Update health
    this.healthText.setText(`Health: ${Math.floor(player.health)}/${player.maxHealth}`);
    const healthPercent = player.health / player.maxHealth;
    if (healthPercent > 0.5) {
      this.healthText.setColor('#00ff00');
    } else if (healthPercent > 0.25) {
      this.healthText.setColor('#ffff00');
    } else {
      this.healthText.setColor('#ff0000');
    }
    
    // Update stamina
    this.staminaText.setText(`Stamina: ${Math.floor(player.stamina)}/${player.maxStamina}`);
    
    // Update day/time
    this.dayText.setText(`Day ${day}`);
    const hours = Math.floor(time);
    const minutes = Math.floor((time - hours) * 60);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    this.timeText.setText(`${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`);
    
    // Update phase color
    if (gameStore.phase === 'night') {
      this.timeText.setColor('#9999ff');
    } else {
      this.timeText.setColor('#cccccc');
    }
    
    // Update resources
    this.resourcesText.setText(
      `Food: ${resources.food} | Water: ${resources.water} | Medicine: ${resources.medicine} | Ammo: ${resources.ammo}`
    );
  }
}