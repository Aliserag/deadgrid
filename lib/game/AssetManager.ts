/**
 * Asset Manager - Handles all Post-Apocalypse asset loading and management
 */

export interface AssetConfig {
  key: string;
  path: string;
  frameWidth?: number;
  frameHeight?: number;
  type: 'image' | 'spritesheet' | 'tileset';
}

export class AssetManager {
  private static BASE_PATH = '/assets/PostApocalypse_AssetPack_v1.1.2';
  
  // Character Assets
  static readonly CHARACTER_ASSETS: AssetConfig[] = [
    {
      key: 'player-idle-down',
      path: '/Character/Main/Idle/Character_down_idle-Sheet6.png',
      type: 'spritesheet',
      frameWidth: 32,
      frameHeight: 32
    },
    {
      key: 'player-idle-up',
      path: '/Character/Main/Idle/Character_up_idle-Sheet6.png',
      type: 'spritesheet',
      frameWidth: 32,
      frameHeight: 32
    },
    {
      key: 'player-idle-side',
      path: '/Character/Main/Idle/Character_side_idle-Sheet6.png',
      type: 'spritesheet',
      frameWidth: 32,
      frameHeight: 32
    },
    {
      key: 'player-run-down',
      path: '/Character/Main/Run/Character_down_run-Sheet6.png',
      type: 'spritesheet',
      frameWidth: 32,
      frameHeight: 32
    },
    {
      key: 'player-run-up',
      path: '/Character/Main/Run/Character_up_run-Sheet6.png',
      type: 'spritesheet',
      frameWidth: 32,
      frameHeight: 32
    },
    {
      key: 'player-run-side',
      path: '/Character/Main/Run/Character_side_run-Sheet6.png',
      type: 'spritesheet',
      frameWidth: 32,
      frameHeight: 32
    },
    {
      key: 'player-death',
      path: '/Character/Main/Death/Character_side_death1-Sheet6.png',
      type: 'spritesheet',
      frameWidth: 32,
      frameHeight: 32
    },
    {
      key: 'player-punch',
      path: '/Character/Main/Punch/Character_down_punch-Sheet4.png',
      type: 'spritesheet',
      frameWidth: 32,
      frameHeight: 32
    }
  ];
  
  // Enemy Assets
  static readonly ENEMY_ASSETS: AssetConfig[] = [
    // Small Zombie
    {
      key: 'zombie-small-idle-down',
      path: '/Enemies/Zombie_Small/Zombie_Small_Down_Idle-Sheet6.png',
      type: 'spritesheet',
      frameWidth: 32,
      frameHeight: 32
    },
    {
      key: 'zombie-small-walk-down',
      path: '/Enemies/Zombie_Small/Zombie_Small_Down_walk-Sheet6.png',
      type: 'spritesheet',
      frameWidth: 32,
      frameHeight: 32
    },
    {
      key: 'zombie-small-attack',
      path: '/Enemies/Zombie_Small/Zombie_Small_Down_First-Attack-Sheet4.png',
      type: 'spritesheet',
      frameWidth: 32,
      frameHeight: 32
    },
    // Big Zombie
    {
      key: 'zombie-big-idle-down',
      path: '/Enemies/Zombie_Big/Zombie_Big_Down_Idle-Sheet6.png',
      type: 'spritesheet',
      frameWidth: 32,
      frameHeight: 32
    },
    {
      key: 'zombie-big-walk-down',
      path: '/Enemies/Zombie_Big/Zombie_Big_Down_Walk-Sheet8.png',
      type: 'spritesheet',
      frameWidth: 32,
      frameHeight: 32
    },
    {
      key: 'zombie-big-attack',
      path: '/Enemies/Zombie_Big/Zombie_Big_Down_First-Attack-Sheet8.png',
      type: 'spritesheet',
      frameWidth: 32,
      frameHeight: 32
    },
    // Axe Zombie
    {
      key: 'zombie-axe-idle-down',
      path: '/Enemies/Zombie_Axe/Zombie_Axe_Down_Idle-Sheet6.png',
      type: 'spritesheet',
      frameWidth: 32,
      frameHeight: 32
    },
    {
      key: 'zombie-axe-walk-down',
      path: '/Enemies/Zombie_Axe/Zombie_Axe_Down_Walk-Sheet8.png',
      type: 'spritesheet',
      frameWidth: 32,
      frameHeight: 32
    },
    {
      key: 'zombie-axe-attack',
      path: '/Enemies/Zombie_Axe/Zombie_Axe_Down_First-Attack-Sheet7.png',
      type: 'spritesheet',
      frameWidth: 32,
      frameHeight: 32
    }
  ];
  
  // UI Assets
  static readonly UI_ASSETS: AssetConfig[] = [
    { key: 'heart-full', path: '/UI/HP/Heart_Full.png', type: 'image' },
    { key: 'heart-half', path: '/UI/HP/Heart_Half.png', type: 'image' },
    { key: 'heart-empty', path: '/UI/HP/Heart_Empty.png', type: 'image' },
    { key: 'hp-bar', path: '/UI/HP/HP-Bar.png', type: 'image' },
    { key: 'hp-fill', path: '/UI/HP/HP.png', type: 'image' },
    { key: 'inventory-bg', path: '/UI/Inventory/Inventory_2.png', type: 'image' }
  ];
  
