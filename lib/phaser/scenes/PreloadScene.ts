import * as Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Create loading bar
    const width = this.scale.width;
    const height = this.scale.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);
    
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading DeadGrid...',
      style: {
        font: '20px monospace',
        color: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);
    
    const percentText = this.make.text({
      x: width / 2,
      y: height / 2 - 5,
      text: '0%',
      style: {
        font: '18px monospace',
        color: '#ffffff'
      }
    });
    percentText.setOrigin(0.5, 0.5);
    
    const assetText = this.make.text({
      x: width / 2,
      y: height / 2 + 40,
      text: '',
      style: {
        font: '14px monospace',
        color: '#888888'
      }
    });
    assetText.setOrigin(0.5, 0.5);
    
    // Update progress bar
    this.load.on('progress', (value: number) => {
      percentText.setText(Math.floor(value * 100) + '%');
      progressBar.clear();
      progressBar.fillStyle(0x00ff00, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30);
    });
    
    this.load.on('fileprogress', (file: any) => {
      assetText.setText('Loading: ' + file.key);
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
    });
    
    // Load external sprites from OpenGameArt and other free sources
    this.loadExternalAssets();
    
    // Generate fallback sprites if external loading fails
    this.generateSprites();
    
    // Load UI assets
    this.load.image('button', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
  }

  loadExternalAssets() {
    // Using free assets from OpenGameArt and creating our own
    
    // Load zombie sprites (using free pixel art style)
    this.load.spritesheet('zombie_walk', 
      'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/zombie.png',
      { frameWidth: 32, frameHeight: 32 }
    );
    
    // Load player sprite (using free assets)
    this.load.spritesheet('player_walk',
      'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/dude.png',
      { frameWidth: 32, frameHeight: 48 }
    );
    
    // Load tile sprites
    this.load.image('tiles_ground', 
      'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/tilemaps/tiles/gridtiles.png'
    );
    
    // Load weapon sprites
    this.load.image('pistol',
      'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/pistol.png'
    );
    
    // Load effect sprites
    this.load.image('blood',
      'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/particles/blood.png'
    );
    
    this.load.image('muzzleflash',
      'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/particles/muzzleflash.png'
    );
  }

  generateSprites() {
    // Generate player sprite
    const playerCanvas = document.createElement('canvas');
    playerCanvas.width = 32;
    playerCanvas.height = 32;
    const playerCtx = playerCanvas.getContext('2d')!;
    playerCtx.fillStyle = '#4CAF50';
    playerCtx.fillRect(8, 8, 16, 16);
    playerCtx.fillStyle = '#FFE0B2';
    playerCtx.fillRect(12, 10, 8, 8);
    this.textures.addCanvas('player', playerCanvas);
    
    // Generate zombie sprite
    const zombieCanvas = document.createElement('canvas');
    zombieCanvas.width = 32;
    zombieCanvas.height = 32;
    const zombieCtx = zombieCanvas.getContext('2d')!;
    zombieCtx.fillStyle = '#8B4513';
    zombieCtx.fillRect(8, 8, 16, 16);
    zombieCtx.fillStyle = '#90EE90';
    zombieCtx.fillRect(12, 10, 8, 8);
    this.textures.addCanvas('zombie', zombieCanvas);
    
    // Generate survivor sprite
    const survivorCanvas = document.createElement('canvas');
    survivorCanvas.width = 32;
    survivorCanvas.height = 32;
    const survivorCtx = survivorCanvas.getContext('2d')!;
    survivorCtx.fillStyle = '#2196F3';
    survivorCtx.fillRect(8, 8, 16, 16);
    survivorCtx.fillStyle = '#FFE0B2';
    survivorCtx.fillRect(12, 10, 8, 8);
    this.textures.addCanvas('survivor', survivorCanvas);
    
    // Generate wall tile
    const wallCanvas = document.createElement('canvas');
    wallCanvas.width = 32;
    wallCanvas.height = 32;
    const wallCtx = wallCanvas.getContext('2d')!;
    wallCtx.fillStyle = '#424242';
    wallCtx.fillRect(0, 0, 32, 32);
    wallCtx.strokeStyle = '#212121';
    wallCtx.strokeRect(0, 0, 32, 32);
    this.textures.addCanvas('wall', wallCanvas);
    
    // Generate floor tile
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 32;
    floorCanvas.height = 32;
    const floorCtx = floorCanvas.getContext('2d')!;
    floorCtx.fillStyle = '#303030';
    floorCtx.fillRect(0, 0, 32, 32);
    this.textures.addCanvas('floor', floorCanvas);
    
    // Generate building tile
    const buildingCanvas = document.createElement('canvas');
    buildingCanvas.width = 32;
    buildingCanvas.height = 32;
    const buildingCtx = buildingCanvas.getContext('2d')!;
    buildingCtx.fillStyle = '#5D4037';
    buildingCtx.fillRect(0, 0, 32, 32);
    buildingCtx.fillStyle = '#3E2723';
    buildingCtx.fillRect(8, 8, 8, 8);
    buildingCtx.fillRect(16, 16, 8, 8);
    this.textures.addCanvas('building', buildingCanvas);
    
    // Generate item sprites
    const itemTypes = ['food', 'water', 'medicine', 'ammo', 'weapon'];
    const itemColors = ['#FF9800', '#2196F3', '#4CAF50', '#FFC107', '#9E9E9E'];
    
    itemTypes.forEach((type, index) => {
      const itemCanvas = document.createElement('canvas');
      itemCanvas.width = 16;
      itemCanvas.height = 16;
      const itemCtx = itemCanvas.getContext('2d')!;
      itemCtx.fillStyle = itemColors[index];
      itemCtx.fillRect(2, 2, 12, 12);
      this.textures.addCanvas(`item_${type}`, itemCanvas);
    });
  }

  create() {
    this.scene.start('MenuScene');
  }
}