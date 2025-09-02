import * as Phaser from 'phaser';

export class Zombie {
  public sprite: Phaser.Physics.Arcade.Sprite;
  public health: number;
  public maxHealth: number;
  public speed: number;
  public damage: number;
  public isDead: boolean = false;
  public type: 'walker' | 'runner' | 'tank';
  private scene: Phaser.Scene;
  private healthBar: Phaser.GameObjects.Graphics;
  private lastAttackTime: number = 0;
  private attackCooldown: number = 1500;
  private detectionRange: number = 200;
  private attackRange: number = 30;

  constructor(scene: Phaser.Scene, x: number, y: number, type: 'walker' | 'runner' | 'tank' = 'walker') {
    this.scene = scene;
    this.type = type;
    
    // Set stats based on type
    switch (type) {
      case 'walker':
        this.health = 50;
        this.maxHealth = 50;
        this.speed = 30;
        this.damage = 10;
        break;
      case 'runner':
        this.health = 30;
        this.maxHealth = 30;
        this.speed = 80;
        this.damage = 15;
        this.detectionRange = 300;
        break;
      case 'tank':
        this.health = 150;
        this.maxHealth = 150;
        this.speed = 20;
        this.damage = 25;
        this.attackRange = 40;
        break;
    }
    
    // Create sprite
    this.sprite = scene.physics.add.sprite(x, y, 'zombie_walk', 0);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setScale(1.2);
    this.sprite.setData('entity', this);
    this.sprite.setData('type', 'zombie');
    
    // Apply tint based on type
    if (type === 'runner') {
      this.sprite.setTint(0xff9999);
    } else if (type === 'tank') {
      this.sprite.setTint(0x666666);
      this.sprite.setScale(1.8);
    }
    
    // Create animations
    this.createAnimations();
    
    // Create health bar
    this.healthBar = scene.add.graphics();
    this.updateHealthBar();
  }

  createAnimations() {
    if (!this.scene.anims.exists('zombie_walk_anim')) {
      this.scene.anims.create({
        key: 'zombie_walk_anim',
        frames: this.scene.anims.generateFrameNumbers('zombie_walk', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1
      });
      
      this.scene.anims.create({
        key: 'zombie_idle',
        frames: [{ key: 'zombie_walk', frame: 0 }],
        frameRate: 1
      });
    }
  }

  update(playerX: number, playerY: number) {
    if (this.isDead) return;
    
    // Calculate distance to player
    const distance = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      playerX,
      playerY
    );
    
    // AI behavior
    if (distance < this.detectionRange) {
      // Move towards player
      const angle = Phaser.Math.Angle.Between(
        this.sprite.x,
        this.sprite.y,
        playerX,
        playerY
      );
      
      const velocityX = Math.cos(angle) * this.speed;
      const velocityY = Math.sin(angle) * this.speed;
      
      this.sprite.setVelocity(velocityX, velocityY);
      
      // Face the player
      if (velocityX < 0) {
        this.sprite.setFlipX(true);
      } else {
        this.sprite.setFlipX(false);
      }
      
      // Play walk animation
      this.sprite.anims.play('zombie_walk_anim', true);
      
      // Attack if in range
      if (distance < this.attackRange) {
        this.attack();
      }
      
      // Groaning sound chance (simulated)
      if (Math.random() < 0.001) {
        this.groan();
      }
    } else {
      // Wander randomly
      if (Math.random() < 0.02) {
        const randomAngle = Math.random() * Math.PI * 2;
        const wanderSpeed = this.speed * 0.3;
        
        this.sprite.setVelocity(
          Math.cos(randomAngle) * wanderSpeed,
          Math.sin(randomAngle) * wanderSpeed
        );
      }
      
      // Play idle animation if not moving much
      if (Math.abs(this.sprite.body!.velocity.x) < 10 && Math.abs(this.sprite.body!.velocity.y) < 10) {
        this.sprite.anims.play('zombie_idle', true);
      } else {
        this.sprite.anims.play('zombie_walk_anim', true);
      }
    }
    
    // Update health bar position
    this.updateHealthBar();
  }

