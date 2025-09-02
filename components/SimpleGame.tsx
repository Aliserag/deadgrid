'use client';

import { useEffect, useRef, useState } from 'react';

interface Player {
  x: number;
  y: number;
  health: number;
  ammo: number;
  score: number;
}

interface Zombie {
  x: number;
  y: number;
  speed: number;
  health: number;
  type: 'normal' | 'fast' | 'tank';
}

interface Bullet {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

interface Item {
  x: number;
  y: number;
  type: 'health' | 'ammo';
}

export default function SimpleGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu');
  const [player, setPlayer] = useState<Player>({ x: 400, y: 300, health: 100, ammo: 50, score: 0 });
  const [highScore, setHighScore] = useState(0);
  
  const gameDataRef = useRef({
    player: { x: 400, y: 300, health: 100, ammo: 50, score: 0 },
    zombies: [] as Zombie[],
    bullets: [] as Bullet[],
    items: [] as Item[],
    keys: {} as Record<string, boolean>,
    mouseX: 400,
    mouseY: 300,
    wave: 1,
    zombiesKilled: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let lastTime = 0;
    let zombieSpawnTimer = 0;
    let itemSpawnTimer = 0;

    // Game loop
    const gameLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      if (gameState === 'playing') {
        update(deltaTime);
        render(ctx);
      } else if (gameState === 'menu') {
        renderMenu(ctx);
      } else if (gameState === 'gameover') {
        renderGameOver(ctx);
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    const update = (deltaTime: number) => {
      const data = gameDataRef.current;
      
      // Update player position
      const speed = 5;
      if (data.keys['w'] || data.keys['ArrowUp']) data.player.y -= speed;
      if (data.keys['s'] || data.keys['ArrowDown']) data.player.y += speed;
      if (data.keys['a'] || data.keys['ArrowLeft']) data.player.x -= speed;
      if (data.keys['d'] || data.keys['ArrowRight']) data.player.x += speed;
      
      // Keep player in bounds
      data.player.x = Math.max(20, Math.min(780, data.player.x));
      data.player.y = Math.max(20, Math.min(580, data.player.y));

      // Update bullets
      data.bullets = data.bullets.filter(bullet => {
        bullet.x += bullet.dx * 10;
        bullet.y += bullet.dy * 10;
        
        // Check zombie hits
        for (let i = data.zombies.length - 1; i >= 0; i--) {
          const zombie = data.zombies[i];
          const dist = Math.hypot(zombie.x - bullet.x, zombie.y - bullet.y);
          if (dist < 20) {
            zombie.health -= 25;
            if (zombie.health <= 0) {
              data.zombies.splice(i, 1);
              data.player.score += zombie.type === 'tank' ? 30 : zombie.type === 'fast' ? 20 : 10;
              data.zombiesKilled++;
              
              // Chance to drop item
              if (Math.random() < 0.3) {
                data.items.push({
                  x: zombie.x,
                  y: zombie.y,
                  type: Math.random() < 0.5 ? 'health' : 'ammo'
                });
              }
            }
            return false;
          }
        }
        
        return bullet.x > 0 && bullet.x < 800 && bullet.y > 0 && bullet.y < 600;
      });

      // Update zombies
      data.zombies.forEach(zombie => {
        const dx = data.player.x - zombie.x;
        const dy = data.player.y - zombie.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist > 0) {
          zombie.x += (dx / dist) * zombie.speed;
          zombie.y += (dy / dist) * zombie.speed;
        }
        
        // Check player collision
        if (dist < 30) {
          data.player.health -= 1;
          if (data.player.health <= 0) {
            setGameState('gameover');
            if (data.player.score > highScore) {
              setHighScore(data.player.score);
            }
          }
        }
      });

      // Collect items
      data.items = data.items.filter(item => {
        const dist = Math.hypot(item.x - data.player.x, item.y - data.player.y);
        if (dist < 30) {
          if (item.type === 'health') {
            data.player.health = Math.min(100, data.player.health + 20);
          } else {
            data.player.ammo += 10;
          }
          return false;
        }
        return true;
      });

      // Spawn zombies
      zombieSpawnTimer += deltaTime;
      if (zombieSpawnTimer > 2000 - (data.wave * 100)) {
        zombieSpawnTimer = 0;
        spawnZombie();
      }

      // Spawn items
      itemSpawnTimer += deltaTime;
      if (itemSpawnTimer > 10000) {
        itemSpawnTimer = 0;
        if (data.items.length < 3) {
          data.items.push({
            x: Math.random() * 760 + 20,
            y: Math.random() * 560 + 20,
            type: Math.random() < 0.5 ? 'health' : 'ammo'
          });
        }
      }

      // Increase wave difficulty
      if (data.zombiesKilled > data.wave * 10) {
        data.wave++;
      }

      // Update React state periodically
      setPlayer({ ...data.player });
    };

    const spawnZombie = () => {
      const data = gameDataRef.current;
      const side = Math.floor(Math.random() * 4);
      let x, y;
      
      switch(side) {
        case 0: x = Math.random() * 800; y = -20; break;
        case 1: x = 820; y = Math.random() * 600; break;
        case 2: x = Math.random() * 800; y = 620; break;
        default: x = -20; y = Math.random() * 600; break;
      }
      
      const types: Array<'normal' | 'fast' | 'tank'> = ['normal', 'normal', 'normal', 'fast', 'tank'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      data.zombies.push({
        x,
        y,
        speed: type === 'fast' ? 2 : type === 'tank' ? 0.5 : 1,
        health: type === 'tank' ? 100 : type === 'fast' ? 50 : 75,
        type
      });
    };

    const render = (ctx: CanvasRenderingContext2D) => {
      const data = gameDataRef.current;
      
      // Clear canvas
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, 800, 600);
      
      // Draw grid
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      for (let i = 0; i < 800; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 600);
        ctx.stroke();
      }
      for (let i = 0; i < 600; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(800, i);
        ctx.stroke();
      }
      
      // Draw items
      data.items.forEach(item => {
        ctx.fillStyle = item.type === 'health' ? '#00ff00' : '#ffff00';
        ctx.beginPath();
        ctx.arc(item.x, item.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(item.type === 'health' ? '+' : '⁍', item.x, item.y + 4);
      });
      
      // Draw zombies
      data.zombies.forEach(zombie => {
        ctx.fillStyle = zombie.type === 'tank' ? '#666' : zombie.type === 'fast' ? '#ff6666' : '#8b4513';
        ctx.beginPath();
        ctx.arc(zombie.x, zombie.y, zombie.type === 'tank' ? 25 : 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Zombie face
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(zombie.x - 5, zombie.y - 5, 3, 0, Math.PI * 2);
        ctx.arc(zombie.x + 5, zombie.y - 5, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw bullets
      ctx.fillStyle = '#ffff00';
      data.bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw player
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.arc(data.player.x, data.player.y, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw player direction
      const angle = Math.atan2(data.mouseY - data.player.y, data.mouseX - data.player.x);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(data.player.x, data.player.y);
      ctx.lineTo(
        data.player.x + Math.cos(angle) * 20,
        data.player.y + Math.sin(angle) * 20
      );
      ctx.stroke();
      
      // Draw HUD
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, 200, 80);
      
      ctx.fillStyle = '#fff';
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Health: ${data.player.health}`, 20, 30);
      ctx.fillText(`Ammo: ${data.player.ammo}`, 20, 50);
      ctx.fillText(`Score: ${data.player.score}`, 20, 70);
      
      ctx.fillText(`Wave: ${data.wave}`, 700, 30);
      ctx.fillText(`Zombies: ${data.zombies.length}`, 700, 50);
    };

    const renderMenu = (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 800, 600);
      
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('DEADGRID', 400, 200);
      
      ctx.fillStyle = '#fff';
      ctx.font = '20px monospace';
      ctx.fillText('Simple 2D Zombie Survival', 400, 250);
      
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(300, 320, 200, 50);
      ctx.fillStyle = '#fff';
      ctx.fillText('Start Game', 400, 350);
      
      ctx.fillStyle = '#666';
      ctx.font = '16px monospace';
      ctx.fillText('WASD/Arrows: Move', 400, 420);
      ctx.fillText('Mouse: Aim', 400, 450);
      ctx.fillText('Click: Shoot', 400, 480);
      
      if (highScore > 0) {
        ctx.fillStyle = '#ffff00';
        ctx.fillText(`High Score: ${highScore}`, 400, 540);
      }
    };

    const renderGameOver = (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, 800, 600);
      
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', 400, 250);
      
      ctx.fillStyle = '#fff';
      ctx.font = '24px monospace';
      ctx.fillText(`Final Score: ${gameDataRef.current.player.score}`, 400, 300);
      ctx.fillText(`Wave Reached: ${gameDataRef.current.wave}`, 400, 340);
      
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(300, 400, 200, 50);
      ctx.fillStyle = '#fff';
      ctx.fillText('Play Again', 400, 430);
    };

    // Event handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      gameDataRef.current.keys[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      gameDataRef.current.keys[e.key] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      gameDataRef.current.mouseX = e.clientX - rect.left;
      gameDataRef.current.mouseY = e.clientY - rect.top;
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      if (gameState === 'menu') {
        if (clickX > 300 && clickX < 500 && clickY > 320 && clickY < 370) {
          // Reset game
          gameDataRef.current = {
            player: { x: 400, y: 300, health: 100, ammo: 50, score: 0 },
            zombies: [],
            bullets: [],
            items: [],
            keys: {},
            mouseX: 400,
            mouseY: 300,
            wave: 1,
            zombiesKilled: 0,
          };
          setGameState('playing');
        }
      } else if (gameState === 'gameover') {
        if (clickX > 300 && clickX < 500 && clickY > 400 && clickY < 450) {
          setGameState('menu');
        }
      } else if (gameState === 'playing') {
        const data = gameDataRef.current;
        if (data.player.ammo > 0) {
          const angle = Math.atan2(clickY - data.player.y, clickX - data.player.x);
          data.bullets.push({
            x: data.player.x,
            y: data.player.y,
            dx: Math.cos(angle),
            dy: Math.sin(angle)
          });
          data.player.ammo--;
        }
      }
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    // Start game loop
    animationId = requestAnimationFrame(gameLoop);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [gameState, highScore]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <h1 className="text-4xl font-bold text-red-600 mb-4">DEADGRID</h1>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border-4 border-red-900 shadow-2xl bg-black"
      />
      <div className="mt-4 flex gap-4 text-white">
        <div className="bg-gray-800 px-4 py-2 rounded">
          Health: {player.health}
        </div>
        <div className="bg-gray-800 px-4 py-2 rounded">
          Ammo: {player.ammo}
        </div>
        <div className="bg-gray-800 px-4 py-2 rounded">
          Score: {player.score}
        </div>
      </div>
    </div>
  );
}