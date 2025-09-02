export interface IContentGenerator<T> {
  generate(seed?: string): Promise<T>;
  validate(content: T): boolean;
}

export interface IEventSystem {
  registerEvent(event: IGameEvent): void;
  triggerEvent(eventId: string, context: IEventContext): void;
  getActiveEvents(): IGameEvent[];
}

export interface IGameEvent {
  id: string;
  title: string;
  description: string;
  conditions?: IEventCondition[];
  effects: IEventEffect[];
  choices?: IEventChoice[];
  metadata?: Record<string, any>;
}

export interface IEventCondition {
  type: string;
  evaluate(context: IEventContext): boolean;
}

export interface IEventEffect {
  type: string;
  apply(context: IEventContext): void;
}

export interface IEventChoice {
  id: string;
  text: string;
  requirements?: IRequirement[];
  effects: IEventEffect[];
}

export interface IEventContext {
  gameState: IGameState;
  player: IPlayer;
  location?: ILocation;
  npcs?: INPC[];
  timestamp: number;
}

export interface IRequirement {
  type: string;
  check(context: any): boolean;
}

export interface IGameState {
  getCurrentTurn(): number;
  getPlayer(): IPlayer;
  getWorld(): IWorld;
  getNPCs(): INPC[];
  getZombies(): IZombie[];
}

export interface IWorld {
  getMap(): IMap;
  getWeather(): IWeather;
  getTimeOfDay(): number;
  getLocations(): ILocation[];
}

export interface IMap {
  getTile(x: number, y: number): ITile;
  getVisibleTiles(position: IPosition, range: number): ITile[];
  generateChunk(x: number, y: number): void;
}

export interface ITile {
  position: IPosition;
  terrain: string;
  properties: Record<string, any>;
  entities: IEntity[];
}

export interface IEntity {
  id: string;
  type: string;
  position: IPosition;
  properties: Record<string, any>;
  update(context: IGameState): void;
}

export interface IPosition {
  x: number;
  y: number;
}

export interface IPlayer extends IEntity {
  health: number;
  inventory: IInventory;
  stats: IPlayerStats;
  skills: ISkill[];
}

export interface INPC extends IEntity {
  name: string;
  faction: string;
  personality: IPersonality;
  dialogue: IDialogueTree;
  behavior: IBehavior;
}

export interface IZombie extends IEntity {
  variant: string;
  aggression: number;
  behavior: IBehavior;
}

export interface IBehavior {
  decide(context: IGameState): IAction;
  execute(action: IAction): void;
}

export interface IAction {
  type: string;
  target?: IEntity;
  parameters?: Record<string, any>;
}

export interface IInventory {
  items: IItem[];
  capacity: number;
  add(item: IItem): boolean;
  remove(itemId: string): IItem | null;
}

export interface IItem {
  id: string;
  name: string;
  category: string;
  properties: Record<string, any>;
  effects?: IItemEffect[];
}

export interface IItemEffect {
  type: string;
  apply(target: IEntity): void;
}

export interface ILocation {
  id: string;
  name: string;
  type: string;
  position: IPosition;
  properties: Record<string, any>;
  loot?: ILootTable;
  npcs?: INPC[];
}

export interface ILootTable {
  generate(): IItem[];
  addEntry(item: IItem, weight: number): void;
}

export interface IWeather {
  type: string;
  intensity: number;
  effects: IWeatherEffect[];
}

export interface IWeatherEffect {
  type: string;
  modifier: number;
}

export interface IPlayerStats {
  hunger: number;
  thirst: number;
  stamina: number;
  morale: number;
  infection: number;
}

export interface ISkill {
  id: string;
  name: string;
  level: number;
  experience: number;
}

export interface IPersonality {
  traits: Record<string, number>;
  mood: number;
  trust: Record<string, number>;
}

export interface IDialogueTree {
  nodes: IDialogueNode[];
  currentNode: string;
}

export interface IDialogueNode {
  id: string;
  text: string;
  responses: IDialogueResponse[];
}

export interface IDialogueResponse {
  text: string;
  nextNode: string;
  effects?: IEventEffect[];
}

export interface IQuest {
  id: string;
  title: string;
  description: string;
  giver?: string;
  objectives: IObjective[];
  rewards: IReward[];
  status: 'inactive' | 'active' | 'completed' | 'failed';
}

export interface IObjective {
  id: string;
  description: string;
  type: string;
  target: any;
  progress: number;
  required: number;
}

export interface IReward {
  type: string;
  value: any;
}

export interface IStoryArc {
  id: string;
  title: string;
  chapters: IChapter[];
  currentChapter: number;
  metadata?: Record<string, any>;
}

export interface IChapter {
  id: string;
  title: string;
  events: IGameEvent[];
  quests: IQuest[];
  conditions: IEventCondition[];
}