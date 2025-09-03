// Post-Apocalypse Asset Pack sprite loader
import * as Phaser from 'phaser';

export const SPRITE_PATHS = {
  // Player sprites
  player: {
    idle: {
      down: '/assets/PostApocalypse_AssetPack_v1.1.2/Character/Main/Idle/Character_down_idle-Sheet6.png',
      up: '/assets/PostApocalypse_AssetPack_v1.1.2/Character/Main/Idle/Character_up_idle-Sheet6.png',
      side: '/assets/PostApocalypse_AssetPack_v1.1.2/Character/Main/Idle/Character_side_idle-Sheet6.png',
      sideLeft: '/assets/PostApocalypse_AssetPack_v1.1.2/Character/Main/Idle/Character_side-left_idle-Sheet6.png'
    },
    run: {
      down: '/assets/PostApocalypse_AssetPack_v1.1.2/Character/Main/Run/Character_down_run-Sheet6.png',
      up: '/assets/PostApocalypse_AssetPack_v1.1.2/Character/Main/Run/Character_up_run-Sheet6.png',
      side: '/assets/PostApocalypse_AssetPack_v1.1.2/Character/Main/Run/Character_side_run-Sheet6.png',
      sideLeft: '/assets/PostApocalypse_AssetPack_v1.1.2/Character/Main/Run/Character_side-left_run-Sheet6.png'
    },
    death: '/assets/PostApocalypse_AssetPack_v1.1.2/Character/Main/Death/Character_down_death-Sheet6.png',
    punch: {
      down: '/assets/PostApocalypse_AssetPack_v1.1.2/Character/Main/Punch/Character_down_punch-Sheet3.png',
      side: '/assets/PostApocalypse_AssetPack_v1.1.2/Character/Main/Punch/Character_side_punch-Sheet4.png'
    }
  },
  
  // Enemy sprites
  zombieSmall: {
    idle: {
      down: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Small/Zombie_Small_Down_Idle-Sheet6.png',
      up: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Small/Zombie_Small_Up_Idle-Sheet6.png',
      side: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Small/Zombie_Small_Side_Idle-Sheet6.png',
      sideLeft: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Small/Zombie_Small_Side-left_Idle-Sheet6.png'
    },
    walk: {
      down: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Small/Zombie_Small_Down_walk-Sheet6.png',
      up: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Small/Zombie_Small_Up_Walk-Sheet6.png',
      side: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Small/Zombie_Small_Side_Walk-Sheet6.png',
      sideLeft: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Small/Zombie_Small_Side-left_Walk-Sheet6.png'
    },
    attack: {
      down: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Small/Zombie_Small_Down_First-Attack-Sheet4.png',
      side: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Small/Zombie_Small_Side_First-Attack-Sheet4.png'
    },
    death: {
      side: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Small/Zombie_Small_Side_First-Death-Sheet6.png'
    }
  },
  
  zombieBig: {
    idle: {
      down: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Big/Zombie_Big_Down_Idle-Sheet6.png',
      up: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Big/Zombie_Big_Up_Idle-Sheet6.png',
      side: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Big/Zombie_Big_Side_Idle-Sheet6.png',
      sideLeft: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Big/Zombie_Big_Side-left_Idle-Sheet6.png'
    },
    walk: {
      down: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Big/Zombie_Big_Down_walk-Sheet6.png',
      up: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Big/Zombie_Big_Up_walk-Sheet6.png',
      side: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Big/Zombie_Big_Side_Walk-Sheet6.png',
      sideLeft: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Big/Zombie_Big_Side-left_Walk-Sheet6.png'
    },
    attack: {
      down: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Big/Zombie_Big_Down_First-Attack-Sheet4.png',
      side: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Big/Zombie_Big_Side_First-Attack-Sheet4.png'
    },
    death: {
      side: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Big/Zombie_Big_Side_First-Death-Sheet6.png'
    }
  },
  
  zombieAxe: {
    idle: {
      down: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Axe/Zombie_Axe_Down_Idle-Sheet6.png',
      up: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Axe/Zombie_Axe_Up_Idle-Sheet6.png',
      side: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Axe/Zombie_Axe_Side_Idle-Sheet6.png',
      sideLeft: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Axe/Zombie_Axe_Side-left_Idle-Sheet6.png'
    },
    walk: {
      down: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Axe/Zombie_Axe_Down_Walk-Sheet6.png',
      up: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Axe/Zombie_Axe_Up_Walk-Sheet6.png',
      side: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Axe/Zombie_Axe_Side_Walk-Sheet6.png',
      sideLeft: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Axe/Zombie_Axe_Side-left_Walk-Sheet6.png'
    },
    attack: {
      down: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Axe/Zombie_Axe_Down_First-Attack-Sheet5.png',
      side: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Axe/Zombie_Axe_Side_First-Attack-Sheet4.png'
    },
    death: {
      side: '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Axe/Zombie_Axe_Side_First-Death-Sheet6.png'
    }
  },
  
  // UI Elements
  ui: {
    heartFull: '/assets/PostApocalypse_AssetPack_v1.1.2/UI/HP/Heart_Full.png',
    heartHalf: '/assets/PostApocalypse_AssetPack_v1.1.2/UI/HP/Heart_Half.png',
    heartEmpty: '/assets/PostApocalypse_AssetPack_v1.1.2/UI/HP/Heart_Empty.png',
    hpBar: '/assets/PostApocalypse_AssetPack_v1.1.2/UI/HP/HP-Bar.png',
    hp: '/assets/PostApocalypse_AssetPack_v1.1.2/UI/HP/HP.png'
  },
  
  // Item icons
  items: {
    pistol: '/assets/PostApocalypse_AssetPack_v1.1.2/UI/Inventory/Objects/Icon_Pistol.png',
    shotgun: '/assets/PostApocalypse_AssetPack_v1.1.2/UI/Inventory/Objects/Icon_Shotgun.png',
    bat: '/assets/PostApocalypse_AssetPack_v1.1.2/UI/Inventory/Objects/Icon_Bat.png',
    bulletBoxBlue: '/assets/PostApocalypse_AssetPack_v1.1.2/UI/Inventory/Objects/Icon_Bullet-box_Blue.png',
    bulletBoxGreen: '/assets/PostApocalypse_AssetPack_v1.1.2/UI/Inventory/Objects/Icon_Bullet-box_Green.png',
    firstAidKit: '/assets/PostApocalypse_AssetPack_v1.1.2/UI/Inventory/Objects/Icon_First-Aid-Kit_Red.png',
    cannedSoup: '/assets/PostApocalypse_AssetPack_v1.1.2/UI/Inventory/Objects/Icon_Canned-soup.png',
    bandage: '/assets/PostApocalypse_AssetPack_v1.1.2/UI/Inventory/Objects/Icon_Bandage.png',
    gun: '/assets/PostApocalypse_AssetPack_v1.1.2/UI/Inventory/Objects/Icon_Gun.png'
  },
  
  // Environment tiles
  tiles: {
    grass: '/assets/PostApocalypse_AssetPack_v1.1.2/Tiles/Grass/Grass1.png',
    road: '/assets/PostApocalypse_AssetPack_v1.1.2/Tiles/Road/Road_Horizontal.png',
    roadVertical: '/assets/PostApocalypse_AssetPack_v1.1.2/Tiles/Road/Road_Vertical.png',
    sidewalk: '/assets/PostApocalypse_AssetPack_v1.1.2/Tiles/Sidewalk/Sidewalk_Horizontal.png',
    dirt: '/assets/PostApocalypse_AssetPack_v1.1.2/Tiles/Dirt/Dirt1.png'
  },
  
  // Objects
  objects: {
    barrel: '/assets/PostApocalypse_AssetPack_v1.1.2/Objects/Barrels/Barrels_grey_1.png',
    crate: '/assets/PostApocalypse_AssetPack_v1.1.2/Objects/Boxes/Crate_brown.png',
    car: '/assets/PostApocalypse_AssetPack_v1.1.2/Objects/Cars/Car_Side.png',
    fence: '/assets/PostApocalypse_AssetPack_v1.1.2/Objects/Fences/Fence_yellow_vertical.png',
    barbedWire: '/assets/PostApocalypse_AssetPack_v1.1.2/Objects/Barbed-wire/Barbed-wire_Front-wall.png'
  }
};