  attack() {
    const currentTime = this.scene.time.now;
    if (currentTime - this.lastAttackTime < this.attackCooldown) return;
    
    this.lastAttackTime = currentTime;
    
    // Attack animation
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(200, () => {
      if (!this.isDead) {
        this.sprite.clearTint();
        if (this.type === 'runner') {
          this.sprite.setTint(0xff9999);
        } else if (this.type === 'tank') {
          this.sprite.setTint(0x666666);
        }
      }
    });
    
    // Create attack effect
    const attackCircle = this.scene.add.circle(
      this.sprite.x,
      this.sprite.y,
      this.attackRange,
      0xff0000,
      0.2
    );
    
    this.scene.tweens.add({
      targets: attackCircle,
      alpha: 0,
      scale: 1.5,
      duration: 300,
      onComplete: () => attackCircle.destroy()
    });
  }

  takeDamage(amount: number) {
    this.health -= amount;
    
    // Flash white when hit
    this.sprite.setTint(0xffffff);
    this.scene.time.delayedCall(100, () => {
      if (!this.isDead) {
        this.sprite.clearTint();
        if (this.type === 'runner') {
          this.sprite.setTint(0xff9999);
        } else if (this.type === 'tank') {
          this.sprite.setTint(0x666666);
        }
      }
    });
    
    // Blood effect
    const blood = this.scene.add.circle(
      this.sprite.x + Phaser.Math.Between(-10, 10),
      this.sprite.y + Phaser.Math.Between(-10, 10),
      3,
      0x8b0000,
      1
    );
    
    this.scene.tweens.add({
      targets: blood,
      alpha: 0,
      scale: 2,
      duration: 500,
      onComplete: () => blood.destroy()
    });
    
    // Knockback
    const knockbackAngle = Phaser.Math.Angle.Between(
      this.sprite.x,
      this.sprite.y,
      this.sprite.x - this.sprite.body!.velocity.x,
      this.sprite.y - this.sprite.body!.velocity.y
    );
    
    this.sprite.setVelocity(
      Math.cos(knockbackAngle) * 100,
      Math.sin(knockbackAngle) * 100
    );
    
    if (this.health <= 0) {
      this.die();
    }
    
    this.updateHealthBar();
  }

  groan() {
    // Create visual groan indicator
    const groanText = this.scene.add.text(
      this.sprite.x,
      this.sprite.y - 40,
      'Grr...',
      {
        fontSize: '12px',
        color: '#ff6666',
      }
    );
    
    this.scene.tweens.add({
      targets: groanText,
      y: this.sprite.y - 60,
      alpha: 0,
      duration: 1500,
      onComplete: () => groanText.destroy()
    });
  }

  die() {
    this.isDead = true;
    this.sprite.setTint(0x333333);
    this.sprite.setVelocity(0, 0);
    
    // Death animation
    this.scene.tweens.add({
      targets: this.sprite,
      angle: 90,
      alpha: 0.5,
      duration: 500,
      onComplete: () => {
        // Leave corpse for a while
        this.scene.time.delayedCall(5000, () => {
          this.healthBar.destroy();
          this.sprite.destroy();
        });
      }
    });
    
    // Drop loot chance
    if (Math.random() < 0.3) {
      this.dropLoot();
    }
  }

  dropLoot() {
    const lootTypes = ['ammo', 'food', 'medicine'];
    const lootType = Phaser.Math.RND.pick(lootTypes);
    
    const loot = this.scene.physics.add.sprite(
      this.sprite.x,
      this.sprite.y,
      `item_${lootType}`
    );
    loot.setData('type', lootType);
    loot.setData('id', `loot_${Date.now()}`);
    
    // Add to items group if it exists
    const gameScene = this.scene as any;
    if (gameScene.items) {
      gameScene.items.add(loot);
    }
    
    // Floating animation
    this.scene.tweens.add({
      targets: loot,
      y: loot.y - 5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  updateHealthBar() {
    this.healthBar.clear();
    
    if (this.isDead || this.health === this.maxHealth) return;
    
    const barWidth = 30;
    const barHeight = 3;
    const x = this.sprite.x - barWidth / 2;
    const y = this.sprite.y - 30;
    
    // Background
    this.healthBar.fillStyle(0x000000, 0.5);
    this.healthBar.fillRect(x, y, barWidth, barHeight);
    
    // Health fill
    const healthPercent = this.health / this.maxHealth;
    this.healthBar.fillStyle(0xff0000, 1);
    this.healthBar.fillRect(x, y, barWidth * healthPercent, barHeight);
  }
}