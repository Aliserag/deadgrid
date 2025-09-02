import * as Phaser from 'phaser';
import { useGameStore } from '../store/gameStore';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;
    
    // Background
    this.add.rectangle(0, 0, width, height, 0x1a1a1a).setOrigin(0);
    
    // Title
    const title = this.add.text(width / 2, height / 3, 'DEADGRID', {
      fontSize: '72px',
      fontFamily: 'monospace',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 4,
    });
    title.setOrigin(0.5);
    
    // Subtitle
    const subtitle = this.add.text(width / 2, height / 3 + 80, 'Survive the Apocalypse', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#ffffff',
    });
    subtitle.setOrigin(0.5);
    
    // Menu options
    const menuOptions = [
      { text: 'New Game', callback: () => this.startNewGame() },
      { text: 'Continue', callback: () => this.continueGame() },
      { text: 'Settings', callback: () => this.openSettings() },
      { text: 'Credits', callback: () => this.showCredits() },
    ];
    
    menuOptions.forEach((option, index) => {
      const y = height / 2 + 50 + (index * 60);
      const button = this.add.rectangle(width / 2, y, 300, 50, 0x333333);
      button.setInteractive({ useHandCursor: true });
      
      const text = this.add.text(width / 2, y, option.text, {
        fontSize: '24px',
        fontFamily: 'monospace',
        color: '#ffffff',
      });
      text.setOrigin(0.5);
      
      button.on('pointerover', () => {
        button.setFillStyle(0x555555);
        text.setColor('#00ff00');
      });
      
      button.on('pointerout', () => {
        button.setFillStyle(0x333333);
        text.setColor('#ffffff');
      });
      
      button.on('pointerdown', option.callback);
    });
    
    // Add zombie decoration
    this.addZombieAnimation();
  }

  addZombieAnimation() {
    const zombie = this.add.sprite(-50, 600, 'zombie');
    zombie.setScale(2);
    
    this.tweens.add({
      targets: zombie,
      x: 1330,
      duration: 20000,
      repeat: -1,
      yoyo: false,
      onRepeat: () => {
        zombie.x = -50;
      }
    });
  }

  startNewGame() {
    const gameStore = useGameStore.getState();
    gameStore.resetGame();
    gameStore.setCurrentScene('GameScene');
    
    this.scene.start('GameScene');
    this.scene.start('UIScene');
  }

  continueGame() {
    const gameStore = useGameStore.getState();
    if (gameStore.day > 1) {
      this.scene.start('GameScene');
      this.scene.start('UIScene');
    } else {
      this.showMessage('No saved game found!');
    }
  }

  openSettings() {
    this.showMessage('Settings coming soon!');
  }

  showCredits() {
    const creditsText = this.add.text(640, 360, 
      'DeadGrid\n\nCreated with Phaser 3\nDeveloped by: You\nMusic: Coming Soon\n\nPress ESC to return', 
      {
        fontSize: '20px',
        fontFamily: 'monospace',
        color: '#ffffff',
        align: 'center',
      }
    );
    creditsText.setOrigin(0.5);
    creditsText.setDepth(100);
    
    const bg = this.add.rectangle(640, 360, 800, 400, 0x000000, 0.9);
    bg.setDepth(99);
    
    this.input.keyboard!.once('keydown-ESC', () => {
      creditsText.destroy();
      bg.destroy();
    });
  }

  showMessage(text: string) {
    const message = this.add.text(640, 500, text, {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#ffff00',
    });
    message.setOrigin(0.5);
    
    this.time.delayedCall(2000, () => {
      message.destroy();
    });
  }
}