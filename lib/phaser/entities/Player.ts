import * as Phaser from 'phaser';

export class Player {
  public sprite: Phaser.Physics.Arcade.Sprite;
  public health: number = 100;
  public maxHealth: number = 100;
  public stamina: number = 100;
  public maxStamina: number = 100;
  public speed: number = 160;
  public canAttack: boolean = true;
  private attackCooldown: number = 500;
  private lastAttackTime: number = 0;
  private scene: Phaser.Scene;
  private weapon?: Phaser.GameObjects.Sprite;
  private healthBar: Phaser.GameObjects.Graphics;
  private staminaBar: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    
    // Create sprite
    this.sprite = scene.physics.add.sprite(x, y, 'player_walk', 0);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setScale(1.5);
    this.sprite.setData('entity', this);
    
    // Setup animations
    this.createAnimations();
    
    // Create health and stamina bars
    this.healthBar = scene.add.graphics();
    this.staminaBar = scene.add.graphics();
    this.updateBars();
    
    // Create weapon sprite (initially hidden)
    this.weapon = scene.add.sprite(x, y, 'pistol');
    this.weapon.setVisible(false);
    this.weapon.setScale(0.5);
  }

  createAnimations() {
    // Walking animations
    if (!this.scene.anims.exists('player_walk_down')) {
      this.scene.anims.create({
        key: 'player_walk_down',
        frames: this.scene.anims.generateFrameNumbers('player_walk', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
      });
      
      this.scene.anims.create({
        key: 'player_walk_up',
        frames: this.scene.anims.generateFrameNumbers('player_walk', { start: 4, end: 7 }),
        frameRate: 10,
        repeat: -1
      });
      
      this.scene.anims.create({
        key: 'player_walk_side',
        frames: this.scene.anims.generateFrameNumbers('player_walk', { start: 8, end: 11 }),
        frameRate: 10,
        repeat: -1
      });
      
      this.scene.anims.create({
        key: 'player_idle',
        frames: [{ key: 'player_walk', frame: 0 }],
        frameRate: 1
      });
    }
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, wasd: any) {
    const velocity = { x: 0, y: 0 };
    let moving = false;
    
    // Movement
    if (cursors.left.isDown || wasd.A.isDown) {
      velocity.x = -this.speed;
      this.sprite.setFlipX(true);
      this.sprite.anims.play('player_walk_side', true);
      moving = true;
    } else if (cursors.right.isDown || wasd.D.isDown) {
      velocity.x = this.speed;
      this.sprite.setFlipX(false);
      this.sprite.anims.play('player_walk_side', true);
      moving = true;
    }
    
    if (cursors.up.isDown || wasd.W.isDown) {
      velocity.y = -this.speed;
      if (!moving) this.sprite.anims.play('player_walk_up', true);
      moving = true;
    } else if (cursors.down.isDown || wasd.S.isDown) {
      velocity.y = this.speed;
      if (!moving) this.sprite.anims.play('player_walk_down', true);
      moving = true;
    }
    
    // Diagonal movement adjustment
    if (velocity.x !== 0 && velocity.y !== 0) {
      velocity.x *= 0.707;
      velocity.y *= 0.707;
    }
    
    // Apply velocity
    this.sprite.setVelocity(velocity.x, velocity.y);
    
    // Play idle animation if not moving
    if (!moving) {
      this.sprite.anims.play('player_idle', true);
    }
    
    // Update stamina
    if (moving && this.stamina > 0) {
      this.stamina -= 0.1;
      if (this.stamina <= 0) {
        this.speed = 80; // Slow down when exhausted
      }
    } else if (!moving && this.stamina < this.maxStamina) {
      this.stamina += 0.2;
      if (this.stamina > 30) {
        this.speed = 160; // Normal speed when recovered
      }
    }
    
    // Update attack cooldown
    const currentTime = this.scene.time.now;
    this.canAttack = currentTime - this.lastAttackTime > this.attackCooldown;
    
    // Update UI bars
    this.updateBars();
    
    // Update weapon position
    if (this.weapon) {
      this.weapon.x = this.sprite.x + 15;
      this.weapon.y = this.sprite.y;
    }
  }

  attack() {
    if (!this.canAttack) return;
    
    this.lastAttackTime = this.scene.time.now;
    this.canAttack = false;
    
    // Show weapon briefly
    if (this.weapon) {
      this.weapon.setVisible(true);
      
      // Weapon swing animation
      this.scene.tweens.add({
        targets: this.weapon,
        angle: 90,
        duration: 200,
        yoyo: true,
        onComplete: () => {
          this.weapon!.setVisible(false);
          this.weapon!.angle = 0;
        }
      });
    }
    
    // Create attack effect
    const attackCircle = this.scene.add.circle(
      this.sprite.x + (this.sprite.flipX ? -30 : 30),
      this.sprite.y,
      30,
      0xffff00,
      0.3
    );
    
    this.scene.tweens.add({
      targets: attackCircle,
      alpha: 0,
      scale: 1.5,
      duration: 200,
      onComplete: () => attackCircle.destroy()
    });
  }

  takeDamage(amount: number) {
    this.health -= amount;
    
    // Flash red when hit
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(200, () => {
      this.sprite.clearTint();
    });
    
    // Screen shake
    this.scene.cameras.main.shake(200, 0.005);
    
    // Create damage text
    const damageText = this.scene.add.text(
      this.sprite.x,
      this.sprite.y - 30,
      `-${amount}`,
      {
        fontSize: '18px',
        color: '#ff0000',
        fontStyle: 'bold'
      }
    );
    
    this.scene.tweens.add({
      targets: damageText,
      y: this.sprite.y - 60,
      alpha: 0,
      duration: 1000,
      onComplete: () => damageText.destroy()
    });
    
    if (this.health <= 0) {
      this.die();
    }
  }

  heal(amount: number) {
    this.health = Math.min(this.health + amount, this.maxHealth);
    
    // Green flash for healing
    this.sprite.setTint(0x00ff00);
    this.scene.time.delayedCall(200, () => {
      this.sprite.clearTint();
    });
  }

  die() {
    this.sprite.setTint(0x666666);
    this.sprite.setVelocity(0, 0);
    
    // Death animation
    this.scene.tweens.add({
      targets: this.sprite,
      angle: 90,
      alpha: 0.5,
      duration: 1000,
      onComplete: () => {
        // Game over
        this.scene.scene.start('MenuScene');
      }
    });
  }

  updateBars() {
    this.healthBar.clear();
    this.staminaBar.clear();
    
    const barWidth = 40;
    const barHeight = 4;
    const x = this.sprite.x - barWidth / 2;
    const yHealth = this.sprite.y - 35;
    const yStamina = this.sprite.y - 30;
    
    // Health bar background
    this.healthBar.fillStyle(0x000000, 0.5);
    this.healthBar.fillRect(x, yHealth, barWidth, barHeight);
    
    // Health bar fill
    const healthPercent = this.health / this.maxHealth;
    const healthColor = healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xffff00 : 0xff0000;
    this.healthBar.fillStyle(healthColor, 1);
    this.healthBar.fillRect(x, yHealth, barWidth * healthPercent, barHeight);
    
    // Stamina bar background
    this.staminaBar.fillStyle(0x000000, 0.5);
    this.staminaBar.fillRect(x, yStamina, barWidth, barHeight);
    
    // Stamina bar fill
    const staminaPercent = this.stamina / this.maxStamina;
    this.staminaBar.fillStyle(0x0099ff, 1);
    this.staminaBar.fillRect(x, yStamina, barWidth * staminaPercent, barHeight);
  }
}