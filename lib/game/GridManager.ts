/**
 * Grid Manager - Handles tile-based grid system
 */

export interface GridPosition {
  x: number;
  y: number;
}

export interface GridEntity {
  id: string;
  position: GridPosition;
  sprite: Phaser.GameObjects.Sprite;
  type: 'player' | 'zombie' | 'npc' | 'item' | 'obstacle';
}

export class GridManager {
  private tileSize: number = 48;
  private gridWidth: number;
  private gridHeight: number;
  private entities: Map<string, GridEntity> = new Map();
  private grid: (string | null)[][];
  
  constructor(width: number, height: number, tileSize: number = 48) {
    this.gridWidth = width;
    this.gridHeight = height;
    this.tileSize = tileSize;
    
    // Initialize empty grid
    this.grid = Array(height).fill(null).map(() => Array(width).fill(null));
  }
  
  /**
   * Convert grid position to world position
   */
  gridToWorld(gridPos: GridPosition): { x: number; y: number } {
    return {
      x: gridPos.x * this.tileSize + this.tileSize / 2,
      y: gridPos.y * this.tileSize + this.tileSize / 2
    };
  }
  
  /**
   * Convert world position to grid position
   */
  worldToGrid(worldX: number, worldY: number): GridPosition {
    return {
      x: Math.floor(worldX / this.tileSize),
      y: Math.floor(worldY / this.tileSize)
    };
  }
  
  /**
   * Check if position is within grid bounds
   */
  isValidPosition(pos: GridPosition): boolean {
    return pos.x >= 0 && pos.x < this.gridWidth && 
           pos.y >= 0 && pos.y < this.gridHeight;
  }
  
  /**
   * Check if position is occupied
   */
  isOccupied(pos: GridPosition): boolean {
    if (!this.isValidPosition(pos)) return true;
    return this.grid[pos.y][pos.x] !== null;
  }
  
  /**
   * Get entity at position
   */
  getEntityAt(pos: GridPosition): GridEntity | null {
    if (!this.isValidPosition(pos)) return null;
    const entityId = this.grid[pos.y][pos.x];
    return entityId ? this.entities.get(entityId) || null : null;
  }
  
  /**
   * Add entity to grid
   */
  addEntity(entity: GridEntity): boolean {
    if (this.isOccupied(entity.position)) return false;
    
    this.entities.set(entity.id, entity);
    this.grid[entity.position.y][entity.position.x] = entity.id;
    
    // Update sprite position
    const worldPos = this.gridToWorld(entity.position);
    entity.sprite.setPosition(worldPos.x, worldPos.y);
    
    return true;
  }
  
  /**
   * Remove entity from grid
   */
  removeEntity(entityId: string): boolean {
    const entity = this.entities.get(entityId);
    if (!entity) return false;
    
    this.grid[entity.position.y][entity.position.x] = null;
    this.entities.delete(entityId);
    
    return true;
  }
  
  /**
   * Move entity to new position
   */
  moveEntity(entityId: string, newPos: GridPosition): boolean {
    const entity = this.entities.get(entityId);
    if (!entity) return false;
    
    if (!this.isValidPosition(newPos) || this.isOccupied(newPos)) {
      return false;
    }
    
    // Clear old position
    this.grid[entity.position.y][entity.position.x] = null;
    
    // Update to new position
    entity.position = newPos;
    this.grid[newPos.y][newPos.x] = entityId;
    
    return true;
  }
  
  /**
   * Get all entities of a specific type
   */
  getEntitiesByType(type: string): GridEntity[] {
    return Array.from(this.entities.values()).filter(e => e.type === type);
  }
  
  /**
   * Calculate Manhattan distance between two positions
   */
  getDistance(pos1: GridPosition, pos2: GridPosition): number {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  }
  
  /**
   * Get adjacent positions (4-directional)
   */
  getAdjacentPositions(pos: GridPosition): GridPosition[] {
    const adjacent: GridPosition[] = [
      { x: pos.x - 1, y: pos.y },
      { x: pos.x + 1, y: pos.y },
      { x: pos.x, y: pos.y - 1 },
      { x: pos.x, y: pos.y + 1 }
    ];
    
    return adjacent.filter(p => this.isValidPosition(p));
  }
  
  /**
   * Find path between two positions (simple pathfinding)
   */
  findPath(start: GridPosition, end: GridPosition): GridPosition[] {
    // Simple pathfinding - move towards target
    const path: GridPosition[] = [];
    let current = { ...start };
    
    while (current.x !== end.x || current.y !== end.y) {
      let nextPos = { ...current };
      
      // Move horizontally first
      if (current.x < end.x) nextPos.x++;
      else if (current.x > end.x) nextPos.x--;
      // Then vertically
      else if (current.y < end.y) nextPos.y++;
      else if (current.y > end.y) nextPos.y--;
      
      // Check if next position is valid and not occupied
      if (this.isValidPosition(nextPos) && !this.isOccupied(nextPos)) {
        path.push(nextPos);
        current = nextPos;
      } else {
        // Try alternative path
        nextPos = { ...current };
        if (current.y < end.y) nextPos.y++;
        else if (current.y > end.y) nextPos.y--;
        else if (current.x < end.x) nextPos.x++;
        else if (current.x > end.x) nextPos.x--;
        
        if (this.isValidPosition(nextPos) && !this.isOccupied(nextPos)) {
          path.push(nextPos);
          current = nextPos;
        } else {
          break; // No path found
        }
      }
      
      // Prevent infinite loop
      if (path.length > 50) break;
    }
    
    return path;
  }
  
  /**
   * Get all entities within range of a position
   */
  getEntitiesInRange(pos: GridPosition, range: number): GridEntity[] {
    return Array.from(this.entities.values()).filter(entity => {
      const distance = this.getDistance(pos, entity.position);
      return distance <= range && distance > 0;
    });
  }
  
  /**
   * Draw grid lines (for debugging)
   */
  drawGrid(scene: Phaser.Scene): void {
    const graphics = scene.add.graphics();
    graphics.lineStyle(1, 0x444444, 0.3);
    
    // Draw vertical lines
    for (let x = 0; x <= this.gridWidth; x++) {
      graphics.moveTo(x * this.tileSize, 0);
      graphics.lineTo(x * this.tileSize, this.gridHeight * this.tileSize);
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= this.gridHeight; y++) {
      graphics.moveTo(0, y * this.tileSize);
      graphics.lineTo(this.gridWidth * this.tileSize, y * this.tileSize);
    }
    
    graphics.strokePath();
  }
  
  getTileSize(): number {
    return this.tileSize;
  }
  
  getGridWidth(): number {
    return this.gridWidth;
  }
  
  getGridHeight(): number {
    return this.gridHeight;
  }
}