import * as Phaser from 'phaser';
import { useGameStore } from '../store/gameStore';

export class InventoryScene extends Phaser.Scene {
  private inventoryGrid!: Phaser.GameObjects.Group;
  private selectedItem: any = null;

  constructor() {
    super({ key: 'InventoryScene' });
  }

  create() {
    // Pause the game scene
    this.scene.pause('GameScene');
    
    // Dark overlay
    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.8);
    overlay.setInteractive(); // Blocks clicks to game scene
    
    // Inventory window
    const windowBg = this.add.rectangle(640, 360, 800, 600, 0x222222);
    windowBg.setStrokeStyle(3, 0x666666);
    
    // Title
    const title = this.add.text(640, 100, 'INVENTORY', {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);
    
    // Close button
    const closeBtn = this.add.rectangle(1000, 100, 30, 30, 0xff0000);
    closeBtn.setInteractive({ useHandCursor: true });
    
    const closeText = this.add.text(1000, 100, 'X', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#ffffff',
    });
    closeText.setOrigin(0.5);
    
    closeBtn.on('pointerdown', () => this.closeInventory());
    
    // Create inventory grid
    this.createInventoryGrid();
    
    // Stats panel
    this.createStatsPanel();
    
    // ESC to close
    this.input.keyboard!.on('keydown-ESC', () => this.closeInventory());
    this.input.keyboard!.on('keydown-I', () => this.closeInventory());
  }

  createInventoryGrid() {
    const gridStartX = 300;
    const gridStartY = 200;
    const slotSize = 60;
    const slotSpacing = 10;
    const cols = 8;
    const rows = 6;
    
    const gameStore = useGameStore.getState();
    const inventory = gameStore.inventory;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const index = row * cols + col;
        const x = gridStartX + col * (slotSize + slotSpacing);
        const y = gridStartY + row * (slotSize + slotSpacing);
        
        // Slot background
        const slot = this.add.rectangle(x, y, slotSize, slotSize, 0x333333);
        slot.setStrokeStyle(2, 0x555555);
        slot.setInteractive({ useHandCursor: true });
        
        // Add item if exists
        if (inventory[index]) {
          const item = inventory[index];
          
          // Item icon
          const icon = this.add.image(x, y, item.icon);
          icon.setScale(2);
          
          // Quantity text
          if (item.quantity > 1) {
            const quantityText = this.add.text(x + 20, y + 20, `${item.quantity}`, {
              fontSize: '14px',
              fontFamily: 'monospace',
              color: '#ffffff',
              backgroundColor: '#000000',
              padding: { x: 2, y: 2 },
            });
          }
          
          // Hover effect
          slot.on('pointerover', () => {
            slot.setFillStyle(0x555555);
            this.showItemTooltip(item, x, y);
          });
          
          slot.on('pointerout', () => {
            slot.setFillStyle(0x333333);
            this.hideTooltip();
          });
          
          slot.on('pointerdown', () => {
            this.selectItem(item);
          });
        }
      }
    }
  }

  createStatsPanel() {
    const gameStore = useGameStore.getState();
    const { player, day, survivors, zombies, resources } = gameStore;
    
    const statsX = 900;
    const statsY = 200;
    const lineHeight = 30;
    
    const statsTitle = this.add.text(statsX, statsY, 'STATISTICS', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#00ff00',
      fontStyle: 'bold',
    });
    
    const stats = [
      `Day Survived: ${day}`,
      `Health: ${Math.floor(player.health)}/${player.maxHealth}`,
      `Stamina: ${Math.floor(player.stamina)}/${player.maxStamina}`,
      `Hunger: ${Math.floor(player.hunger)}%`,
      `Thirst: ${Math.floor(player.thirst)}%`,
      '',
      `Survivors: ${survivors.length}`,
      `Zombies Nearby: ${zombies.length}`,
      '',
      `Food: ${resources.food}`,
      `Water: ${resources.water}`,
      `Medicine: ${resources.medicine}`,
      `Ammo: ${resources.ammo}`,
      `Materials: ${resources.materials}`,
    ];
    
    stats.forEach((stat, index) => {
      this.add.text(statsX, statsY + 40 + (index * lineHeight), stat, {
        fontSize: '16px',
        fontFamily: 'monospace',
        color: '#cccccc',
      });
    });
  }

  showItemTooltip(item: any, x: number, y: number) {
    // Remove existing tooltip
    this.hideTooltip();
    
    // Create tooltip
    const tooltip = this.add.group();
    
    const bg = this.add.rectangle(x + 100, y, 200, 100, 0x000000, 0.9);
    bg.setStrokeStyle(1, 0x666666);
    tooltip.add(bg);
    
    const nameText = this.add.text(x + 100, y - 30, item.name, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    nameText.setOrigin(0.5);
    tooltip.add(nameText);
    
    const typeText = this.add.text(x + 100, y, `Type: ${item.type}`, {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#999999',
    });
    typeText.setOrigin(0.5);
    tooltip.add(typeText);
    
    const quantityText = this.add.text(x + 100, y + 20, `Quantity: ${item.quantity}`, {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#999999',
    });
    quantityText.setOrigin(0.5);
    tooltip.add(quantityText);
    
    this.data.set('tooltip', tooltip);
  }

  hideTooltip() {
    const tooltip = this.data.get('tooltip');
    if (tooltip) {
      tooltip.destroy(true);
      this.data.remove('tooltip');
    }
  }

  selectItem(item: any) {
    this.selectedItem = item;
    
    // Create action menu
    const menu = this.add.group();
    
    const menuBg = this.add.rectangle(640, 500, 300, 150, 0x333333);
    menuBg.setStrokeStyle(2, 0x666666);
    menu.add(menuBg);
    
    const menuTitle = this.add.text(640, 450, item.name, {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#ffffff',
    });
    menuTitle.setOrigin(0.5);
    menu.add(menuTitle);
    
    // Use button
    const useBtn = this.add.rectangle(570, 500, 100, 30, 0x4CAF50);
    useBtn.setInteractive({ useHandCursor: true });
    menu.add(useBtn);
    
    const useText = this.add.text(570, 500, 'Use', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff',
    });
    useText.setOrigin(0.5);
    menu.add(useText);
    
    useBtn.on('pointerdown', () => {
      this.useItem(item);
      menu.destroy(true);
    });
    
    // Drop button
    const dropBtn = this.add.rectangle(710, 500, 100, 30, 0xf44336);
    dropBtn.setInteractive({ useHandCursor: true });
    menu.add(dropBtn);
    
    const dropText = this.add.text(710, 500, 'Drop', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff',
    });
    dropText.setOrigin(0.5);
    menu.add(dropText);
    
    dropBtn.on('pointerdown', () => {
      this.dropItem(item);
      menu.destroy(true);
    });
    
    // Cancel button
    const cancelBtn = this.add.rectangle(640, 540, 100, 30, 0x666666);
    cancelBtn.setInteractive({ useHandCursor: true });
    menu.add(cancelBtn);
    
    const cancelText = this.add.text(640, 540, 'Cancel', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff',
    });
    cancelText.setOrigin(0.5);
    menu.add(cancelText);
    
    cancelBtn.on('pointerdown', () => {
      menu.destroy(true);
    });
    
    this.data.set('actionMenu', menu);
  }

  useItem(item: any) {
    const gameStore = useGameStore.getState();
    
    switch (item.type) {
      case 'food':
        gameStore.updatePlayerHealth(gameStore.player.health + 20);
        gameStore.removeItem(item.id, 1);
        this.showMessage('Consumed food: +20 Health');
        break;
      case 'water':
        const player = gameStore.player;
        gameStore.player.thirst = Math.min(100, player.thirst + 30);
        gameStore.removeItem(item.id, 1);
        this.showMessage('Drank water: +30 Thirst');
        break;
      case 'medicine':
        gameStore.updatePlayerHealth(gameStore.player.maxHealth);
        gameStore.removeItem(item.id, 1);
        this.showMessage('Used medicine: Full Health');
        break;
      case 'weapon':
        gameStore.equipWeapon(item);
        this.showMessage(`Equipped ${item.name}`);
        break;
      case 'ammo':
        gameStore.updateResources({ ammo: gameStore.resources.ammo + item.quantity });
        gameStore.removeItem(item.id);
        this.showMessage(`Added ${item.quantity} ammo`);
        break;
    }
    
    // Refresh inventory display
    this.scene.restart();
  }

  dropItem(item: any) {
    const gameStore = useGameStore.getState();
    gameStore.removeItem(item.id);
    this.showMessage(`Dropped ${item.name}`);
    this.scene.restart();
  }

  showMessage(text: string) {
    const message = this.add.text(640, 300, text, {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 },
    });
    message.setOrigin(0.5);
    
    this.tweens.add({
      targets: message,
      alpha: 0,
      y: 250,
      duration: 2000,
      onComplete: () => message.destroy(),
    });
  }

  closeInventory() {
    const gameStore = useGameStore.getState();
    gameStore.toggleInventory();
    this.scene.resume('GameScene');
    this.scene.stop();
  }
}