  // Item Assets
  static readonly ITEM_ASSETS: AssetConfig[] = [
    { key: 'icon-pistol', path: '/UI/Inventory/Objects/Icon_Pistol.png', type: 'image' },
    { key: 'icon-shotgun', path: '/UI/Inventory/Objects/Icon_Shotgun.png', type: 'image' },
    { key: 'icon-bat', path: '/UI/Inventory/Objects/Icon_Bat.png', type: 'image' },
    { key: 'icon-gun', path: '/UI/Inventory/Objects/Icon_Gun.png', type: 'image' },
    { key: 'icon-ammo-blue', path: '/UI/Inventory/Objects/Icon_Bullet-box_Blue.png', type: 'image' },
    { key: 'icon-ammo-green', path: '/UI/Inventory/Objects/Icon_Bullet-box_Green.png', type: 'image' },
    { key: 'icon-medkit', path: '/UI/Inventory/Objects/Icon_First-Aid-Kit_Red.png', type: 'image' },
    { key: 'icon-bandage', path: '/UI/Inventory/Objects/Icon_Bandage.png', type: 'image' },
    { key: 'icon-food', path: '/UI/Inventory/Objects/Icon_Canned-soup.png', type: 'image' },
    { key: 'icon-water', path: '/UI/Inventory/Objects/Icon_Medicine.png', type: 'image' }
  ];
  
  // Object Assets
  static readonly OBJECT_ASSETS: AssetConfig[] = [
    { key: 'barrel-grey', path: '/Objects/Barrel_rust_blue_1.png', type: 'image' },
    { key: 'barrel-red', path: '/Objects/Barrel_red_1.png', type: 'image' },
    { key: 'crate-brown', path: '/Objects/Pickable/Ammo-crate_Green.png', type: 'image' }
  ];
  
  // Tile Assets (empty for now, will add if found)
  static readonly TILE_ASSETS: AssetConfig[] = [];
  
  /**
   * Load all game assets
   */
  static loadAllAssets(scene: Phaser.Scene): void {
    // Combine all assets
    const allAssets = [
      ...this.CHARACTER_ASSETS,
      ...this.ENEMY_ASSETS,
      ...this.UI_ASSETS,
      ...this.ITEM_ASSETS,
      ...this.OBJECT_ASSETS,
      ...this.TILE_ASSETS
    ];
    
    // Load each asset
    allAssets.forEach(asset => {
      const fullPath = this.BASE_PATH + asset.path;
      
      switch(asset.type) {
        case 'image':
          scene.load.image(asset.key, fullPath);
          break;
        case 'spritesheet':
          scene.load.spritesheet(asset.key, fullPath, {
            frameWidth: asset.frameWidth!,
            frameHeight: asset.frameHeight!
          });
          break;
        case 'tileset':
          scene.load.image(asset.key, fullPath);
          break;
      }
    });
    
    // Add load error handling
    scene.load.on('loaderror', (file: any) => {
      console.error(`Failed to load asset: ${file.key} from ${file.src}`);
    });
  }
  
  /**
   * Create all animations
   */
  static createAnimations(scene: Phaser.Scene): void {
    // Player animations
    this.createAnimation(scene, 'player-idle', 'player-idle-down', 0, 5, 8, -1);
    this.createAnimation(scene, 'player-walk', 'player-run-down', 0, 5, 10, -1);
    this.createAnimation(scene, 'player-attack', 'player-punch', 0, 3, 8, 0);
    this.createAnimation(scene, 'player-death', 'player-death', 0, 5, 8, 0);
    
    // Zombie animations
    this.createAnimation(scene, 'zombie-small-idle', 'zombie-small-idle-down', 0, 5, 6, -1);
    this.createAnimation(scene, 'zombie-small-walk', 'zombie-small-walk-down', 0, 5, 8, -1);
    this.createAnimation(scene, 'zombie-small-attack', 'zombie-small-attack', 0, 3, 8, 0);
    
    this.createAnimation(scene, 'zombie-big-idle', 'zombie-big-idle-down', 0, 5, 6, -1);
    this.createAnimation(scene, 'zombie-big-walk', 'zombie-big-walk-down', 0, 7, 8, -1);
    this.createAnimation(scene, 'zombie-big-attack', 'zombie-big-attack', 0, 7, 8, 0);
    
    this.createAnimation(scene, 'zombie-axe-idle', 'zombie-axe-idle-down', 0, 5, 6, -1);
    this.createAnimation(scene, 'zombie-axe-walk', 'zombie-axe-walk-down', 0, 7, 8, -1);
    this.createAnimation(scene, 'zombie-axe-attack', 'zombie-axe-attack', 0, 6, 8, 0);
  }
  
  private static createAnimation(
    scene: Phaser.Scene,
    key: string,
    texture: string,
    startFrame: number,
    endFrame: number,
    frameRate: number,
    repeat: number
  ): void {
    if (!scene.anims.exists(key)) {
      scene.anims.create({
        key,
        frames: scene.anims.generateFrameNumbers(texture, { 
          start: startFrame, 
          end: endFrame 
        }),
        frameRate,
        repeat
      });
    }
  }
}