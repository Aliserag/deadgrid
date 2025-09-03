import * as Phaser from 'phaser';
import { useGameStore } from '../store/gameStore';

export class BaseBuilderScene extends Phaser.Scene {
  private gridSize = 32;
  private baseWidth = 20;
  private baseHeight = 15;
  private selectedBuilding: string | null = null;
  private buildings: Phaser.GameObjects.Sprite[] = [];
  private gridOverlay!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'BaseBuilderScene' });
  }

  create() {
    // Dark background
    this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.9);
    
    // Base building area
    this.createBuildingGrid();
    
    // Building menu
    this.createBuildingMenu();
    
    // Close button
    this.createCloseButton();
    
    // Instructions
    this.add.text(640, 50, 'BASE BUILDING MODE', {
      fontSize: '24px',
      color: '#ff0000',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.add.text(640, 80, 'Click a structure then click on the grid to build', {
      fontSize: '14px',
      color: '#999999',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
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
  }

  createBuildingMenu() {
    const menuX = 900;
    const menuY = 150;
    
    // Menu background
    this.add.rectangle(menuX + 100, menuY + 200, 300, 500, 0x1a1a1a);
    this.add.rectangle(menuX + 100, menuY + 200, 300, 500)
      .setStrokeStyle(2, 0x444444);
    
    this.add.text(menuX + 100, menuY, 'STRUCTURES', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const buildings = [
      { name: 'Wall', cost: { materials: 10 }, defense: 10, icon: '🧱' },
      { name: 'Gate', cost: { materials: 15 }, defense: 5, icon: '🚪' },
      { name: 'Watchtower', cost: { materials: 25 }, defense: 15, icon: '🗼' },
      { name: 'Storage', cost: { materials: 20 }, capacity: 50, icon: '📦' },
      { name: 'Workshop', cost: { materials: 30 }, production: 5, icon: '🔧' },
      { name: 'Medical Bay', cost: { materials: 35 }, healing: 10, icon: '🏥' },
      { name: 'Garden', cost: { materials: 15, water: 10 }, food: 5, icon: '🌱' },
      { name: 'Water Collector', cost: { materials: 20 }, water: 10, icon: '💧' }
    ];
    
    buildings.forEach((building, index) => {
      const y = menuY + 40 + index * 50;
      
      // Building button
      const button = this.add.rectangle(menuX + 100, y, 280, 45, 0x222222);
      button.setStrokeStyle(1, 0x444444);
      button.setInteractive();
      
      // Icon
      this.add.text(menuX + 20, y, building.icon, {
        fontSize: '24px'
      }).setOrigin(0.5);
      
      // Name and cost
      this.add.text(menuX + 50, y - 10, building.name, {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'monospace'
      });
      
      const costText = Object.entries(building.cost)
        .map(([res, amt]) => `${res}: ${amt}`)
        .join(', ');
      
      this.add.text(menuX + 50, y + 5, costText, {
        fontSize: '11px',
        color: '#999999',
        fontFamily: 'monospace'
      });
      
      button.on('pointerover', () => {
        button.setFillStyle(0x333333);
      });
      
      button.on('pointerout', () => {
        button.setFillStyle(0x222222);
      });
      
      button.on('pointerdown', () => {
        this.selectedBuilding = building.name;
        // Visual feedback
        button.setStrokeStyle(2, 0x00ff00);
      });
    });
  }

  placeBuilding(x: number, y: number) {
    const gridX = Math.floor((x - 200) / this.gridSize);
    const gridY = Math.floor((y - 120) / this.gridSize);
    
    if (gridX >= 0 && gridX < this.baseWidth && gridY >= 0 && gridY < this.baseHeight) {
      // Check resources
      const gameStore = useGameStore.getState();
      
      // For now, just place the building
      const worldX = 200 + gridX * this.gridSize + this.gridSize / 2;
      const worldY = 120 + gridY * this.gridSize + this.gridSize / 2;
      
      // Create building sprite
      const building = this.add.rectangle(worldX, worldY, 30, 30, 0x666666);
      building.setStrokeStyle(2, 0x333333);
      
      // Add icon
      const icons: Record<string, string> = {
        'Wall': '🧱',
        'Gate': '🚪',
        'Watchtower': '🗼',
        'Storage': '📦',
        'Workshop': '🔧',
        'Medical Bay': '🏥',
        'Garden': '🌱',
        'Water Collector': '💧'
      };
      
      this.add.text(worldX, worldY, icons[this.selectedBuilding!] || '?', {
        fontSize: '20px'
      }).setOrigin(0.5);
      
      // Deduct resources (simplified for now)
      gameStore.updateResources({
        materials: Math.max(0, gameStore.resources.materials - 10)
      });
    }
  }

  createCloseButton() {
    const closeBtn = this.add.rectangle(1240, 40, 30, 30, 0xff0000);
    closeBtn.setInteractive();
    closeBtn.setStrokeStyle(2, 0xffffff);
    
    this.add.text(1240, 40, 'X', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    closeBtn.on('pointerover', () => {
      closeBtn.setScale(1.1);
    });
    
    closeBtn.on('pointerout', () => {
      closeBtn.setScale(1);
    });
    
    closeBtn.on('pointerdown', () => {
      this.scene.stop();
      this.scene.resume('MainGameScene');
    });
  }
}