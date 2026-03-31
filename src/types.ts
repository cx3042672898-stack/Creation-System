export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  type?: string;
}

export interface GameStatus {
  date: string;
  time: string;
  funds: string;
  reputation: string;
  scene: string;
  protagonist: {
    name: string;
    state: string;
    description: string;
    portrait: string;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    sanity: number;
    maxSanity: number;
    exp: number;
    level: number;
  };
  characters: string[];
  menu: string[];
  worldDescription: string;
  inventory: InventoryItem[];
  pregnancyLog?: Record<string, { 
    pregnant: boolean; 
    progress: number; 
    count?: number; 
    father?: string; 
    dueDate?: number | string;
    conceptionDate?: string;
    attempts?: number;
  }>;
  relationships?: Record<string, any>;
  mainPlotLog?: any[];
  explorationLog?: any[];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  summary?: string;
  aiProvider?: string;
  collapsed?: boolean;
  timestamp?: number;
  status?: GameStatus;
}

export interface SaveData {
  id: string;
  timestamp: number;
  world: string;
  protagonistName: string;
  summary: string;
  messages: Message[];
  status: GameStatus;
  initStep: number;
  initChoices: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

export interface GameConfig {
  perspective: '第一人称' | '第二人称' | '第三人称' | string;
  wordCount: number;
  model: string;
  baseUrl: string;
  memoryLimit: number;
  customInstructions: string;
  narrativeStyle: string;
  claudeApiKey: string;
  claudeModel: string;
  zhipuApiKey?: string;
  zhipuModel?: string;
  aiProvider: 'gemini' | 'claude' | 'dual' | 'zhipu' | string;
  claudeRole: string;
}

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
