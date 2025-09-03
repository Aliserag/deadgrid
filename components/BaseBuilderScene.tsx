import * as Phaser from 'phaser';

interface Building {
  type: string;
  gridX: number;
  gridY: number;
  sprite: Phaser.GameObjects.Rectangle;
  icon: Phaser.GameObjects.Text;
}

export class BaseBuilderScene extends Phaser.Scene {
  private gridSize = 32;
  private baseWidth = 20;
  private baseHeight = 15;
  private selectedBuilding: string | null = null;
  private buildings: Building[] = [];
  private gridOverlay!: Phaser.GameObjects.Graphics;
  private resources = { materials: 100, food: 50, water: 50, medicine: 20 };
  private resourceText!: Phaser.GameObjects.Text;
  private selectedButton: Phaser.GameObjects.Rectangle | null = null;

  constructor() {
    super({ key: 'BaseBuilderScene' });
  }

  create() {
    // Dark background
    this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.95);
    
    // Base building area
    this.createBuildingGrid();
    
    // Building menu
    this.createBuildingMenu();
    
    // Resource display
    this.createResourceDisplay();
    
    // Close button
    this.createCloseButton();
    
    // Title
    this.add.text(640, 30, 'BASE BUILDING MODE', {
      fontSize: '28px',
      color: '#ff0000',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.add.text(640, 60, 'Build defenses and facilities to survive', {
      fontSize: '14px',
      color: '#999999',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    // Load game state if available
    const gameState = this.registry.get('gameState');
    if (gameState) {
      this.resources.materials = 50 + Math.floor(gameState.day * 10);
      this.resources.food = 30 + Math.floor(Math.random() * 20);
      this.resources.water = 30 + Math.floor(Math.random() * 20);
      this.updateResourceDisplay();
    }
  }

  createBuildingGrid() {
    this.gridOverlay = this.add.graphics();
    this.gridOverlay.lineStyle(1, 0x333333, 0.5);
    
    const startX = 200;
    const startY = 120;
    
    // Draw grid
    for (let x = 0; x <= this.baseWidth; x++) {
      this.gridOverlay.moveTo(startX + x * this.gridSize, startY);
      this.gridOverlay.lineTo(startX + x * this.gridSize, startY + this.baseHeight * this.gridSize);
    }
    
    for (let y = 0; y <= this.baseHeight; y++) {
      this.gridOverlay.moveTo(startX, startY + y * this.gridSize);
      this.gridOverlay.lineTo(startX + this.baseWidth * this.gridSize, startY + y * this.gridSize);
    }
    
    this.gridOverlay.strokePath();
    
    // Grid interaction
    const hitArea = new Phaser.Geom.Rectangle(
      startX, startY,
      this.baseWidth * this.gridSize,
      this.baseHeight * this.gridSize
    );
    
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (hitArea.contains(pointer.x, pointer.y) && this.selectedBuilding) {
        this.placeBuilding(pointer.x, pointer.y);
      }
    });
    
    // Show grid hover effect
    const hoverRect = this.add.rectangle(0, 0, this.gridSize, this.gridSize, 0x00ff00, 0.3);
    hoverRect.setVisible(false);
    
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (hitArea.contains(pointer.x, pointer.y) && this.selectedBuilding) {
        const gridX = Math.floor((pointer.x - startX) / this.gridSize);
        const gridY = Math.floor((pointer.y - startY) / this.gridSize);
        
        hoverRect.setPosition(
          startX + gridX * this.gridSize + this.gridSize / 2,
          startY + gridY * this.gridSize + this.gridSize / 2
        );
        hoverRect.setVisible(true);
        
        // Check if can afford
        const buildingConfig = this.getBuildingConfig(this.selectedBuilding);
        if (buildingConfig && !this.canAfford(buildingConfig.cost)) {
          hoverRect.setFillStyle(0xff0000, 0.3);
        } else {
          hoverRect.setFillStyle(0x00ff00, 0.3);
        }
      } else {
        hoverRect.setVisible(false);
      }
    });
  }

  createBuildingMenu() {
    const menuX = 900;
    const menuY = 150;
    
    // Menu background
    this.add.rectangle(menuX + 100, menuY + 200, 300, 500, 0x1a1a1a);
    this.add.rectangle(menuX + 100, menuY + 200, 300, 500)
      .setStrokeStyle(2, 0x444444);
    
    this.add.text(menuX + 100, menuY - 20, 'STRUCTURES', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const buildings = this.getAllBuildings();
    
    buildings.forEach((building, index) => {
      const y = menuY + 20 + index * 55;
      
      // Building button
      const button = this.add.rectangle(menuX + 100, y, 280, 50, 0x222222);
      button.setStrokeStyle(1, 0x444444);
      button.setInteractive();
      button.setData('building', building.name);
      
      // Icon
      this.add.text(menuX + 20, y, building.icon, {
        fontSize: '24px'
      }).setOrigin(0.5);
      
      // Name and stats
      this.add.text(menuX + 50, y - 12, building.name, {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontStyle: 'bold'
      });
      
      // Cost
      const costText = Object.entries(building.cost)
        .map(([res, amt]) => `${res}: ${amt}`)
        .join(', ');
      
      this.add.text(menuX + 50, y + 2, costText, {
        fontSize: '11px',
        color: '#999999',
        fontFamily: 'monospace'
      });
      
      // Stats
      const statsText = building.defense ? `Defense: +${building.defense}` :
                       building.capacity ? `Storage: +${building.capacity}` :
                       building.production ? `Production: +${building.production}/day` :
                       building.healing ? `Healing: +${building.healing}/turn` :
                       building.food ? `Food: +${building.food}/day` :
                       building.water ? `Water: +${building.water}/day` : '';
      
      if (statsText) {
        this.add.text(menuX + 180, y, statsText, {
          fontSize: '10px',
          color: '#66ff66',
          fontFamily: 'monospace'
        }).setOrigin(0, 0.5);
      }
      
      button.on('pointerover', () => {
        if (!this.canAfford(building.cost)) {
          button.setFillStyle(0x442222);
        } else {
          button.setFillStyle(0x333333);
        }
      });
      
      button.on('pointerout', () => {
        if (this.selectedButton === button) {
          button.setFillStyle(0x224422);
        } else {
          button.setFillStyle(0x222222);
        }
      });
      
      button.on('pointerdown', () => {
        if (!this.canAfford(building.cost)) {
          this.showMessage('Not enough resources!', menuX + 100, y, '#ff0000');
          return;
        }
        
        // Deselect previous button
        if (this.selectedButton) {
          this.selectedButton.setFillStyle(0x222222);
          this.selectedButton.setStrokeStyle(1, 0x444444);
        }
        
        this.selectedBuilding = building.name;
        this.selectedButton = button;
        button.setFillStyle(0x224422);
        button.setStrokeStyle(2, 0x00ff00);
      });
    });
  }

  getAllBuildings() {
    return [
      { name: 'Wall', cost: { materials: 10 }, defense: 10, icon: '🧱' },
      { name: 'Gate', cost: { materials: 15 }, defense: 5, icon: '🚪' },
      { name: 'Watchtower', cost: { materials: 25 }, defense: 15, icon: '🗼' },
      { name: 'Storage', cost: { materials: 20 }, capacity: 50, icon: '📦' },
      { name: 'Workshop', cost: { materials: 30 }, production: 5, icon: '🔧' },
      { name: 'Medical Bay', cost: { materials: 35, medicine: 10 }, healing: 10, icon: '🏥' },
      { name: 'Garden', cost: { materials: 15, water: 10 }, food: 5, icon: '🌱' },
      { name: 'Water Collector', cost: { materials: 20 }, water: 10, icon: '💧' }
    ];
  }

  getBuildingConfig(name: string) {
    return this.getAllBuildings().find(b => b.name === name);
  }

  canAfford(cost: Record<string, number>): boolean {
    for (const [resource, amount] of Object.entries(cost)) {
      if ((this.resources as any)[resource] < amount) {
        return false;
      }
    }
    return true;
  }

  placeBuilding(x: number, y: number) {
    const gridX = Math.floor((x - 200) / this.gridSize);
    const gridY = Math.floor((y - 120) / this.gridSize);
    
    if (gridX >= 0 && gridX < this.baseWidth && gridY >= 0 && gridY < this.baseHeight) {
      // Check if space is occupied
      const occupied = this.buildings.some(b => b.gridX === gridX && b.gridY === gridY);
      
      if (occupied) {
        this.showMessage('Space occupied!', x, y - 20, '#ff0000');
        return;
      }
      
      const buildingConfig = this.getBuildingConfig(this.selectedBuilding!);
      if (!buildingConfig) return;
      
      if (!this.canAfford(buildingConfig.cost)) {
        this.showMessage('Not enough resources!', x, y - 20, '#ff0000');
        return;
      }
      
      // Deduct resources
      for (const [resource, amount] of Object.entries(buildingConfig.cost)) {
        (this.resources as any)[resource] -= amount;
      }
      this.updateResourceDisplay();
      
      const worldX = 200 + gridX * this.gridSize + this.gridSize / 2;
      const worldY = 120 + gridY * this.gridSize + this.gridSize / 2;
      
      // Create building sprite
      const color = buildingConfig.defense ? 0x666666 :
                   buildingConfig.capacity ? 0x8B7355 :
                   buildingConfig.production ? 0x708090 :
                   buildingConfig.healing ? 0xFFFFFF :
                   buildingConfig.food ? 0x228B22 :
                   buildingConfig.water ? 0x4682B4 : 0x555555;
      
      const sprite = this.add.rectangle(worldX, worldY, 28, 28, color);
      sprite.setStrokeStyle(2, 0x333333);
      
      // Add icon
      const icon = this.add.text(worldX, worldY, buildingConfig.icon, {
        fontSize: '18px'
      }).setOrigin(0.5);
      
      const building: Building = {
        type: this.selectedBuilding!,
        gridX,
        gridY,
        sprite,
        icon
      };
      
      this.buildings.push(building);
      
      // Show build effect
      this.tweens.add({
        targets: [sprite, icon],
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 100,
        yoyo: true
      });
      
      this.showMessage(`${this.selectedBuilding} built!`, worldX, worldY - 30, '#00ff00');
    }
  }

  createResourceDisplay() {
    const resBg = this.add.rectangle(10, 100, 180, 120, 0x1a1a1a);
    resBg.setOrigin(0);
    resBg.setStrokeStyle(2, 0x444444);
    
    this.add.text(100, 115, 'RESOURCES', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.resourceText = this.add.text(20, 135, '', {
      fontSize: '12px',
      color: '#cccccc',
      fontFamily: 'monospace',
      lineSpacing: 4
    });
    
    this.updateResourceDisplay();
  }

  updateResourceDisplay() {
    const text = `Materials: ${this.resources.materials}
Food: ${this.resources.food}
Water: ${this.resources.water}
Medicine: ${this.resources.medicine}`;
    
    this.resourceText.setText(text);
  }

  createCloseButton() {
    const closeBtn = this.add.rectangle(1240, 40, 100, 30, 0x880000);
    closeBtn.setInteractive();
    closeBtn.setStrokeStyle(2, 0xffffff);
    
    this.add.text(1240, 40, 'RETURN', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    closeBtn.on('pointerover', () => {
      closeBtn.setFillStyle(0xaa0000);
    });
    
    closeBtn.on('pointerout', () => {
      closeBtn.setFillStyle(0x880000);
    });
    
    closeBtn.on('pointerdown', () => {
      // Calculate defense bonus
      let totalDefense = 0;
      this.buildings.forEach(b => {
        const config = this.getBuildingConfig(b.type);
        if (config && config.defense) {
          totalDefense += config.defense;
        }
      });
      
      // Store base data
      this.registry.set('baseDefense', totalDefense);
      this.registry.set('baseBuildings', this.buildings.length);
      
      this.scene.stop();
      this.scene.resume('GameScene');
    });
  }

  showMessage(text: string, x: number, y: number, color: string) {
    const message = this.add.text(x, y, text, {
      fontSize: '12px',
      color: color,
      fontFamily: 'monospace',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: message,
      y: y - 20,
      alpha: 0,
      duration: 1500,
      onComplete: () => message.destroy()
    });
  }
}