export class PostApocalypseLoader {
  private scene: Phaser.Scene;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  preloadAll() {
    // Load player sprites with animations
    this.scene.load.spritesheet('player-idle-down', SPRITE_PATHS.player.idle.down, {
      frameWidth: 32,
      frameHeight: 32
    });
    this.scene.load.spritesheet('player-idle-up', SPRITE_PATHS.player.idle.up, {
      frameWidth: 32,
      frameHeight: 32
    });
    this.scene.load.spritesheet('player-idle-side', SPRITE_PATHS.player.idle.side, {
      frameWidth: 32,
      frameHeight: 32
    });
    
    // Load zombie sprites
    this.scene.load.spritesheet('zombie-small-idle', SPRITE_PATHS.zombieSmall.idle.down, {
      frameWidth: 32,
      frameHeight: 32
    });
    this.scene.load.spritesheet('zombie-small-walk', SPRITE_PATHS.zombieSmall.walk.down, {
      frameWidth: 32,
      frameHeight: 32
    });
    
    this.scene.load.spritesheet('zombie-big-idle', SPRITE_PATHS.zombieBig.idle.down, {
      frameWidth: 32,
      frameHeight: 32
    });
    this.scene.load.spritesheet('zombie-big-walk', SPRITE_PATHS.zombieBig.walk.down, {
      frameWidth: 32,
      frameHeight: 32
    });
    
    this.scene.load.spritesheet('zombie-axe-idle', SPRITE_PATHS.zombieAxe.idle.down, {
      frameWidth: 32,
      frameHeight: 32
    });
    this.scene.load.spritesheet('zombie-axe-walk', SPRITE_PATHS.zombieAxe.walk.down, {
      frameWidth: 32,
      frameHeight: 32
    });
    
    // Load UI elements
    this.scene.load.image('heart-full', SPRITE_PATHS.ui.heartFull);
    this.scene.load.image('heart-half', SPRITE_PATHS.ui.heartHalf);
    this.scene.load.image('heart-empty', SPRITE_PATHS.ui.heartEmpty);
    this.scene.load.image('hp-bar', SPRITE_PATHS.ui.hpBar);
    
    // Load item icons
    this.scene.load.image('icon-pistol', SPRITE_PATHS.items.pistol);
    this.scene.load.image('icon-shotgun', SPRITE_PATHS.items.shotgun);
    this.scene.load.image('icon-bat', SPRITE_PATHS.items.bat);
    this.scene.load.image('icon-ammo-blue', SPRITE_PATHS.items.bulletBoxBlue);
    this.scene.load.image('icon-ammo-green', SPRITE_PATHS.items.bulletBoxGreen);
    this.scene.load.image('icon-medkit', SPRITE_PATHS.items.firstAidKit);
    this.scene.load.image('icon-food', SPRITE_PATHS.items.cannedSoup);
    this.scene.load.image('icon-bandage', SPRITE_PATHS.items.bandage);
    
    // Load environment tiles
    this.scene.load.image('tile-grass', SPRITE_PATHS.tiles.grass);
    this.scene.load.image('tile-road', SPRITE_PATHS.tiles.road);
    this.scene.load.image('tile-dirt', SPRITE_PATHS.tiles.dirt);
    
    // Load objects
    this.scene.load.image('obj-barrel', SPRITE_PATHS.objects.barrel);
    this.scene.load.image('obj-crate', SPRITE_PATHS.objects.crate);
    this.scene.load.image('obj-car', SPRITE_PATHS.objects.car);
  }
  
