export class MapGenerator {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  generateMap(width: number, height: number) {
    const tiles: number[][] = [];
    
    // Initialize with empty tiles
    for (let y = 0; y < height; y++) {
      tiles[y] = [];
      for (let x = 0; x < width; x++) {
        tiles[y][x] = 0; // Empty
      }
    }
    
    // Add border walls
    for (let x = 0; x < width; x++) {
      tiles[0][x] = 1; // Wall
      tiles[height - 1][x] = 1; // Wall
    }
    for (let y = 0; y < height; y++) {
      tiles[y][0] = 1; // Wall
      tiles[y][width - 1] = 1; // Wall
    }
    
    // Generate buildings
    const numBuildings = Math.floor((width * height) / 200);
    for (let i = 0; i < numBuildings; i++) {
      const buildingWidth = Phaser.Math.Between(3, 8);
      const buildingHeight = Phaser.Math.Between(3, 8);
      const x = Phaser.Math.Between(2, width - buildingWidth - 2);
      const y = Phaser.Math.Between(2, height - buildingHeight - 2);
      
      // Check if space is clear
      let canPlace = true;
      for (let by = 0; by < buildingHeight; by++) {
        for (let bx = 0; bx < buildingWidth; bx++) {
          if (tiles[y + by][x + bx] !== 0) {
            canPlace = false;
            break;
          }
        }
      }
      
      if (canPlace) {
        // Place building walls
        for (let by = 0; by < buildingHeight; by++) {
          for (let bx = 0; bx < buildingWidth; bx++) {
            if (by === 0 || by === buildingHeight - 1 || bx === 0 || bx === buildingWidth - 1) {
              tiles[y + by][x + bx] = 2; // Building wall
            }
          }
        }
        
        // Add door
        const doorSide = Phaser.Math.Between(0, 3);
        switch (doorSide) {
          case 0: // Top
            tiles[y][x + Math.floor(buildingWidth / 2)] = 0;
            break;
          case 1: // Bottom
            tiles[y + buildingHeight - 1][x + Math.floor(buildingWidth / 2)] = 0;
            break;
          case 2: // Left
            tiles[y + Math.floor(buildingHeight / 2)][x] = 0;
            break;
          case 3: // Right
            tiles[y + Math.floor(buildingHeight / 2)][x + buildingWidth - 1] = 0;
            break;
        }
      }
    }
    
    // Add random obstacles
    const numObstacles = Math.floor((width * height) / 100);
    for (let i = 0; i < numObstacles; i++) {
      const x = Phaser.Math.Between(1, width - 2);
      const y = Phaser.Math.Between(1, height - 2);
      if (tiles[y][x] === 0) {
        tiles[y][x] = 1; // Wall/obstacle
      }
    }
    
    return {
      width,
      height,
      tiles
    };
  }
}