  createAnimations() {
    // Player animations
    this.scene.anims.create({
      key: 'player-idle',
      frames: this.scene.anims.generateFrameNumbers('player-idle-down', { start: 0, end: 5 }),
      frameRate: 8,
      repeat: -1
    });
    
    // Zombie animations
    this.scene.anims.create({
      key: 'zombie-small-idle',
      frames: this.scene.anims.generateFrameNumbers('zombie-small-idle', { start: 0, end: 5 }),
      frameRate: 6,
      repeat: -1
    });
    
    this.scene.anims.create({
      key: 'zombie-small-walk',
      frames: this.scene.anims.generateFrameNumbers('zombie-small-walk', { start: 0, end: 5 }),
      frameRate: 8,
      repeat: -1
    });
    
    this.scene.anims.create({
      key: 'zombie-big-idle',
      frames: this.scene.anims.generateFrameNumbers('zombie-big-idle', { start: 0, end: 5 }),
      frameRate: 6,
      repeat: -1
    });
    
    this.scene.anims.create({
      key: 'zombie-big-walk',
      frames: this.scene.anims.generateFrameNumbers('zombie-big-walk', { start: 0, end: 5 }),
      frameRate: 8,
      repeat: -1
    });
    
    this.scene.anims.create({
      key: 'zombie-axe-idle',
      frames: this.scene.anims.generateFrameNumbers('zombie-axe-idle', { start: 0, end: 5 }),
      frameRate: 6,
      repeat: -1
    });
    
    this.scene.anims.create({
      key: 'zombie-axe-walk',
      frames: this.scene.anims.generateFrameNumbers('zombie-axe-walk', { start: 0, end: 5 }),
      frameRate: 8,
      repeat: -1
    });
  }
}