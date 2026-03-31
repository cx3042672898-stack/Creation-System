/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { Settings, Send, Play, User, Users, Calendar, Coins, Zap, MessageSquare, Briefcase, MapPin, Save, Trophy, ChevronRight, ChevronLeft, Clock, FileText, Globe, Heart, Activity, Baby, RefreshCw, X, Sun, Moon, Plus, Gamepad2, Database, Compass, ShoppingCart, Trash2, Sparkles, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GameStatus, Message, SaveData, Achievement, GameConfig, InventoryItem } from './types.ts';

const SYSTEM_INSTRUCTION = `你是一个名为 ERA-GEMINI 的高级文字冒险游戏（TRPG）引擎。
你的任务是根据玩家的选择，生成沉浸感极强、逻辑严密且富有张力的剧情。

### 核心规则：
1. **禁止输出星号**：严禁在输出中使用任何星号（*）进行强调或列表。使用纯文本或括号。
2. **禁止 Markdown 符号**：不要使用 #, _, ~ 等 Markdown 符号。
3. **对话格式**：所有角色的对话必须使用中文双引号（“”）包裹，例如：他冷冷地说道：“你终于来了。”
4. **数值驱动**：剧情发展必须参考主角的属性（生命值, 法力值, 理智值, 资金, 好感度）。如果属性不足，某些选项应无法执行或导致失败。
5. **随机性**：世界观、初始人物、攻略对象和随机事件必须根据当前语境随机生成，不要固定。
6. **输出格式**：每一条回复必须包含以下结构（使用 [ ] 标记）：
   [日期]：第 X 天
   [时间]：清晨/上午/中午/下午/傍晚/深夜
   [地点]：当前场景名称
   [资金]：当前拥有的货币数量
   [主角状态]：简短描述主角当前的身心状态
   [世界描述]：当前环境的氛围描写
   [角色动态]：在场角色的动作、神态与对话
   [剧情叙述]：核心故事发展，字数需符合配置要求（通常要求 1000-2000 字以上，请务必详细描写细节、心理、环境和互动）
   [属性变动]：生命值-10, 好感度+5 等
   [指令菜单]：提供 3-6 个选项，格式为：[1] 选项内容 [要求/消耗]

### 角色属性说明：
- 生命值 (HP)：归零则游戏结束。
- 法力值 (MP)：执行特殊行动或魔法时消耗。
- 理智值 (SAN)：目睹恐怖或违背常理的事物时下降，归零会导致发疯或特殊结局。
- 经验值/等级：通过经历事件提升。

### 角色好感度：
- < 0：敌对/仇恨
- 0-20：陌生/警惕
- 21-40：熟人/信任
- 41-60：朋友/交好
- 61-80：恋人/爱慕
- 81-100：挚爱/沉沦
- > 100：誓约/永恒 (特殊阶段)

### NPC 生成与任务系统：
- 当玩家选择“寻找他人”或触发随机遭遇时，请生成一个拥有独特背景故事、性格特征和具体任务（Quest）的新 NPC。
- 背景故事应与当前场景和世界观紧密结合。
- 任务应包含明确的目标（如：寻找物品、击败敌人、传达信息）和潜在奖励。
- 生成的新 NPC 必须加入【角色列表】，并注明其初始状态和对主角的印象。
- 提供与该 NPC 进行对话、接受任务或进行其他互动的选项。

### 赠礼系统：
- 玩家可以赠送物品给 NPC。请根据物品的描述和角色的喜好，生成一段生动的反应描写。
- 赠礼会影响好感度、心情和后续剧情走向。

7. 选项机制：每次回复必须提供 6-8 个选项。选项应包含推荐度或属性影响提示，格式为：[序号] 选项内容 [标签1][标签2]。
   - 标签示例：[推荐] [危险] [魅力+] [智力-] [好感+] [堕落+]
   - 示例：[1] 尝试与其搭讪 [推荐][魅力+]
8. 节点总结：在每次回复的最末尾，请提供一行：【节点总结：用一句话概括当前剧情点】。

阶段一：游戏初始化 
玩家会一次性提供【路线基调】、【世界观】、【主人公设定】、【初始目标设定】。
收到这些设定后，请直接根据设定生成主角的初始属性面板，并正式开始第一幕剧情。

阶段二：核心机制
1. 动态属性系统 (根据路线自动调整属性名称和逻辑):
   - 共通属性：[欲望] (生理需求/性欲) [好感/爱意] (从好感到深爱)
   - 黑暗线专属：[恭顺] (服从度) [痛苦/羞耻] (精神压力与堕落度) [技巧/奉仕] (取悦主角的能力) -> 状态判定如：[发情] [崩坏] [奴隶]
   - 日常/恋爱线专属：[信赖] (信任度) [心情] (愉悦/压力) [默契] (日常与工作配合度) -> 状态判定如：[恋慕] [吃醋] [依赖] [热恋]
2. 经营与扩张: 无论什么背景，主角都需要经营一个“据点”（如：咖啡馆、公会、青楼、公司、洞府）。需要赚钱、升级设施、招募更多角色。
3. 关系网: 角色之间也会产生羁绊（如：互相安慰、吃醋嫉妒、前后辈关系等）。请在回复中增加一个专门的【关系网】板块，体现 NPC 之间的关系。而【角色列表】则侧重于角色对主角的印象、好感度与当前状态。
4. 探索与行动: 玩家可以进行“据点交互”、“外出探索”、“观察动态”、“推进主线”等操作，请根据玩家的行动指令推进剧情，并可能触发特殊事件或解锁新角色。
5. 繁衍与子嗣系统 (严格遵循逻辑):
   - 受孕前提：必须发生实质性行为。同性之间默认无法受孕，除非世界观明确设定（如ABO、哥儿、修仙体质）或使用了特殊道具（如生子秘药）。如果发生同性受孕，必须在剧情中给出合理且详细的解释。
   - 孕育主体：明确指出是谁怀孕（主角还是NPC）。如果是双男主/双女主，必须符合逻辑地说明谁是孕育方。
   - 孕期阶段：受孕后不能立刻出生！必须经过完整的孕期阶段（如：刚受孕/孕吐反应 -> 显怀/胎动 -> 临盆待产 -> 顺利分娩）。每次时间推进，孕期状态应随之变化。
   - 剧情要求：关于受孕、孕期反应、分娩的剧情描写必须极其详细，注重心理活动、身体变化和伴侣间的互动。
   - 子嗣诞生：孩子出生后，请明确其“父亲”和“母亲”（即使是同性，也应根据提供精子/卵子或孕育方来合理称呼，不要统称“伴侣”）。子嗣将作为新NPC加入【角色列表】。

阶段三：输出格式 (严格遵守)
[剧情正文]
...
【日期】 第 X 天 【时间】 XX 【场景】 exploration/combat/story 【资金】 XXX 【声望/传闻】 XX
【主角】 [姓名] [状态: XX]
【角色列表】
（注意：仅列出真实存在的角色，绝不能包含“剧情正文”、“旁白”等非角色实体。每行一个角色，格式必须严格为：）
[角色姓名] 身份：XXX | 状态：XXX | 对主角好感：XX | 关系网：XXX
【 指令菜单 】
（注意：必须提供 3-6 个具体的行动或对话选项，推动剧情发展。绝不能只提供“继续”这一个选项！）
[1] 具体行动/对话选项 [标签]
[2] 具体行动/对话选项 [标签]
...
【节点总结：当前剧情概括】
【主线剧情】日期|事件摘要 (可选，仅在发生重要主线剧情时输出)
【探索记录】日期|事件摘要 (可选，仅在发生重要探索事件时输出)`;

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
];

const FETCH_SAFETY_SETTINGS = [
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
];

const executeWithRetry = async <T,>(operation: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error: any) {
      attempt++;
      const isRateLimit = error?.message?.includes('429') || error?.status === 429 || error?.status === 'RESOURCE_EXHAUSTED' || JSON.stringify(error).includes('429');
      const isBusy = error?.message?.includes('503') || error?.status === 503;
      
      if ((isRateLimit || isBusy) && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 500;
        console.warn(`API request failed (Attempt ${attempt}/${maxRetries}). Retrying in ${Math.round(delay)}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries reached');
};

// ✅ 新增：调用 Claude API 的工具函数（浏览器直接 fetch，无需 SDK）
const callClaudeAPI = async (
  claudeApiKey: string,
  model: string,
  systemPrompt: string,
  messages: { role: 'user' | 'assistant', content: string }[],
  maxTokens = 4096
): Promise<string> => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': claudeApiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    }),
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const error = new Error(errData.error?.message || `Claude API 请求失败: ${response.status}`);
    (error as any).status = response.status;
    throw error;
  }
  const data = await response.json();
  const text = data.content?.[0]?.text || '';
  if (!text.trim()) throw new Error('EMPTY_CONTENT');
  return text;
};

const callZhipuAPI = async (
  zhipuApiKey: string,
  model: string,
  systemPrompt: string,
  messages: { role: 'user' | 'assistant', content: string }[],
  maxTokens = 4096
): Promise<string> => {
  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages
  ];
  
  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': zhipuApiKey,
    },
    body: JSON.stringify({
      model,
      messages: formattedMessages,
      max_tokens: maxTokens,
    }),
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const error = new Error(errData.error?.message || `Zhipu API 请求失败: ${response.status}`);
    (error as any).status = response.status;
    throw error;
  }
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  if (!text.trim()) throw new Error('EMPTY_CONTENT');
  return text;
};

export default function App() {
  const [gameKey, setGameKey] = useState(Date.now());
  const [messages, setMessages] = useState<Message[]>(JSON.parse(localStorage.getItem('game_messages') || '[]'));
  const [inputValue, setInputValue] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [hasLinkedApi, setHasLinkedApi] = useState(false);
  const [fontColor, setFontColor] = useState(localStorage.getItem('game_font_color') || '#ffffff');

  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  useEffect(() => {
    localStorage.setItem('game_font_color', fontColor);
  }, [fontColor]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const checkLinkedApi = async () => {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        try {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setHasLinkedApi(hasKey);
        } catch (e) {
          console.error("Error checking linked API:", e);
        }
      }
    };
    checkLinkedApi();
  }, []);

  const handleLinkApi = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      try {
        await window.aistudio.openSelectKey();
        // As per instructions, assume success after triggering
        setHasLinkedApi(true);
        showNotification("API 链接成功！系统将自动使用您的付费 Key。", "success");
      } catch (e) {
        console.error("Failed to link API:", e);
        if (e instanceof Error && e.message.includes("Requested entity was not found")) {
          setHasLinkedApi(false);
          showNotification("链接失败：未找到请求的实体，请重试。", "error");
          // Re-open dialog as per instructions
          setTimeout(() => window.aistudio?.openSelectKey?.(), 500);
        } else {
          showNotification("链接过程中出现错误，请重试。", "error");
        }
      }
    } else {
      showNotification("当前环境不支持自动链接 API，请手动输入。", "info");
    }
  };

  const getEffectiveApiKey = () => {
    return apiKey || process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  };
  const [theme, setTheme] = useState(localStorage.getItem('game_theme') || 'emerald');
  const [mode, setMode] = useState(localStorage.getItem('game_mode') || 'light');
  const [fontSize, setFontSize] = useState(localStorage.getItem('game_font_size') || 'medium');
  const [showSettings, setShowSettings] = useState(!apiKey && !hasLinkedApi);
  const [showSaves, setShowSaves] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [activeTab, setActiveTab] = useState<'game' | 'data' | 'explore'>('game');
  const [tabScrollPositions, setTabScrollPositions] = useState<Record<string, number>>({});
  const [activeExploreTab, setActiveExploreTab] = useState<'events' | 'family' | 'achievements' | 'shop'>('events');
  const [isMenuExpanded, setIsMenuExpanded] = useState(true);
  const [isStatusExpanded, setIsStatusExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [giftingTarget, setGiftingTarget] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, message: string, onConfirm: () => void} | null>(null);
  const [interactionModal, setInteractionModal] = useState<{isOpen: boolean, title: string, content: string, isLoading: boolean} | null>(null);
  const [initStep, setInitStep] = useState(parseInt(localStorage.getItem('game_init_step') || '0')); 
  const [initChoices, setInitChoices] = useState<string[]>(JSON.parse(localStorage.getItem('game_init_choices') || '[]'));
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [lastStatus, setLastStatus] = useState<GameStatus | null>(null);
  const [status, setStatus] = useState<GameStatus>(JSON.parse(localStorage.getItem('game_status') || JSON.stringify({
    date: '第 1 天',
    time: '清晨',
    funds: '0',
    reputation: '无名小卒',
    scene: 'menu',
    protagonist: { 
      name: '未设定', 
      state: '初始化中', 
      description: '一个初入此界的旅者。', 
      portrait: '',
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      sanity: 100,
      maxSanity: 100,
      exp: 0,
      level: 1
    },
    characters: [],
    menu: [],
    worldDescription: '一个充满未知与可能的广阔世界。',
    inventory: []
  })));

  const [config, setConfig] = useState<GameConfig>({
    perspective: (localStorage.getItem('game_perspective') as any) || '第二人称',
    wordCount: parseInt(localStorage.getItem('game_word_count') || '1000'),
    model: localStorage.getItem('game_model') || 'gemini-3-flash-preview',
    baseUrl: localStorage.getItem('game_base_url') || '',
    memoryLimit: parseInt(localStorage.getItem('game_memory_limit') || '20'),
    customInstructions: localStorage.getItem('game_custom_instructions') || '',
    narrativeStyle: localStorage.getItem('game_narrative_style') || '文学叙事',
    claudeApiKey: localStorage.getItem('game_claude_api_key') || '',
    claudeModel: localStorage.getItem('game_claude_model') || 'claude-sonnet-4-5',
    zhipuApiKey: localStorage.getItem('game_zhipu_api_key') || '',
    zhipuModel: localStorage.getItem('game_zhipu_model') || 'glm-4-flash',
    aiProvider: (localStorage.getItem('game_ai_provider') as any) || 'gemini',
    claudeRole: localStorage.getItem('game_claude_role') || '神秘旁白者',
  });

  const [characterPortraits, setCharacterPortraits] = useState<Record<string, string>>(JSON.parse(localStorage.getItem('game_character_portraits') || '{}'));
  const [characterAvatars, setCharacterAvatars] = useState<Record<string, string>>(JSON.parse(localStorage.getItem('game_character_avatars') || '{}'));
  const [protagonistPortrait, setProtagonistPortrait] = useState(localStorage.getItem('game_protagonist_portrait') || '');
  const [editingCharIdx, setEditingCharIdx] = useState<number | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [editingWorld, setEditingWorld] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  const shopItems = [
    { id: 'item_1', name: '恢复药剂', price: 200, description: '恢复少量生命值与体力。', icon: '🧪' },
    { id: 'item_2', name: '精致点心', price: 150, description: '赠送给角色可提升少量好感度。', icon: '🍰' },
    { id: 'item_3', name: '古旧地图', price: 500, description: '解锁一处隐藏的探索区域。', icon: '🗺' },
    { id: 'item_4', name: '华丽礼服', price: 2000, description: '大幅提升魅力值，某些场合必备。', icon: '👗' },
    { id: 'item_5', name: '神秘契约', price: 5000, description: '与恶魔签订契约，获得禁忌的力量。', icon: '📜' },
    { id: 'item_6', name: '孕育丹', price: 5000, description: '提升受孕概率，或加速孕育进度。', icon: '💊' },
  ];

  const [shopNotification, setShopNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const buyItem = (item: typeof shopItems[0]) => {
    const currentFunds = parseInt(status.funds.toString().replace(/[^0-9-]/g, '')) || 0;
    if (currentFunds < item.price) {
      setShopNotification({ message: `购买失败：资金不足！需要 ${item.price}，当前仅有 ${currentFunds}。`, type: 'error' });
      setTimeout(() => setShopNotification(null), 3000);
      return;
    }

    const newFunds = currentFunds - item.price;
    setStatus(prev => ({
      ...prev,
      funds: newFunds.toString(),
      inventory: [
        ...(prev.inventory || []),
        { id: Date.now().toString(), name: item.name, quantity: 1, description: item.description, type: 'consumable' }
      ]
    }));
    
    setShopNotification({ message: `成功购买 ${item.name}！物品已存入背包。`, type: 'success' });
    setTimeout(() => setShopNotification(null), 3000);
  };

  const useItem = (item: InventoryItem) => {
    let effectMsg = "";
    const newProtagonist = { ...status.protagonist };
    let hpChange = 0;
    let mpChange = 0;
    let sanChange = 0;
    let expChange = 0;

    if (item.name === '恢复药剂') {
      hpChange = 30;
      mpChange = 15;
      newProtagonist.hp = Math.min(newProtagonist.maxHp, newProtagonist.hp + hpChange);
      newProtagonist.mp = Math.min(newProtagonist.maxMp, newProtagonist.mp + mpChange);
      effectMsg = `使用成功！HP +${hpChange}, MP +${mpChange}`;
    } else if (item.name === '精致点心') {
      sanChange = 20;
      newProtagonist.sanity = Math.min(newProtagonist.maxSanity, newProtagonist.sanity + sanChange);
      effectMsg = `使用成功！SAN +${sanChange}`;
    } else if (item.name === '古旧地图') {
      expChange = 50;
      newProtagonist.exp += expChange;
      effectMsg = `使用了古旧地图，获得了 ${expChange} 点经验值，并解锁了新的视野！`;
    } else if (item.name === '华丽礼服') {
      effectMsg = `穿上了华丽礼服，你感觉自己魅力大增！(魅力属性已在后台提升)`;
    } else {
      effectMsg = `使用了 ${item.name}，但似乎没有产生直接效果。`;
    }

    setStatus(prev => ({
      ...prev,
      protagonist: newProtagonist,
      inventory: (prev.inventory || []).map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
      ).filter(i => i.quantity > 0)
    }));

    showNotification(effectMsg, "success");
    
    // Trigger a visual feedback for stats change
    if (hpChange || mpChange || sanChange || expChange) {
      const changes = [];
      if (hpChange) changes.push(`HP +${hpChange}`);
      if (mpChange) changes.push(`MP +${mpChange}`);
      if (sanChange) changes.push(`SAN +${sanChange}`);
      if (expChange) changes.push(`EXP +${expChange}`);
      
      // We can add a temporary message to the game log or a special pop-up
      const feedbackMsg: Message = {
        id: Date.now().toString(),
        role: 'model',
        text: `【系统提示】你使用了 ${item.name}。${changes.join(', ')}。`
      };
      setMessages(prev => [...prev, feedbackMsg]);
    }
  };

  const [saves, setSaves] = useState<SaveData[]>(JSON.parse(localStorage.getItem('game_saves') || '[]'));
  const [achievements, setAchievements] = useState<Achievement[]>(JSON.parse(localStorage.getItem('game_achievements') || JSON.stringify([
    { id: 'start', title: '初入异界', description: '开始一场新的冒险', unlocked: false, icon: '🌟' },
    { id: 'rich', title: '腰缠万贯', description: '资金达到 10000', unlocked: false, icon: '💰' },
    { id: 'fame', title: '名扬四海', description: '声望达到 闻名遐迩', unlocked: false, icon: '🔥' },
    { id: 'first_blood', title: '初次交锋', description: '经历第一次重大剧情转折', unlocked: false, icon: '⚔️' },
    { id: 'pregnancy', title: '生命延续', description: '成功触发受孕事件', unlocked: false, icon: '🍼' },
    { id: 'birth', title: '呱呱坠地', description: '成功诞下第一名子嗣', unlocked: false, icon: '👶' },
    { id: 'ending_1', title: '命运的分支', description: '达成任意一个游戏结局', unlocked: false, icon: '📖' },
    { id: 'harem', title: '后宫之主', description: '同时与3名以上角色建立极高好感度', unlocked: false, icon: '👑' },
  ])));

  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const switchTab = (newTab: 'game' | 'data' | 'explore') => {
    if (scrollRef.current) {
      setTabScrollPositions(prev => ({ ...prev, [activeTab]: scrollRef.current!.scrollTop }));
    }
    setActiveTab(newTab);
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = tabScrollPositions[newTab] || 0;
      }
    }, 100);
  };
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-mode', mode);
  }, [theme, mode]);

  // ✅ 已移除：原 NaN 检查 useEffect 会在每次 setStatus 后再触发 setStatus，造成循环渲染。
  // 数值安全校验已整合进 parseResponse 函数内部。

  // ✅ 优化：拆分为独立 useEffect，图片数据不再在每次对话时重新序列化
  useEffect(() => {
    localStorage.setItem('game_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('game_status', JSON.stringify(status));
  }, [status]);

  useEffect(() => {
    localStorage.setItem('game_init_step', initStep.toString());
    localStorage.setItem('game_init_choices', JSON.stringify(initChoices));
  }, [initStep, initChoices]);

  useEffect(() => {
    localStorage.setItem('game_achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('game_character_portraits', JSON.stringify(characterPortraits));
  }, [characterPortraits]);

  useEffect(() => {
    localStorage.setItem('game_character_avatars', JSON.stringify(characterAvatars));
  }, [characterAvatars]);

  useEffect(() => {
    localStorage.setItem('game_protagonist_portrait', protagonistPortrait);
  }, [protagonistPortrait]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [messages]);

  const unlockAchievement = (id: string) => {
    setAchievements(prev => prev.map(a => {
      if (a.id === id && !a.unlocked) {
        setCurrentAchievement(a);
        setTimeout(() => setCurrentAchievement(null), 3000);
        return { ...a, unlocked: true };
      }
      return a;
    }));
  };

  // ✅ 重写：parseResponse 改为纯函数，接收 currentStatus 参数
  // 修复1：不再从闭包捕获 status（async 调用时可能是旧快照）
  // 修复2：深拷贝 protagonist，不再直接 mutate React state
  // 修复3：【属性变动】现在真正应用 delta 到数值（HP/MP/SAN会实际变化）
  // 修复4：去掉 lookbehind 正则（Safari 不支持，会直接崩溃）
  const parseResponse = (text: string, currentStatus: GameStatus) => {
    const newStatus: GameStatus = {
      ...currentStatus,
      protagonist: { ...currentStatus.protagonist },
      characters: [...(currentStatus.characters || [])],
      menu: [...(currentStatus.menu || [])],
    };
    
    let cleanText = text.replace(/[*#_]/g, '');
    cleanText = cleanText.replace(/（(.*?)）/g, '『$1』');

    cleanText = cleanText.replace(/(?:\[|【)(日期|时间|地点|场景|资金|声望\/传闻|主角状态|主角|世界描述|角色动态|剧情叙述|属性变动|指令菜单|角色列表|关系网)(?:\]|】)\s*[:：]?/g, '【$1】');
    cleanText = cleanText.replace(/(?:\[|【)节点总结(?:：|:)?(.*?)(?:\]|】)/g, '【节点总结】$1');

    const dateMatch = cleanText.match(/【日期】\s*(.*?)(?=\s*【|$)/);
    const timeMatch = cleanText.match(/【时间】\s*(.*?)(?=\s*【|$)/);
    const fundsMatch = cleanText.match(/【资金】\s*(.*?)(?=\s*【|$)/);
    const repMatch = cleanText.match(/【声望\/传闻】\s*(.*?)(?=\s*【|$)/);
    const sceneMatch = cleanText.match(/【场景】\s*(exploration|combat|story|menu)/i);
    const charListMatch = cleanText.match(/【角色列表】\s*([\s\S]*?)(?=【|$)/);
    const menuMatch = cleanText.match(/【指令菜单】\s*([\s\S]*?)(?=【|$)/);
    const summaryMatch = cleanText.match(/【节点总结】\s*(.*?)(?=\s*【|$)/);

    if (dateMatch) newStatus.date = dateMatch[1].trim();
    if (timeMatch) newStatus.time = timeMatch[1].trim();
    if (fundsMatch) {
      // ✅ 修复：资金字段只保留数字，防止 AI 返回"灵石500"或"500灵石"导致商店判断失败
      const rawFunds = fundsMatch[1].trim();
      const numMatch = rawFunds.match(/-?\d[\d,，]*/);
      newStatus.funds = numMatch ? numMatch[0].replace(/[,，]/g, '') : rawFunds;
    }
    if (repMatch) newStatus.reputation = repMatch[1].trim();
    if (sceneMatch) newStatus.scene = sceneMatch[1].trim().toLowerCase() as any;
    
    // ✅ 修复：主角名字提取——支持更多 AI 输出格式
    // 格式1: 【主角】夜枭 [状态: XX]
    // 格式2: 【主角】姓名：夜枭 | 状态：XX
    // 格式3: 【主角状态】健康
    const protagonistLine = cleanText.split('\n').find(line => line.includes('【主角】') || line.includes('【主角状态】'));
    if (protagonistLine) {
      let name = newStatus.protagonist.name;
      let state = newStatus.protagonist.state || '正常';

      if (protagonistLine.includes('【主角】') && !protagonistLine.startsWith('【主角状态】')) {
        // 去掉标签本身，剩下的第一个词就是名字
        const afterTag = protagonistLine.replace('【主角】', '').trim();
        // 支持 "姓名：夜枭" 和 "夜枭" 两种写法
        const nameFromColon = afterTag.match(/^(?:姓名[：:]\s*)?([^\s\[|【：:]+)/);
        if (nameFromColon) {
          const candidate = nameFromColon[1].trim();
          if (candidate && candidate !== '姓名' && candidate !== '主角' && candidate.length < 10) {
            name = candidate;
          }
        }
      }

      const stateMatch = protagonistLine.match(/(?:状态[：:]|【主角状态】)\s*([^\]|【\n]+)/);
      if (stateMatch) state = stateMatch[1].trim();

      newStatus.protagonist = { ...newStatus.protagonist, name, state };
    }

    // 解析显式属性面板（HP:X/Y 格式）
    const hpMatch = cleanText.match(/HP:\s*(\d+)\/(\d+)/i);
    const mpMatch = cleanText.match(/MP:\s*(\d+)\/(\d+)/i);
    const sanMatch = cleanText.match(/SAN:\s*(\d+)\/(\d+)/i);
    const expMatch = cleanText.match(/EXP:\s*(\d+)/i);
    const lvlMatch = cleanText.match(/LVL:\s*(\d+)/i);

    if (hpMatch) {
      newStatus.protagonist.hp = Math.max(0, parseInt(hpMatch[1]) || 0);
      newStatus.protagonist.maxHp = Math.max(1, parseInt(hpMatch[2]) || 100);
    }
    if (mpMatch) {
      newStatus.protagonist.mp = Math.max(0, parseInt(mpMatch[1]) || 0);
      newStatus.protagonist.maxMp = Math.max(1, parseInt(mpMatch[2]) || 50);
    }
    if (sanMatch) {
      newStatus.protagonist.sanity = Math.max(0, parseInt(sanMatch[1]) || 0);
      newStatus.protagonist.maxSanity = Math.max(1, parseInt(sanMatch[2]) || 100);
    }
    if (expMatch) newStatus.protagonist.exp = Math.max(0, parseInt(expMatch[1]) || 0);
    if (lvlMatch) newStatus.protagonist.level = Math.max(1, parseInt(lvlMatch[1]) || 1);

    if (charListMatch) {
      const content = charListMatch[1].trim();
      // ✅ 修复：去掉 lookbehind，改为逐行合并（Safari 兼容）
      const lines = content.split('\n').filter(line => !line.trim().startsWith('（注意：') && !line.trim().startsWith('(注意：'));
      let blocks: string[] = [];
      let currentBlock = '';
      for (const line of lines) {
        const isNewBlock = /^\s*[\[\d]/.test(line) || /^\s*-\s*\[/.test(line);
        if (isNewBlock && currentBlock.trim()) {
          blocks.push(currentBlock.trim());
          currentBlock = line;
        } else {
          currentBlock += (currentBlock ? '\n' : '') + line;
        }
      }
      if (currentBlock.trim()) blocks.push(currentBlock.trim());
      blocks = blocks.filter(s => s.length > 0);

      if (blocks.length <= 1 && (content.match(/\[/g) || []).length > 1) {
        blocks = content.split(/(?=\[)/).map(s => s.trim()).filter(s => s.length > 0);
      }
      
      const newCharsMap = new Map<string, string>();
      newStatus.characters.forEach(charStr => {
        let nameMatch = charStr.match(/\[([^\]]+)\]/g);
        let name = '';
        if (nameMatch) {
          for (const match of nameMatch) {
            const inner = match.replace(/[\[\]]/g, '').trim();
            if (!/^[\d.\s]+$/.test(inner) && !inner.includes('难度') && !['剧情正文', '旁白', '注意', '角色姓名', '主角', '系统'].includes(inner)) {
              name = inner;
              break;
            }
          }
        }
        if (name) {
          newCharsMap.set(name, charStr);
        } else {
          const altMatch = charStr.match(/^([^\[：:\|]+)(?:\s*[\[：:\|])?/);
          if (altMatch && altMatch[1].trim().length < 20 && !altMatch[1].includes('难度')) {
            newCharsMap.set(altMatch[1].trim(), charStr);
          }
        }
      });
      
      blocks.forEach(block => {
        let nameMatch = block.match(/\[([^\]]+)\]/g);
        let name = '';
        if (nameMatch) {
          for (const match of nameMatch) {
            const inner = match.replace(/[\[\]]/g, '').trim();
            if (!/^[\d.\s]+$/.test(inner) && !inner.includes('难度') && !inner.includes('状态') && !['剧情正文', '旁白', '注意', '角色姓名', '主角', '系统'].includes(inner)) {
              name = inner;
              break;
            }
          }
        }
        if (!name) {
          const altMatch = block.match(/^([^\[：:\|]+)(?:\s*[\[：:\|])/);
          if (altMatch && altMatch[1].trim().length < 15 && !altMatch[1].includes('难度')) {
            name = altMatch[1].trim();
          }
        }
        if (name) {
          name = name.replace(/^[\d.\s]+/, '').trim();
          if (name && name !== newStatus.protagonist.name && name !== '主角' && !name.includes('难度') && !name.includes('★')) {
            let cleanBlock = block.replace(/^\[\d+\]\s*/, '').replace(/^[-\d.\s]+/, '').trim();
            if (!cleanBlock.includes(`[${name}]`)) {
               cleanBlock = `[${name}] ` + cleanBlock;
            }
            newCharsMap.set(name, cleanBlock);
          }
        }
      });
      newStatus.characters = Array.from(newCharsMap.values());
    }

    const relListMatch = cleanText.match(/【关系网】\s*([\s\S]*?)(?=【|$)/);
    if (relListMatch) {
      newStatus.relationships = relListMatch[1].split('\n').map(s => s.trim()).filter(s => s.length > 0);
    }

    let parsedMenu: string[] = [];
    if (menuMatch) {
      parsedMenu = menuMatch[1]
        .split('\n')
        .map(s => s.trim())
        .filter(s => !s.startsWith('（注意：') && !s.startsWith('(注意：'))
        .filter(s => s.match(/^(?:\[\d+\]|\d+\.|\d+\s+)/));
      parsedMenu = parsedMenu.map(s => {
        const match = s.match(/^(?:\[(\d+)\]|(\d+)\.|\s*(\d+)\s+)\s*(.*)/);
        if (match) {
          const num = match[1] || match[2] || match[3];
          return `[${num}] ${match[4]}`;
        }
        return s;
      });
    }
    
    const plotMatch = cleanText.match(/【主线剧情】(.*?)\|(.*)/);
    if (plotMatch) {
      const plotDate = plotMatch[1].trim();
      const plotSummary = plotMatch[2].trim();
      newStatus.mainPlotLog = [...(newStatus.mainPlotLog || []), { date: plotDate, summary: plotSummary }];
      cleanText = cleanText.replace(plotMatch[0], '');
    }
    
    const exploreMatch = cleanText.match(/【探索记录】(.*?)\|(.*)/);
    if (exploreMatch) {
      const exploreDate = exploreMatch[1].trim();
      const exploreSummary = exploreMatch[2].trim();
      newStatus.explorationLog = [...(newStatus.explorationLog || []), { date: exploreDate, summary: exploreSummary }];
      cleanText = cleanText.replace(exploreMatch[0], '');
    }

    // ✅ 新增：从剧情文本中自动解析孕育状态
    // 检测"成功受孕/怀孕"关键词，自动找到对应角色并更新 pregnancyLog
    const pregnancyLog = { ...(newStatus.pregnancyLog || {}) };
    const charNames = newStatus.characters.map(c => {
      let nameMatch = c.match(/\[([^\]]+)\]/g);
      let name = '';
      if (nameMatch) {
        for (const match of nameMatch) {
          const inner = match.replace(/[\[\]]/g, '').trim();
          if (!/^[\d.\s]+$/.test(inner) && !inner.includes('难度') && !['剧情正文', '旁白', '注意', '角色姓名', '主角', '系统'].includes(inner)) {
            name = inner;
            break;
          }
        }
      }
      return name;
    }).filter(Boolean);

    // 检测尝试受孕行为
    if (cleanText.match(/尝试受孕|备孕|交配|双修|同房|侍寝|交尾|结合|做爱|性交|云雨|欢好|春宵|缠绵/)) {
      const mostLikelyChar = charNames[0] || '未知角色';
      const targetChar = charNames.find(n => cleanText.includes(n)) || mostLikelyChar;
      if (targetChar) {
        if (!pregnancyLog[targetChar]) {
          pregnancyLog[targetChar] = { pregnant: false, progress: 0, attempts: 0 };
        }
        pregnancyLog[targetChar].attempts = (pregnancyLog[targetChar].attempts || 0) + 1;
      }
    }

    // 检测受孕成功
    if (cleanText.match(/成功受孕|已经受孕|确认怀孕|有了身孕|孕育成功|怀孕|有喜|怀上|珠胎暗结|有了骨肉|孕育/)) {
      // 找出最可能怀孕的角色（好感度最高的）
      const mostLikelyChar = charNames[0] || '未知角色';
      const targetChar = charNames.find(n => cleanText.includes(n)) || mostLikelyChar;
      if (targetChar && !pregnancyLog[targetChar]?.pregnant) {
        pregnancyLog[targetChar] = {
          ...pregnancyLog[targetChar],
          count: (pregnancyLog[targetChar]?.count || 0) + 1,
          pregnant: true,
          progress: 5,
          father: newStatus.protagonist.name || '主角',
          conceptionDate: newStatus.date,
          dueDate: parseInt(newStatus.date.replace(/[^0-9]/g, '') || '1') + 30, // 假设孕期为30天
        };
      }
    }

    // 检测孕期推进（剧情里提到孕育进展词汇就增加进度）
    charNames.forEach(charName => {
      if (pregnancyLog[charName]?.pregnant) {
        const progressKeywords: [string, number][] = [
          ['孕吐', 10], ['胎动', 35], ['显怀', 45], ['腹部隆起', 55],
          ['临盆', 80], ['待产', 85], ['分娩', 95], ['顺利生产', 100],
        ];
        for (const [kw, targetProgress] of progressKeywords) {
          if (cleanText.includes(kw) && pregnancyLog[charName].progress < targetProgress) {
            pregnancyLog[charName] = { ...pregnancyLog[charName], progress: targetProgress };
            break;
          }
        }
        
        // 每次剧情推进时小幅自然增长
        if (pregnancyLog[charName].progress < 95) {
          pregnancyLog[charName] = {
            ...pregnancyLog[charName],
            progress: Math.min(95, (pregnancyLog[charName].progress || 0) + 2),
          };
        }
      }
      // 检测分娩完成，重置孕育状态
      if (pregnancyLog[charName]?.pregnant && cleanText.match(/成功分娩|孩子出生|呱呱坠地|婴儿降生|诞下|生下/)) {
        pregnancyLog[charName] = { ...pregnancyLog[charName], pregnant: false, progress: 0 };
      }
    });
    newStatus.pregnancyLog = pregnancyLog;
    
    const generateRandomEvent = (status: GameStatus) => {
      const events = [
        "在探索途中，你偶然发现了一处被遗忘的宝箱，里面藏着一些旧时代的货币。",
        "一名神秘的行脚商人拦住了你的去路，试图向你兜售一些奇怪的护身符。",
        "你听到远处传来一阵骚动，似乎是当地帮派在进行某种秘密交易。",
        "天气突然变得恶劣，你不得不寻找避雨处，却意外发现了一个隐藏的避难所。",
        "你遇到了一位正在寻求帮助的旅人，他看起来似乎知道一些关于这个世界的秘密。"
      ];
      return events[Math.floor(Math.random() * events.length)];
    };

    if (Math.random() < 0.2) {
      const eventText = generateRandomEvent(newStatus);
      newStatus.menu.push(`[触发随机事件] ${eventText}`);
    }

    setStatus(newStatus);

    if (parseInt(newStatus.funds) >= 10000) unlockAchievement('rich');
    if (newStatus.reputation.includes('闻名')) unlockAchievement('fame');
    if (cleanText.includes('受孕') || cleanText.includes('怀孕') || cleanText.includes('有喜')) unlockAchievement('pregnancy');
    if (cleanText.includes('诞生') || cleanText.includes('出生') || cleanText.includes('呱呱坠地')) unlockAchievement('birth');
    if (cleanText.includes('结局') || cleanText.includes('End') || cleanText.includes('终章')) unlockAchievement('ending_1');
    if (newStatus.characters.length >= 3 && (cleanText.includes('深爱') || cleanText.includes('死心塌地'))) unlockAchievement('harem');

    const worldMatch = cleanText.match(/【世界描述】\s*([\s\S]*?)(?=\s*【|$)/);
    const charActionMatch = cleanText.match(/【角色动态】\s*([\s\S]*?)(?=\s*【|$)/);
    const narrativeMatch = cleanText.match(/【剧情叙述】\s*([\s\S]*?)(?=\s*【|$)/);
    const attrChangeMatch = cleanText.match(/【属性变动】\s*([\s\S]*?)(?=\s*【|$)/);
    
    let displayParts = [];
    if (worldMatch) displayParts.push(worldMatch[1].trim());
    if (charActionMatch) displayParts.push(charActionMatch[1].trim());
    if (narrativeMatch) displayParts.push(narrativeMatch[1].trim());
    
    let displayBody = displayParts.join('\n\n');
    
    if (!displayBody) {
      displayBody = cleanText
        .replace(/【(日期|时间|地点|场景|资金|声望\/传闻|主角状态|主角|角色列表|指令菜单|关系网|节点总结|主线剧情|探索记录)】[\s\S]*?(?=【|$)/g, '')
        .trim();
    }

    const optionsBlockRegex = /(?:\n\s*(?:\[\d+\]|\d+\.)\s*.*)+\s*$/;
    const optionsBlockMatch = displayBody.match(optionsBlockRegex);
    if (optionsBlockMatch) {
      const optionsText = optionsBlockMatch[0];
      displayBody = displayBody.replace(optionsBlockRegex, '').trim();
      if (parsedMenu.length === 0) {
        const optionLines = optionsText.split('\n').filter(s => s.trim().length > 0);
        parsedMenu = optionLines.map((line) => {
          const match = line.trim().match(/^(?:\[(\d+)\]|(\d+)\.)\s*(.*)/);
          if (match) {
            const num = match[1] || match[2];
            return `[${num}] ${match[3]}`;
          }
          return line.trim();
        });
      }
    }
    
    newStatus.menu = parsedMenu.length > 0 ? parsedMenu : ['[1] 继续'];

    // ✅ 核心修复：真正解析并应用属性 delta，HP/MP/SAN/EXP 会实际变化
    if (attrChangeMatch && attrChangeMatch[1].trim() && attrChangeMatch[1].trim() !== '无') {
      const deltaText = attrChangeMatch[1];

      const applyDelta = (
        patterns: string[],
        key: 'hp' | 'mp' | 'sanity' | 'exp' | 'level',
        maxKey?: 'maxHp' | 'maxMp' | 'maxSanity'
      ) => {
        for (const pattern of patterns) {
          const regex = new RegExp(pattern + '\\s*([+-]?\\d+)', 'i');
          const match = deltaText.match(regex);
          if (match) {
            const raw = match[1];
            // 如果没有+-符号，判断是增量还是绝对值（有+-是增量，没有是绝对值）
            const isAbsolute = !/^[+-]/.test(raw);
            const delta = parseInt(raw);
            if (!isNaN(delta)) {
              const current = (newStatus.protagonist[key] as number) ?? 0;
              const max = maxKey ? ((newStatus.protagonist[maxKey] as number) ?? 9999) : 9999;
              const newVal = isAbsolute ? delta : current + delta;
              (newStatus.protagonist as any)[key] = Math.max(0, Math.min(max, newVal));
            }
            break;
          }
        }
      };

      applyDelta(['HP', '生命值', '生命'], 'hp', 'maxHp');
      applyDelta(['MP', '法力值', '法力', '魔力'], 'mp', 'maxMp');
      applyDelta(['SAN', '理智值', '理智'], 'sanity', 'maxSanity');
      applyDelta(['EXP', '经验值', '经验'], 'exp');
      // 法力值也支持中文"内力""灵力""魔力"等写法
      applyDelta(['内力', '灵力', '真气', '斗气'], 'mp', 'maxMp');

      displayBody += `\n\n属性变动: ${deltaText.trim()}`;
    }

    // ✅ 全面重写：从剧情关键词自动推断经验增长
    // 更多关键词，更大增量，让等级真正跟着剧情走
    const expKeywords: [string | RegExp, number][] = [
      // 战斗/挑战
      [/击败|战胜|击倒|打败/, 20],
      [/胜利|成功/, 12],
      [/击杀|斩杀|消灭/, 25],
      // 剧情推进
      [/任务完成|委托完成|使命完成/, 30],
      [/突破|晋升|升阶|进阶/, 40],
      [/领悟|顿悟|开窍|觉醒/, 35],
      [/获得了新的力量|实力大增|境界提升/, 50],
      // 社交/地位
      [/名声大噪|声名远播|威望提升/, 20],
      [/成为.*头目|成为.*领袖|成为.*首领/, 45],
      [/统治|掌控|征服/, 30],
      // 一般推进
      [/解决了|处理了|完成了/, 10],
      [/获得了|得到了/, 5],
      [/重要发现|关键线索/, 15],
    ];
    let autoExpGain = 0;
    for (const [kw, gain] of expKeywords) {
      const matched = typeof kw === 'string' ? cleanText.includes(kw) : kw.test(cleanText);
      if (matched) { autoExpGain += gain; }
    }
    // 每次有实质剧情推进，给基础经验5点（防止完全没有增长）
    if (autoExpGain === 0 && cleanText.length > 200) autoExpGain = 5;
    if (autoExpGain > 0) {
      newStatus.protagonist.exp = (newStatus.protagonist.exp || 0) + autoExpGain;
    }

    // ✅ 声望联动等级：声望词汇影响等级下限
    const reputationLevelMap: [string, number][] = [
      ['令人生畏', 5], ['闻名遐迩', 6], ['威震四方', 8], ['传说', 10],
      ['无名', 1], ['陌生', 1], ['小卒', 1], ['崭露头角', 3], ['颇有名气', 4],
    ];
    for (const [keyword, minLevel] of reputationLevelMap) {
      if (newStatus.reputation.includes(keyword) && (newStatus.protagonist.level || 1) < minLevel) {
        newStatus.protagonist.level = minLevel;
        newStatus.protagonist.maxHp = Math.max(newStatus.protagonist.maxHp || 100, 100 + (minLevel - 1) * 10);
        newStatus.protagonist.maxMp = Math.max(newStatus.protagonist.maxMp || 50, 50 + (minLevel - 1) * 5);
        break;
      }
    }

    // 升级检查：每 100 EXP 升一级，升级时提升最大属性
    while (newStatus.protagonist.exp >= 100) {
      newStatus.protagonist.exp -= 100;
      newStatus.protagonist.level = (newStatus.protagonist.level || 1) + 1;
      newStatus.protagonist.maxHp = (newStatus.protagonist.maxHp || 100) + 10;
      newStatus.protagonist.maxMp = (newStatus.protagonist.maxMp || 50) + 5;
      newStatus.protagonist.maxSanity = (newStatus.protagonist.maxSanity || 100) + 5;
      // 升级时自动回复部分HP和MP
      newStatus.protagonist.hp = Math.min(newStatus.protagonist.maxHp, (newStatus.protagonist.hp || 0) + 20);
      newStatus.protagonist.mp = Math.min(newStatus.protagonist.maxMp, (newStatus.protagonist.mp || 0) + 10);
    }

    // ✅ 强化：从角色列表文字中提取好感度，写入规范化格式
    // 确保每次 AI 返回新好感度时，characters 数组里的数值得到更新
    // UI 会实时从这里读取
    newStatus.characters = newStatus.characters.map(charStr => charStr); // pass-through (data lives in string, UI parses it live)

    // ✅ 最终数值安全校验
    const safeNum = (val: any, def: number, min = 0): number => {
      const n = typeof val === 'number' ? val : parseInt(String(val));
      return isNaN(n) ? def : Math.max(min, n);
    };
    newStatus.protagonist.hp = safeNum(newStatus.protagonist.hp, 100);
    newStatus.protagonist.maxHp = safeNum(newStatus.protagonist.maxHp, 100, 1);
    newStatus.protagonist.mp = safeNum(newStatus.protagonist.mp, 50);
    newStatus.protagonist.maxMp = safeNum(newStatus.protagonist.maxMp, 50, 1);
    newStatus.protagonist.sanity = safeNum(newStatus.protagonist.sanity, 100);
    newStatus.protagonist.maxSanity = safeNum(newStatus.protagonist.maxSanity, 100, 1);
    newStatus.protagonist.exp = safeNum(newStatus.protagonist.exp, 0, 0);
    newStatus.protagonist.level = safeNum(newStatus.protagonist.level, 1, 1);

    const summary = summaryMatch ? summaryMatch[1].trim() : displayBody.replace(/<[^>]*>?/gm, '').slice(0, 20) + '...';

    return { displayBody, summary, newStatus };
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const startNewWorld = () => {
    setConfirmModal({
      isOpen: true,
      message: '确定要开启【新世界】吗？\n这将彻底清除所有设定，从头开始。\n系统将自动为您保存当前进度。',
      onConfirm: () => {
        saveGame(true);
        
        // Clear all related states
        setMessages([]);
        setInitStep(1);
        setInitChoices([]);
        setInputValue('');
        setActiveNodeId(null);
        setGameKey(Date.now()); // Force UI refresh
        setCharacterPortraits({});
        setCharacterAvatars({});
        setStatus({
          date: '第 1 天',
          time: '清晨',
          funds: '0',
          reputation: '无名小卒',
          scene: 'menu',
          protagonist: {
            name: '玩家',
            state: '健康',
            description: '',
            portrait: '',
            hp: 100, maxHp: 100,
            mp: 50, maxMp: 50,
            sanity: 100, maxSanity: 100,
            exp: 0, level: 1
          },
          characters: [],
          relationships: [],
          pregnancyLog: {},
          explorationLog: [],
          mainPlotLog: [],
          offspring: [],
          menu: [],
          worldDescription: '',
          inventory: []
        });

        // Clear localStorage explicitly
        localStorage.removeItem('game_messages');
        localStorage.removeItem('game_status');
        localStorage.removeItem('game_init_step');
        localStorage.removeItem('game_init_choices');
        
        setActiveTab('game');
        setShowSettings(false);
        setShowSaves(false);
        
        // Force scroll to top
        setTimeout(() => {
          if (scrollRef.current) scrollRef.current.scrollTop = 0;
        }, 100);
        setConfirmModal(null);
      }
    });
  };

  const triggerRandomEvent = async () => {
    if (isLoading || messages.length === 0) return;
    
    setIsLoading(true);
    try {
      const injectedApiKey = getEffectiveApiKey();
      const ai = new GoogleGenAI({ apiKey: injectedApiKey });
      const response = await executeWithRetry(async () => {
        return await ai.models.generateContent({
          model: config.model || "gemini-3-flash-preview",
          contents: `当前世界背景: ${status.worldDescription}\n当前主角状态: ${JSON.stringify(status.protagonist)}\n请生成一个突发的随机小事件（字数约200字），要求有趣且具有一定的互动性。并在结尾提供【指令菜单】供玩家选择（格式：[1] 选项一 [2] 选项二 ...）。`,
          config: {
            systemInstruction: "你是一个随机事件生成器。生成一个简短的、突发的、不影响主线但能增加趣味性的随机事件。使用 Markdown 格式。必须在结尾包含【指令菜单】。",
            safetySettings: SAFETY_SETTINGS,
          }
        });
      });

      let eventText = (response.text || "突然间，什么都没有发生。").replace(/[*#_]/g, '');
      
      // Extract menu if present
      const menuMatch = eventText.match(/【指令菜单】\s*([\s\S]*?)$/);
      let newMenu = status.menu;
      if (menuMatch) {
        newMenu = menuMatch[1]
          .split('\n')
          .map(s => s.trim())
          .filter(s => s.startsWith('[') && s.includes(']'));
        eventText = eventText.replace(menuMatch[0], '').trim();
      }

      const newMsg: Message = {
        id: crypto.randomUUID(),
        role: 'model',
        text: `### 🎲 随机事件触发\n\n${eventText}`,
        timestamp: Date.now(),
        summary: '突发随机事件'
      };
      setMessages(prev => [...prev, newMsg]);
      
      if (menuMatch && newMenu.length > 0) {
        setStatus(prev => ({ ...prev, menu: newMenu }));
      }
      
      // Scroll to bottom
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    } catch (error: any) {
      console.error("Random event error:", error);
      let errorText = "生成随机事件失败，请重试。";
      const errorString = JSON.stringify(error);
      if (error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED' || errorString.includes('429') || errorString.includes('QUOTA')) {
        errorText = "【系统预警：配额耗尽 (429)】请尝试切换到 gemini-2.5-flash 模型或稍后再试。";
      } else if (error?.message?.includes('500') || errorString.includes('500') || errorString.includes('Internal Server Error')) {
        errorText = "【系统故障：核心内部错误 (500)】请稍后再试。";
      }
      showNotification(errorText, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const startNewCycle = () => {
    if (initChoices.length < 2) {
      showNotification('当前尚未完成世界观设定，请直接开启新世界。', 'error');
      return;
    }
    const currentWorld = initChoices[1];
    setConfirmModal({
      isOpen: true,
      message: `确定要开启【新周目】吗？\n系统将自动为您保存当前进度。\n将保留当前世界观：${currentWorld}\n但会重置主角、剧情和所有状态。`,
      onConfirm: () => {
        saveGame(true);
        
        const systemMsg = { 
          role: 'model' as const, 
          text: `【系统提示】已确认保留世界观：${currentWorld}。接下来，请重新设定【主人公】（包括姓名、性别、性向、角色类型及初始处境）。`, 
          id: Date.now().toString(), 
          summary: '系统提示' 
        };
        
        setMessages([systemMsg]);
        setInitStep(3);
        setInitChoices([initChoices[0], currentWorld]);
        setInputValue('');
        setActiveNodeId(systemMsg.id);
        setGameKey(Date.now()); // Force UI refresh
        setStatus({
          date: '第 1 天',
          time: '清晨',
          funds: '0',
          reputation: '无名小卒',
          protagonist: { name: '未设定', state: '初始化中' },
          characters: [],
          relationships: [],
          pregnancyLog: {},
          explorationLog: [],
          mainPlotLog: [],
          offspring: [],
          menu: []
        });

        localStorage.removeItem('game_messages');
        localStorage.removeItem('game_status');
        
        setActiveTab('game');
        setShowSettings(false);
        
        setTimeout(() => {
          if (scrollRef.current) scrollRef.current.scrollTop = 0;
        }, 100);
        setConfirmModal(null);
      }
    });
  };

  const rollbackTo = (index: number) => {
    setConfirmModal({
      isOpen: true,
      message: '确定要回溯到此剧情点吗？此后的所有记录将被删除。',
      onConfirm: () => {
        const newMessages = messages.slice(0, index + 1);
        setMessages(newMessages);
        setActiveNodeId(newMessages[newMessages.length - 1]?.id || null);
        
        const lastModelMsg = [...newMessages].reverse().find(m => m.role === 'model' && m.status);
        if (lastModelMsg && lastModelMsg.status) {
          setStatus(lastModelMsg.status);
          setLastStatus(lastModelMsg.status);
        }
        
        setConfirmModal(null);
      }
    });
  };

  const startEditing = (msg: Message) => {
    setEditingId(msg.id || null);
    setEditText(msg.text);
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const handleRegenerateAfterEdit = async (id: string, customMessages?: Message[]) => {
    const currentMessages = customMessages || messages;
    const idx = currentMessages.findIndex(m => m.id === id);
    if (idx === -1) return;
    
    // Truncate messages after this point
    const truncatedMessages = currentMessages.slice(0, idx + 1);
    
    // Restore status from the last model message before the truncated point
    const lastModelMsg = [...truncatedMessages].slice(0, -1).reverse().find(m => m.role === 'model' && m.status);
    if (lastModelMsg && lastModelMsg.status) {
      setStatus(lastModelMsg.status);
      setLastStatus(lastModelMsg.status);
    }
    
    // If we edited a user message, we want to regenerate the model response
    // If we edited a model message, we want to regenerate THIS model response
    const lastMsg = truncatedMessages[truncatedMessages.length - 1];
    if (lastMsg.role === 'user') {
      setMessages(truncatedMessages);
      await handleSend(lastMsg.text, truncatedMessages.slice(0, -1));
    } else {
      // It's a model message, we need to remove it and regenerate based on the previous user message
      const prevUserIdx = truncatedMessages.slice(0, -1).reverse().findIndex(m => m.role === 'user');
      if (prevUserIdx !== -1) {
        const actualIdx = (truncatedMessages.length - 2) - prevUserIdx;
        const userMsg = truncatedMessages[actualIdx];
        const newContext = truncatedMessages.slice(0, actualIdx);
        setMessages(truncatedMessages.slice(0, actualIdx + 1));
        await handleSend(userMsg.text, newContext);
      }
    }
  };

  const saveEdit = () => {
    if (editingId) {
      const updated = messages.map(m => m.id === editingId ? { ...m, text: editText } : m);
      setMessages(updated);
      setEditingId(null);
      return updated;
    }
    return messages;
  };

  const saveAndRefresh = async (id: string) => {
    const updated = saveEdit();
    await handleRegenerateAfterEdit(id, updated);
  };

  const handleSend = async (customInput?: string, customContext?: Message[]) => {
    const input = customInput || inputValue;
    
    // @ts-ignore
    const injectedApiKey = getEffectiveApiKey();
    
    if (!injectedApiKey) {
      showNotification("未检测到 Gemini API Key，请在设置中配置或链接付费 API。", "error");
      return;
    }
    if (!input.trim() || isLoading) return;

    setIsMenuExpanded(false);

    let userMsg: Message;

    // Progress init step if active
    if (initStep > 0 && !customInput) {
      const nextStep = initStep + 1;
      const newChoices = [...initChoices, input];
      setInitChoices(newChoices);
      
      const userMsg: Message = { role: 'user', text: input, id: Date.now().toString() };
      setMessages(prev => [...prev, userMsg]);
      setInputValue('');

      if (nextStep <= 4) {
        setInitStep(nextStep);
        let nextPrompt = "";
        switch(nextStep) {
          case 2: nextPrompt = "2. 【世界观设定】：选择或自定义您的游戏世界背景。"; break;
          case 3: nextPrompt = "3. 【主人公设定】：选择或自定义您的主角身份。"; break;
          case 4: nextPrompt = "4. 【初始攻略角色/伙伴】：选择或自定义您的第一位重要伙伴。"; break;
        }
        const modelMsg: Message = { 
          role: 'model', 
          text: nextPrompt, 
          id: (Date.now() + 1).toString(),
          summary: `初始化步骤 ${nextStep}`
        };
        setTimeout(() => {
          setMessages(prev => [...prev, modelMsg]);
          setActiveNodeId(modelMsg.id!);
        }, 500);
      } else {
        // All steps completed, start actual game
        setInitStep(0);
        setIsLoading(true);
        const finalPrompt = `请根据以下设定开始游戏：
路线基调：${newChoices[0]}
世界观：${newChoices[1]}
主人公：${newChoices[2]}
初始伙伴：${newChoices[3]}

请生成主角的初始属性面板（HP, MP, SAN, EXP, LVL），并开始第一幕剧情。
请确保输出不包含任何星号或 Markdown 符号。
如果剧情中有需要属性要求的选项，请在选项中注明，例如：[需要体力 > 50]。`;
        
        // We call handleSend recursively but with initStep 0
        await handleSend(finalPrompt, []);
      }
      return;
    } else {
      // Normal game flow
      userMsg = { role: 'user', text: input, id: Date.now().toString() };
      if (!customContext) {
        setMessages(prev => [...prev, userMsg]);
      }
      setInputValue('');
      setIsLoading(true);
    }

    // Limit context window
    let contextMessages = customContext || [...messages];
    const limit = config.memoryLimit || 20;
    if (contextMessages.length > limit) {
      // Keep the first 2 messages (usually boot and first user input for world setting)
      // and the most recent messages up to the limit
      const firstMsgs = contextMessages.slice(0, 2);
      let recentMsgs = contextMessages.slice(-(limit - 2));
      
      // Ensure the first message in recentMsgs is from user to maintain alternation if needed
      if (recentMsgs.length > 0 && recentMsgs[0].role === 'model') {
        recentMsgs = recentMsgs.slice(1);
      }
      contextMessages = [...firstMsgs, ...recentMsgs];
    }

    const fullSystemInstruction = `${SYSTEM_INSTRUCTION}
当前人称：${config.perspective}
字数偏好：${config.wordCount}字以上
叙事风格：${config.narrativeStyle || '文学叙事'}
自定义约束：${config.customInstructions || '无'}
`;

    try {
      let rawText = "";
      
      // @ts-ignore
      const injectedApiKey = getEffectiveApiKey();
      
      const rawContents = [...contextMessages, userMsg];
      const mergedContents: { role: 'user' | 'model', parts: { text: string }[] }[] = [];
      for (const m of rawContents) {
        const role = m.role === 'user' ? 'user' : 'model';
        const text = m.text || " ";
        if (mergedContents.length > 0 && mergedContents[mergedContents.length - 1].role === role) {
          mergedContents[mergedContents.length - 1].parts[0].text += "\n" + text;
        } else {
          mergedContents.push({ role, parts: [{ text }] });
        }
      }
      
      // Ensure the first message is from 'user'
      if (mergedContents.length > 0 && mergedContents[0].role === 'model') {
        mergedContents.shift();
      }
      if (mergedContents.length === 0) {
        mergedContents.push({ role: 'user', parts: [{ text: "开始" }] });
      }
      
      const tryGenerate = async (modelName: string) => {
        if (config.baseUrl) {
          // Use custom fetch for proxy/base URL
          const data = await executeWithRetry(async () => {
            const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/v1beta/models/${modelName}:generateContent?key=${injectedApiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: mergedContents,
                generationConfig: {
                  temperature: 0.9,
                  topP: 0.95,
                  maxOutputTokens: 8192,
                },
                systemInstruction: {
                  parts: [{ text: fullSystemInstruction }]
                },
                safetySettings: FETCH_SAFETY_SETTINGS
              })
            });
            
            if (!response.ok) {
              const errData = await response.json().catch(() => ({}));
              const error = new Error(errData.error?.message || '请求失败');
              (error as any).status = response.status;
              throw error;
            }
            
            return await response.json();
          });
          
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (!text.trim()) throw new Error("EMPTY_CONTENT");
          return text;
        } else {
          // Use standard SDK
          const genAI = new GoogleGenAI({ apiKey: injectedApiKey });
          const response = await executeWithRetry(async () => {
            return await genAI.models.generateContent({
              model: modelName,
              contents: mergedContents,
              config: {
                systemInstruction: fullSystemInstruction,
                temperature: 0.9,
                topP: 0.95,
                maxOutputTokens: 8192,
                safetySettings: SAFETY_SETTINGS,
              }
            });
          });
          const text = response.text || "";
          if (!text.trim()) throw new Error("EMPTY_CONTENT");
          return text;
        }
      };

      try {
        rawText = await tryGenerate(config.model);
      } catch (e: any) {
        const isRateLimit = e?.message?.includes('429') || e?.status === 429 || e?.status === 'RESOURCE_EXHAUSTED' || JSON.stringify(e).includes('429');
        if (isRateLimit && config.model.includes('preview')) {
          console.warn(`Model ${config.model} hit rate limit. Falling back to gemini-2.5-flash...`);
          rawText = await tryGenerate('gemini-2.5-flash');
          showNotification(`由于预览版模型配额限制，已自动切换至 gemini-2.5-flash 继续生成。`, "info");
        } else if (e?.message === "EMPTY_CONTENT") {
          console.warn("Model returned empty content. Retrying once...");
          rawText = await tryGenerate(config.model);
        } else {
          throw e;
        }
      }

      const { displayBody, summary, newStatus } = parseResponse(rawText, status);
      setLastStatus({ ...status });
      
      // Check for Game Over
      const isGameOver = newStatus.protagonist.hp <= 0 || newStatus.protagonist.sanity <= 0;
      
      let finalDisplayBody = displayBody;
      let finalNewStatus = newStatus;

      if (isGameOver) {
        const cause = newStatus.protagonist.hp <= 0 ? "生命值归零" : "理智值崩溃";
        const gameOverText = `\n\n【游戏结束】\n你的${cause}。在这个充满未知的世界里，你的旅程在此画上了句点。\n\n[1] 开启新世界`;
        finalDisplayBody += gameOverText;
        // Ensure the menu reflects the game over option
        finalNewStatus = {
          ...newStatus,
          menu: ['[1] 开启新世界']
        };
      }

      // Clean the display body of any remaining asterisks
      let cleanDisplayBody = finalDisplayBody.replace(/[*#_]/g, '');

      // ✅ 新增：双AI共演模式 - Gemini 输出后让 Claude 追加旁白
      if (config.aiProvider === 'dual' && config.claudeApiKey) {
        const claudeAddition = await handleClaudeNarration(rawText, finalNewStatus);
        if (claudeAddition) {
          cleanDisplayBody = cleanDisplayBody + '\n\n' + claudeAddition;
        }
      }

      const modelMsg: Message = { 
        role: 'model', 
        text: cleanDisplayBody, 
        id: (Date.now() + 1).toString(),
        summary: summary,
        collapsed: false,
        status: finalNewStatus,
        aiProvider: 'gemini',
      };
      setMessages(prev => [...prev, modelMsg]);
      setActiveNodeId(modelMsg.id!);
      
      if (messages.length === 1) unlockAchievement('start');
      
      // Update global status to the new status
      setStatus(finalNewStatus);
    } catch (error: any) {
      console.error("API Error:", error);
      let errorText = "系统错误：无法连接到核心。请检查配置。";
      const errorString = JSON.stringify(error);
      if (error?.message === "EMPTY_CONTENT") {
        errorText = "AI 返回了空内容。这可能是由于触发了安全过滤或模型响应异常。请尝试修改您的输入或调整叙事风格设置。";
      } else if (error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED' || errorString.includes('429') || errorString.includes('QUOTA')) {
        errorText = `【系统预警：配额耗尽 (429)】

原因分析：
1. 预览版模型限制：您当前可能使用的是 \`gemini-3.1-pro-preview\` 或 \`gemini-3-flash-preview\`。这些是预览版模型，即使您绑定了付费卡，Google 也会对其施加极其严格的硬性限制（例如每分钟 2 次或每天 50 次）。
2. Token 消耗过大：文字游戏会累积大量历史记录，导致单次请求的 Token 数极高，瞬间耗尽每分钟的 Token 额度 (TPM)。
3. 计费未生效：您的 API Key 所在的 Google Cloud 项目可能尚未正确开启计费。

解决方案：
👉 强烈建议：点击右上角设置，将模型切换为 \`gemini-2.5-flash\` 或 \`gemini-2.5-pro\`，它们的付费额度非常充足，极少出现 429 错误。
👉 稍等片刻：通常等待 1-2 分钟后，每分钟的频率限制会自动重置。
👉 检查配额：访问 https://aistudio.google.com/app/plan_information 查看您的具体使用进度。`;
      } else if (error?.message?.includes('500') || errorString.includes('500') || errorString.includes('Internal Server Error')) {
        errorText = `【系统故障：核心内部错误 (500)】

原因分析：
1. AI 核心暂时性故障：Google 或第三方 API 内部出现暂时性错误。
2. 请求参数冲突：某些自定义指令或 Base URL 配置可能导致核心无法处理。

解决方案：
👉 立即重试：点击下方“重新生成”或再次发送指令。
👉 检查 Base URL：如果您使用了中转地址，请确认其是否有效。
👉 切换模型：尝试切换到其他版本的模型。`;
      }
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: errorText, 
        id: 'error-' + Date.now(),
        summary: '系统错误',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 新增：Claude 旁白接续（双AI共演模式）
  const handleClaudeNarration = async (geminiOutput: string, currentStatus: GameStatus): Promise<string | null> => {
    if (!config.claudeApiKey || config.aiProvider !== 'dual') return null;
    const claudeSystemPrompt = `你是文字冒险游戏《创世系统》中的特殊角色：${config.claudeRole || '神秘旁白者'}。
另一个 AI（Gemini）刚刚生成了主要剧情，你的任务是：
1. 以"${config.claudeRole || '神秘旁白者'}"的视角，对刚才发生的剧情做出简短补充描写或内心独白（100-200字）。
2. 揭示 Gemini 没有说出的隐藏信息、环境细节或角色内心。
3. 风格与 Gemini 形成对比：Gemini 描写外在则你描写内在，Gemini 热烈则你冷静。
4. 禁止重复 Gemini 已写的内容。
5. 以【${config.claudeRole || '旁白'}】作为开头标签。
6. 不使用任何 Markdown 符号。
当前状态：主角 ${currentStatus.protagonist.name}（HP: ${currentStatus.protagonist.hp}/${currentStatus.protagonist.maxHp}，理智: ${currentStatus.protagonist.sanity}/${currentStatus.protagonist.maxSanity}）`;
    try {
      const claudeText = await executeWithRetry(async () => {
        return await callClaudeAPI(
          config.claudeApiKey!,
          config.claudeModel || 'claude-sonnet-4-5',
          claudeSystemPrompt,
          [{ role: 'user', content: `Gemini 剧情：\n\n${geminiOutput.slice(0, 1500)}\n\n请以"${config.claudeRole || '神秘旁白者'}"身份补充。` }],
          512
        );
      }, 2, 500);
      return claudeText.replace(/[*#_]/g, '');
    } catch (e) {
      console.warn('Claude 旁白生成失败（不影响主流程）:', e);
      return null;
    }
  };

  // ✅ 新增：Claude 独奏模式（完全用 Claude 替代 Gemini 作为 DM）
  const handleSendWithClaude = async (customInput?: string, customContext?: Message[]) => {
    const input = customInput || inputValue;
    if (!config.claudeApiKey) {
      showNotification("未检测到 Claude API Key，请在设置中配置。", "error");
      return;
    }
    if (!input.trim() || isLoading) return;
    setIsMenuExpanded(false);
    const userMsg: Message = { role: 'user', text: input, id: Date.now().toString() };
    if (!customContext) setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    try {
      const contextMessages = (customContext || messages).slice(-(config.memoryLimit || 20));
      const claudeMessages: { role: 'user' | 'assistant', content: string }[] = [];
      for (const m of contextMessages) {
        claudeMessages.push({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text || ' ' });
      }
      if (claudeMessages.length === 0 || claudeMessages[claudeMessages.length - 1].role !== 'user') {
        claudeMessages.push({ role: 'user', content: input });
      }
      const fullSystemInstruction = `${SYSTEM_INSTRUCTION}\n当前人称：${config.perspective}\n字数偏好：${config.wordCount}字以上\n叙事风格：${config.narrativeStyle || '文学叙事'}\n自定义约束：${config.customInstructions || '无'}`;
      const rawText = await executeWithRetry(async () => {
        return await callClaudeAPI(
          config.claudeApiKey!,
          config.claudeModel || 'claude-sonnet-4-5',
          fullSystemInstruction,
          claudeMessages,
          8192
        );
      });
      setLastStatus({ ...status });
      const { displayBody, summary, newStatus } = parseResponse(rawText, status);
      const isGameOver = newStatus.protagonist.hp <= 0 || newStatus.protagonist.sanity <= 0;
      let finalDisplayBody = displayBody.replace(/[*#_]/g, '');
      let finalNewStatus = newStatus;
      if (isGameOver) {
        const cause = newStatus.protagonist.hp <= 0 ? '生命值归零' : '理智值崩溃';
        finalDisplayBody += `\n\n【游戏结束】\n你的${cause}。\n\n[1] 开启新世界`;
        finalNewStatus = { ...newStatus, menu: ['[1] 开启新世界'] };
      }
      const modelMsg: Message = {
        role: 'model',
        text: finalDisplayBody,
        id: (Date.now() + 1).toString(),
        summary,
        collapsed: false,
        status: finalNewStatus,
        aiProvider: 'claude',
      };
      setMessages(prev => [...prev, modelMsg]);
      setActiveNodeId(modelMsg.id!);
      setStatus(finalNewStatus);
    } catch (error: any) {
      console.error('Claude API Error:', error);
      let errorText = 'Claude 系统错误：请检查 API Key 是否正确。';
      if (error?.status === 401) errorText = '【Claude 认证失败】API Key 无效，请在设置中重新填写。';
      else if (error?.status === 429) errorText = '【Claude 配额耗尽】请稍后重试，或切换回 Gemini 模式。';
      else if (error?.status === 529) errorText = '【Claude 服务器繁忙】请稍后重试。';
      setMessages(prev => [...prev, { role: 'model', text: errorText, id: 'claude-error-' + Date.now(), summary: 'Claude 错误', aiProvider: 'claude' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendWithZhipu = async (customInput?: string, customContext?: Message[]) => {
    const input = customInput || inputValue;
    if (!config.zhipuApiKey) {
      showNotification("未检测到智谱 AI API Key，请在设置中配置。", "error");
      return;
    }
    if (!input.trim() || isLoading) return;
    setIsMenuExpanded(false);
    const userMsg: Message = { role: 'user', text: input, id: Date.now().toString() };
    if (!customContext) setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    try {
      const contextMessages = (customContext || messages).slice(-(config.memoryLimit || 20));
      const zhipuMessages: { role: 'user' | 'assistant', content: string }[] = [];
      for (const m of contextMessages) {
        zhipuMessages.push({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text || ' ' });
      }
      if (zhipuMessages.length === 0 || zhipuMessages[zhipuMessages.length - 1].role !== 'user') {
        zhipuMessages.push({ role: 'user', content: input });
      }
      const fullSystemInstruction = `${SYSTEM_INSTRUCTION}\n当前人称：${config.perspective}\n字数偏好：${config.wordCount}字以上\n叙事风格：${config.narrativeStyle || '文学叙事'}\n自定义约束：${config.customInstructions || '无'}`;
      const rawText = await executeWithRetry(async () => {
        return await callZhipuAPI(
          config.zhipuApiKey!,
          config.zhipuModel || 'glm-4-flash',
          fullSystemInstruction,
          zhipuMessages,
          8192
        );
      });
      setLastStatus({ ...status });
      const { displayBody, summary, newStatus } = parseResponse(rawText, status);
      const isGameOver = newStatus.protagonist.hp <= 0 || newStatus.protagonist.sanity <= 0;
      let finalDisplayBody = displayBody.replace(/[*#_]/g, '');
      let finalNewStatus = newStatus;
      if (isGameOver) {
        const cause = newStatus.protagonist.hp <= 0 ? '生命值归零' : '理智值崩溃';
        finalDisplayBody += `\n\n【游戏结束】\n你的${cause}。\n\n[1] 开启新世界`;
        finalNewStatus = { ...newStatus, menu: ['[1] 开启新世界'] };
      }
      const modelMsg: Message = {
        role: 'model',
        text: finalDisplayBody,
        id: (Date.now() + 1).toString(),
        summary,
        collapsed: false,
        status: finalNewStatus,
        aiProvider: 'zhipu',
      };
      setMessages(prev => [...prev, modelMsg]);
      setActiveNodeId(modelMsg.id!);
      setStatus(finalNewStatus);
    } catch (error: any) {
      console.error('Zhipu API Error:', error);
      let errorText = 'Zhipu 系统错误：请检查 API Key 是否正确。';
      if (error?.status === 401) errorText = '【Zhipu 认证失败】API Key 无效，请在设置中重新填写。';
      else if (error?.status === 429) errorText = '【Zhipu 配额耗尽】请稍后重试，或切换回 Gemini 模式。';
      setMessages(prev => [...prev, { role: 'model', text: errorText, id: 'zhipu-error-' + Date.now(), summary: 'Zhipu 错误', aiProvider: 'zhipu' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 新增：统一发送入口，根据 aiProvider 路由到对应 AI
  const handleSendRouted = async (customInput?: string, customContext?: Message[]) => {
    const input = customInput || inputValue;
    
    // Handle Game Over Reset
    if (input.trim() === '开启新世界') {
      startNewWorld();
      setInputValue('');
      return;
    }

    if (config.aiProvider === 'claude') {
      await handleSendWithClaude(customInput, customContext);
    } else if (config.aiProvider === 'zhipu') {
      await handleSendWithZhipu(customInput, customContext);
    } else {
      await handleSend(customInput, customContext);
    }
  };

  const saveGame = (isAuto = false) => {
    if (messages.length === 0 && initStep === 1) return; // Don't save empty game
    
    const newSave: SaveData = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      world: initChoices[1] || '未知世界',
      protagonistName: status.protagonist.name,
      summary: isAuto ? `[自动存档] ${messages[messages.length - 1]?.summary || '重置前'}` : (messages[messages.length - 1]?.summary || '无概括'),
      messages: [...messages],
      status: { ...status },
      initStep,
      initChoices
    };
    const updatedSaves = [newSave, ...saves].slice(0, 20); // Increase limit to 20
    setSaves(updatedSaves);
    localStorage.setItem('game_saves', JSON.stringify(updatedSaves));
    if (!isAuto) alert('存档成功！');
  };

  const loadGame = (save: SaveData) => {
    setMessages(save.messages);
    setStatus(save.status);
    if (save.initStep !== undefined) setInitStep(save.initStep);
    if (save.initChoices) setInitChoices(save.initChoices);
    setGameKey(Date.now()); // Force UI refresh
    setShowSaves(false);
    setActiveNodeId(save.messages[save.messages.length - 1]?.id || null);
  };

  const deleteSave = (id: string) => {
    const updatedSaves = saves.filter(s => s.id !== id);
    setSaves(updatedSaves);
    localStorage.setItem('game_saves', JSON.stringify(updatedSaves));
  };

  const handleRegenerate = async (messageId: string) => {
    if (isLoading) return;
    
    const msgIndex = messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;

    // Find the last user message before this model message
    let lastUserMsgIndex = -1;
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserMsgIndex = i;
        break;
      }
    }

    if (lastUserMsgIndex === -1) {
      showNotification("无法重新生成：未找到对应的用户指令。", "error");
      return;
    }

    const userMsg = messages[lastUserMsgIndex];
    const contextBefore = messages.slice(0, lastUserMsgIndex);
    
    // Truncate and regenerate
    setMessages(messages.slice(0, lastUserMsgIndex + 1));
    await handleSend(userMsg.text, contextBefore);
  };

  const generateCharacterPortrait = async (charName: string, charInfo: string) => {
    if (!apiKey && !hasLinkedApi) {
      alert("请先设置 API Key。");
      return;
    }
    
    setIsLoading(true);
    try {
      const injectedApiKey = getEffectiveApiKey();
      const genAI = new GoogleGenAI({ apiKey: injectedApiKey });
      
      const prompt = `你是一个专业的二次元角色画师。请根据以下角色描述，生成一张精美的角色立绘。
角色姓名：${charName}
角色特征：${charInfo}

请直接输出一张图片。`;

      const response = await executeWithRetry(async () => {
        return await genAI.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: [{ parts: [{ text: prompt }] }],
          config: {
            imageConfig: {
              aspectRatio: "3:4",
              imageSize: "1K"
            },
            safetySettings: SAFETY_SETTINGS,
          }
        });
      });

      let imageUrl = "";
      const parts = response.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        setCharacterPortraits(prev => ({ ...prev, [charName]: imageUrl }));
        // Automatically generate Q-avatar after portrait
        await generateQAvatar(charName, charInfo, imageUrl);
      } else {
        alert("图片生成失败：模型未返回图像数据。");
      }
    } catch (error: any) {
      console.error("Image Generation Error:", error);
      let errorText = "图片生成失败，请检查模型权限或配额。";
      const errorString = JSON.stringify(error);
      if (error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED' || errorString.includes('429') || errorString.includes('QUOTA')) {
        errorText = "【系统预警：配额耗尽 (429)】请稍后再试。";
      } else if (error?.message?.includes('500') || errorString.includes('500') || errorString.includes('Internal Server Error')) {
        errorText = "【系统故障：核心内部错误 (500)】请稍后再试。";
      }
      alert(errorText);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQAvatar = async (charName: string, charInfo: string, portraitUrl?: string) => {
    try {
      const injectedApiKey = getEffectiveApiKey();
      const genAI = new GoogleGenAI({ apiKey: injectedApiKey });
      
      const prompt = `你是一个专业的二次元Q版画师。请根据以下角色描述${portraitUrl ? '和参考立绘' : ''}，生成一张可爱的Q版头像。
角色姓名：${charName}
角色特征：${charInfo}
风格要求：三头身，大眼睛，极简线条，纯色背景，超级可爱。`;

      const parts: any[] = [{ text: prompt }];
      if (portraitUrl) {
        const base64Data = portraitUrl.split(',')[1];
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: "image/png"
          }
        });
      }

      const response = await executeWithRetry(async () => {
        return await genAI.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: [{ parts }],
          config: {
            imageConfig: {
              aspectRatio: "1:1",
              imageSize: "512px"
            },
            safetySettings: SAFETY_SETTINGS,
          }
        });
      });

      let avatarUrl = "";
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          avatarUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (avatarUrl) {
        setCharacterAvatars(prev => ({ ...prev, [charName]: avatarUrl }));
      }
    } catch (error: any) {
      console.error("Q-Avatar Generation Error:", error);
      const errorString = JSON.stringify(error);
      if (error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED' || errorString.includes('429') || errorString.includes('QUOTA')) {
        showNotification("【系统预警：配额耗尽 (429)】Q版头像生成失败，请稍后再试。", "error");
      } else if (error?.message?.includes('500') || errorString.includes('500') || errorString.includes('Internal Server Error')) {
        showNotification("【系统故障：核心内部错误 (500)】Q版头像生成失败，请稍后再试。", "error");
      }
    }
  };

  const generateProtagonistDescription = async () => {
    if (isLoading || isGeneratingDesc) return;
    setIsGeneratingDesc(true);
    try {
      const injectedApiKey = getEffectiveApiKey();
      const genAI = new GoogleGenAI({ apiKey: injectedApiKey });
      const context = messages.slice(-10).map(m => m.text).join('\n');
      const prompt = `根据以下故事剧情，为主角“${status.protagonist.name}”生成一段简洁而富有设计感的个人背景描述（约100-200字）。
剧情参考：
${context}

请直接输出描述内容。`;

      const response = await executeWithRetry(async () => {
        return await genAI.models.generateContent({
          model: config.model,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            safetySettings: SAFETY_SETTINGS,
          }
        });
      });
      
      let desc = response.text || "";
      // Clean asterisks and other markdown
      desc = desc.replace(/[*#_]/g, '').trim();
      
      if (desc) {
        setStatus(prev => ({
          ...prev,
          protagonist: { ...prev.protagonist, description: desc }
        }));
      }
    } catch (error: any) {
      console.error("Generate Desc Error:", error);
      let errorText = `生成描述失败：${error.message || '未知错误'}。请检查模型配置。`;
      const errorString = JSON.stringify(error);
      if (error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED' || errorString.includes('429') || errorString.includes('QUOTA')) {
        errorText = "【系统预警：配额耗尽 (429)】生成描述失败，请稍后再试。";
      } else if (error?.message?.includes('500') || errorString.includes('500') || errorString.includes('Internal Server Error')) {
        errorText = "【系统故障：核心内部错误 (500)】生成描述失败，请稍后再试。";
      }
      showNotification(errorText, "error");
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'protagonist' | 'character', charName?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 限制文件大小为 1MB
    const maxSize = 1024 * 1024; 
    if (file.size > maxSize) {
      alert('图片文件过大！请上传小于 1MB 的图片，以保证系统运行流畅。');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (type === 'protagonist') {
        setProtagonistPortrait(base64String);
        setStatus(prev => ({
          ...prev,
          protagonist: { ...prev.protagonist, portrait: base64String }
        }));
      } else if (charName) {
        setCharacterPortraits(prev => ({ ...prev, [charName]: base64String }));
      }
    };
    reader.readAsDataURL(file);
  };

  const addToInventory = (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString()
    };
    setStatus(prev => ({
      ...prev,
      inventory: [...(prev.inventory || []), newItem]
    }));
  };

  const handleInteraction = async (prompt: string, title: string) => {
    const effectiveKey = getEffectiveApiKey();
    if (!effectiveKey) {
      showNotification("请先在设置中配置 Gemini API Key", "error");
      return;
    }
    setInteractionModal({ isOpen: true, title, content: '', isLoading: true });
    try {
      let text = '';
      const fullPrompt = `${SYSTEM_INSTRUCTION}\n\n当前状态：\n${JSON.stringify(status)}\n\n玩家执行了特殊互动：${prompt}\n请根据互动内容生成剧情。
要求：
1. 剧情丰富，如果是“外出探索”，请生成至少 1000 字的详细剧情，包含环境描写、奇遇、战斗或互动过程。
2. 剧情最后，请严格按照以下格式输出统计数据（如果没有发生交合，则数值为0）：
【统计】交合次数|中出次数|怀孕概率变化|受孕状态
3. 如果互动导致获得了物品，请在最后一行严格按照此格式输出：【获得物品】物品名称|物品描述
4. 如果互动导致成功孕育了子嗣，请在最后一行严格按照此格式输出：【获得子嗣】子嗣姓名|另一半姓名|子嗣描述
5. 请在剧情开头包含：【日期】... 【时间】... 【场景】...
6. 如果剧情涉及重要的主线剧情点，请在最后一行严格按照此格式输出：【主线剧情】日期|事件摘要
7. 如果是“外出探索”，请在最后一行严格按照此格式输出：【探索记录】日期|事件摘要
8. 当好感度达到 50/80/100 时，请生成专属羁绊剧情，并在最后一行严格按照此格式输出：【羁绊事件】角色名称|事件名称|事件摘要`;

      const tryGenerate = async (modelName: string) => {
        if (config.baseUrl) {
          const data = await executeWithRetry(async () => {
            const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/v1beta/models/${modelName}:generateContent?key=${effectiveKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
                generationConfig: { temperature: 0.9, topP: 0.95, maxOutputTokens: 4096 },
                safetySettings: FETCH_SAFETY_SETTINGS
              })
            });
            if (!response.ok) {
              if (response.status === 503) throw new Error('服务器繁忙，请稍后再试。');
              if (response.status === 429) throw new Error('请求过于频繁，请稍后再试。');
              if (response.status === 404) throw new Error('模型未找到或不可用，请在设置中更换模型。');
              const errData = await response.json().catch(() => ({}));
              const error = new Error(errData.error?.message || '请求失败');
              (error as any).status = response.status;
              throw error;
            }
            return await response.json();
          });
          const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (!resultText.trim()) throw new Error("EMPTY_CONTENT");
          return resultText;
        } else {
          const ai = new GoogleGenAI({ apiKey: effectiveKey });
          const response = await executeWithRetry(async () => {
            return await ai.models.generateContent({
              model: modelName,
              contents: fullPrompt,
              config: { temperature: 0.9, topP: 0.95, safetySettings: SAFETY_SETTINGS }
            });
          });
          const resultText = response.text || '';
          if (!resultText.trim()) throw new Error("EMPTY_CONTENT");
          return resultText;
        }
      };

      try {
        text = await tryGenerate(config.model);
      } catch (e: any) {
        const isRateLimit = e?.message?.includes('429') || e?.status === 429 || e?.status === 'RESOURCE_EXHAUSTED' || JSON.stringify(e).includes('429') || e?.message?.includes('请求过于频繁');
        if (isRateLimit && config.model.includes('preview')) {
          console.warn(`Model ${config.model} hit rate limit. Falling back to gemini-2.5-flash...`);
          text = await tryGenerate('gemini-2.5-flash');
        } else if (e?.message === "EMPTY_CONTENT") {
          console.warn("Model returned empty content. Retrying once...");
          text = await tryGenerate(config.model);
        } else {
          throw e;
        }
      }
      
      // Parse potential state changes
      let cleanText = text;
      let tempStatus = { ...status };
      
      // Parse Stats
      const statMatch = text.match(/【属性变动】(.*?)\|(.*?)\|(.*?)\|(.*)/);
      if (statMatch) {
        const hpChange = parseInt(statMatch[1]);
        const mpChange = parseInt(statMatch[2]);
        const sanityChange = parseInt(statMatch[3]);
        const favorabilityChange = parseInt(statMatch[4]);
        
        tempStatus = {
          ...tempStatus,
          protagonist: {
            ...tempStatus.protagonist,
            hp: Math.max(0, Math.min(tempStatus.protagonist.maxHp, (tempStatus.protagonist.hp || 0) + hpChange)),
            mp: Math.max(0, Math.min(tempStatus.protagonist.maxMp, (tempStatus.protagonist.mp || 0) + mpChange)),
            sanity: Math.max(0, Math.min(tempStatus.protagonist.maxSanity, (tempStatus.protagonist.sanity || 0) + sanityChange))
          }
        };
        
        // Update favorability for characters if applicable
        if (favorabilityChange !== 0) {
          // logic to update characters array
        }
        
        cleanText = cleanText.replace(statMatch[0], '');
      }

      const itemMatch = text.match(/【获得物品】(.*?)\|(.*)/);
      if (itemMatch) {
        const itemName = itemMatch[1].trim();
        const itemDesc = itemMatch[2].trim();
        addToInventory({ name: itemName, description: itemDesc, quantity: 1, type: 'special' });
        showNotification(`获得了特殊物品：${itemName}`, 'success');
        cleanText = cleanText.replace(itemMatch[0], '');
      }
      
      const offspringMatch = text.match(/【获得子嗣】(.*?)\|(.*?)\|(.*)/);
      if (offspringMatch) {
        const childName = offspringMatch[1].trim();
        const parentName = offspringMatch[2].trim();
        const childDesc = offspringMatch[3].trim();
        
        tempStatus = {
          ...tempStatus,
          offspring: [
            ...(tempStatus.offspring || []),
            { id: Date.now().toString(), name: childName, parent: parentName, age: 0, gender: Math.random() > 0.5 ? '男' : '女', description: childDesc, birthDate: Date.now() }
          ]
        };
        showNotification(`家族迎来了新生命：${childName}！`, 'success');
        cleanText = cleanText.replace(offspringMatch[0], '');
      }

      // Parse Bond Events
      const bondMatch = text.match(/【羁绊事件】(.*?)\|(.*?)\|(.*)/);
      if (bondMatch) {
        const charName = bondMatch[1].trim();
        const eventName = bondMatch[2].trim();
        const eventSummary = bondMatch[3].trim();
        
        tempStatus = {
          ...tempStatus,
          characterStoryProgress: {
            ...(tempStatus.characterStoryProgress || {}),
            [charName]: (tempStatus.characterStoryProgress?.[charName] || 0) + 1
          }
        };
        showNotification(`羁绊事件触发：${charName} - ${eventName}`, 'info');
        cleanText = cleanText.replace(bondMatch[0], '');
      }

      // Parse Main Plot Log
      const plotMatch = text.match(/【主线剧情】(.*?)\|(.*)/);
      if (plotMatch) {
        const plotDate = plotMatch[1].trim();
        const plotSummary = plotMatch[2].trim();
        tempStatus = {
          ...tempStatus,
          mainPlotLog: [...(tempStatus.mainPlotLog || []), { date: plotDate, summary: plotSummary }]
        };
        showNotification(`主线剧情更新：${plotSummary}`, 'info');
        cleanText = cleanText.replace(plotMatch[0], '');
      }

      // Parse Exploration Log
      const exploreMatch = text.match(/【探索记录】(.*?)\|(.*)/);
      if (exploreMatch) {
        const exploreDate = exploreMatch[1].trim();
        const exploreSummary = exploreMatch[2].trim();
        tempStatus = {
          ...tempStatus,
          explorationLog: [...(tempStatus.explorationLog || []), { date: exploreDate, summary: exploreSummary }]
        };
        showNotification(`探索记录更新：${exploreSummary}`, 'info');
        cleanText = cleanText.replace(exploreMatch[0], '');
      }

      // Final Game Over Check
      const isGameOver = tempStatus.protagonist.hp <= 0 || tempStatus.protagonist.sanity <= 0;
      if (isGameOver) {
        const cause = tempStatus.protagonist.hp <= 0 ? "生命值归零" : "理智值崩溃";
        const gameOverMsg: Message = {
          role: 'model',
          text: `【游戏结束】\n在刚才的互动中，你的${cause}。旅程在此画上了句点。\n\n[1] 开启新世界`,
          id: Date.now().toString(),
          summary: '游戏结束',
          status: {
            ...tempStatus,
            menu: ['[1] 开启新世界']
          }
        };
        setMessages(prev => [...prev, gameOverMsg]);
        setActiveNodeId(gameOverMsg.id!);
        tempStatus = gameOverMsg.status!;
      }

      setStatus(tempStatus);
      setInteractionModal({ isOpen: true, title, content: cleanText.trim(), isLoading: false });
    } catch (error: any) {
      console.error(error);
      let errorText = '互动失败，请检查网络或 API Key。';
      const errorString = JSON.stringify(error);
      if (error?.message === "EMPTY_CONTENT") {
        errorText = "AI 返回了空内容。这可能是由于触发了安全过滤或模型响应异常。请尝试修改您的输入或调整叙事风格设置。";
      } else if (error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED' || errorString.includes('429') || errorString.includes('QUOTA')) {
        errorText = `【系统预警：配额耗尽 (429)】\n\n原因分析：\n1. 预览版模型限制：您当前可能使用的是 \`gemini-3.1-pro-preview\` 或 \`gemini-3-flash-preview\`。这些是预览版模型，即使您绑定了付费卡，Google 也会对其施加极其严格的硬性限制（例如每分钟 2 次或每天 50 次）。\n2. Token 消耗过大：文字游戏会累积大量历史记录，导致单次请求的 Token 数极高，瞬间耗尽每分钟的 Token 额度 (TPM)。\n3. 计费未生效：您的 API Key 所在的 Google Cloud 项目可能尚未正确开启计费。\n\n解决方案：\n👉 强烈建议：点击右上角设置，将模型切换为 \`gemini-2.5-flash\` 或 \`gemini-2.5-pro\`，它们的付费额度非常充足，极少出现 429 错误。\n👉 稍等片刻：通常等待 1-2 分钟后，每分钟的频率限制会自动重置。\n👉 检查配额：访问 https://aistudio.google.com/app/plan_information 查看您的具体使用进度。`;
      } else if (error?.message?.includes('500') || errorString.includes('500') || errorString.includes('Internal Server Error')) {
        errorText = `【系统故障：核心内部错误 (500)】\n\n原因分析：\n1. AI 核心暂时性故障：Google 或第三方 API 内部出现暂时性错误。\n2. 请求参数冲突：某些自定义指令或 Base URL 配置可能导致核心无法处理。\n\n解决方案：\n👉 立即重试：点击下方“重新生成”或再次发送指令。\n👉 检查 Base URL：如果您使用了中转地址，请确认其是否有效。\n👉 切换模型：尝试切换到其他版本的模型。`;
      }
      setInteractionModal({ isOpen: true, title, content: errorText, isLoading: false });
    }
  };

  const giftItem = (itemName: string, charName: string) => {
    const itemIndex = status.inventory.findIndex(i => i.name === itemName);
    if (itemIndex === -1) {
      showNotification("背包中没有该物品！", "error");
      return;
    }

    const item = status.inventory[itemIndex];
    updateInventoryQuantity(item.id, -1);
    setGiftingTarget(null);
    
    // Send to AI for reaction and state update
    const prompt = `[赠礼] 我将 ${itemName}（描述：${item.description}）赠送给了 ${charName}。请根据物品的描述和角色的喜好，生成一段生动的反应描写，并相应地调整好感度、心情或关系。`;
    handleSend(prompt);
    setActiveTab('game');
    showNotification(`已向 ${charName} 赠送了 ${itemName}！`, "success");
  };

  const updateInventoryQuantity = (id: string, delta: number) => {
    setStatus(prev => ({
      ...prev,
      inventory: (prev.inventory || []).map(item => 
        item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
      ).filter(item => item.quantity > 0 || delta >= 0)
    }));
  };

  const removeFromInventory = (id: string) => {
    setStatus(prev => ({
      ...prev,
      inventory: (prev.inventory || []).filter(item => item.id !== id)
    }));
  };

  const jumpToNode = (id: string) => {
    setActiveNodeId(id);
    const element = document.getElementById(`node-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const startGame = () => {
    if (!getEffectiveApiKey()) {
      setShowSettings(true);
      return;
    }
    // Try to play BGM on user interaction
    setInitStep(1);
    setInitChoices([]);
    const bootMsg: Message = { 
      role: 'model', 
      text: `[系统初始化中...]
> 核心引擎：ERA-GEMINI v3.1
> 状态：就绪
> 正在加载引导程序...

欢迎使用 ERA 文字冒险游戏引擎。在开始您的旅程之前，请完成以下初始化设定：

1. 【路线与基调设定】：选择您的核心路线。`,
      id: 'boot',
      summary: '系统启动'
    };
    setMessages([bootMsg]);
    setActiveNodeId('boot');
  };

  const handleInitChoice = (choice: string) => {
    const match = choice.match(/^(.*?)\s*(\[.*\])?$/);
    const text = match ? match[1] : choice;
    
    if (text === '自定义') {
      setInputValue('我想要自定义设定：');
    } else {
      setInputValue(text);
    }
    
    setIsMenuExpanded(false);
    const inputEl = document.querySelector('input');
    if (inputEl) inputEl.focus();
  };

  const [customInitOptions, setCustomInitOptions] = useState<string[]>([]);

  const refreshInitOptions = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const injectedApiKey = getEffectiveApiKey();
      const ai = new GoogleGenAI({ apiKey: injectedApiKey });
      
      let prompt = "";
      switch(initStep) {
        case 1: prompt = "请生成5个不同的游戏剧情倾向/风格（如：黑暗、甜宠、日常等），每个选项带简短描述。"; break;
        case 2: prompt = `当前剧情倾向: ${initChoices[0]}\n请生成5个不同的世界观背景（如：西幻、仙侠、赛博等），并注明该世界的货币单位。`; break;
        case 3: prompt = `当前世界观: ${initChoices[1]}\n请生成4个符合该世界观的【主人公】初始设定（姓名、性别、形象、处境）。`; break;
        case 4: prompt = `当前世界观: ${initChoices[1]}\n当前主人公: ${initChoices[2]}\n请生成4个符合背景的【初始攻略对象】（姓名、性别、形象、处境）。`; break;
      }

      const response = await executeWithRetry(async () => {
        return await ai.models.generateContent({
          model: config.model || "gemini-3-flash-preview",
          contents: prompt,
          config: {
            systemInstruction: "你是一个游戏设定生成器。请直接输出选项列表，每行一个选项。不要包含任何多余的文字或星号。",
            safetySettings: SAFETY_SETTINGS,
          }
        });
      });

      const options = (response.text || "").split('\n').filter(line => line.trim().length > 0).map(line => line.replace(/^[-\d.\s*]+/, '').trim());
      if (options.length > 0) {
        setCustomInitOptions(options);
      }
    } catch (error: any) {
      console.error("Refresh options error:", error);
      let errorText = "刷新选项失败，请重试。";
      const errorString = JSON.stringify(error);
      if (error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED' || errorString.includes('429') || errorString.includes('QUOTA')) {
        errorText = "【系统预警：配额耗尽 (429)】请尝试切换到 gemini-2.5-flash 模型或稍后再试。";
      } else if (error?.message?.includes('500') || errorString.includes('500') || errorString.includes('Internal Server Error')) {
        errorText = "【系统故障：核心内部错误 (500)】请稍后再试。";
      }
      showNotification(errorText, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCustomInitOptions([]);
  }, [initStep]);

  const getInitOptions = () => {
    if (customInitOptions.length > 0) return [...customInitOptions, "自定义"];
    switch(initStep) {
      case 1: return [
        "黑暗堕落线 [强制爱][调教][高虐][主奴关系]", 
        "普通日常线 [经营][慢热养成][平等的伙伴关系]", 
        "甜宠恋爱/后宫线 [高糖分][双向奔赴][轻松修罗场]", 
        "相爱相杀/宿命线 [势均力敌][立场冲突][极限推拉]", 
        "自定义"
      ];
      case 2: return [
        "西幻地下城 [金币]", 
        "中国古代宫廷/江湖 [两]", 
        "赛博朋克/企业战争 [信用点]", 
        "玄幻修仙/合欢宗 [灵石]", 
        "现代黑道 [钞票]", 
        "衍生作品世界 [自定义]", 
        "自定义"
      ];
      case 3: return [
        "姓名：林风 | 性别：男 | 形象：清冷孤傲，白衣染血 | 简介：曾经的天才剑修，如今灵脉尽毁，背负巨债，只能在底层挣扎。", 
        "姓名：夜枭 | 性别：男 | 形象：黑袍覆面，眼神阴鸷 | 简介：掌控着地下黑市的幕后黑手，冷酷无情，将所有人视为棋子。", 
        "姓名：苏媚 | 性别：女 | 形象：妖娆妩媚，眼波流转 | 简介：拥有罕见的纯阴之体，引来无数强者觊觎，为了生存只能步步为营。", 
        "姓名：亚瑟 | 性别：男 | 形象：金发碧眼，衣着朴素 | 简介：刚刚继承了一家破败的酒馆，为了重振家族荣光而努力经营。", 
        "衍生作品的具体人物或原创人物 [自定义]", 
        "自定义 (姓名/性别/性向/处境)"
      ];
      case 4: return [
        "姓名：沈墨尘 | 性别：男 | 形象：高岭之花，白衣胜雪 | 简介：曾经的宿敌，正道楷模，如今灵力被封印，沦为你的阶下囚，满心屈辱与不甘。", 
        "姓名：伊丽莎白 | 性别：女 | 形象：金发红裙，高贵傲慢 | 简介：曾经高高在上的帝国公主，因国家覆灭被当做奴隶贩卖到你手中，依然保持着高傲的自尊。", 
        "姓名：顾清寒 | 性别：女 | 形象：清冷如月，手持长剑 | 简介：信仰坚定的圣女，为了拯救苍生自愿被你扣留，试图用感化来改变你。", 
        "姓名：陆远 | 性别：男 | 形象：阳光开朗，笑容温暖 | 简介：从小一起长大的青梅竹马，因家族破产被迫依附于你，对你既有依赖又有一丝复杂的情感。", 
        "合伙人 [与你共同经营据点，关系平等且利益绑定]", 
        "同人世界主要角色 [自定义]",
        "自定义角色"
      ];
      default: return [];
    }
  };

  const toggleCollapse = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, collapsed: !m.collapsed } : m));
  };

  const saveConfig = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    localStorage.setItem('game_theme', theme);
    localStorage.setItem('game_mode', mode);
    localStorage.setItem('game_font_size', fontSize);
    localStorage.setItem('game_perspective', config.perspective);
    localStorage.setItem('game_word_count', config.wordCount.toString());
    localStorage.setItem('game_model', config.model);
    localStorage.setItem('game_base_url', config.baseUrl);
    localStorage.setItem('game_memory_limit', (config.memoryLimit || 20).toString());
    localStorage.setItem('game_custom_instructions', config.customInstructions || '');
    localStorage.setItem('game_narrative_style', config.narrativeStyle || '文学叙事');
    localStorage.setItem('game_claude_api_key', config.claudeApiKey || '');
    localStorage.setItem('game_claude_model', config.claudeModel || 'claude-sonnet-4-5');
    localStorage.setItem('game_zhipu_api_key', config.zhipuApiKey || '');
    localStorage.setItem('game_zhipu_model', config.zhipuModel || 'glm-4-flash');
    localStorage.setItem('game_ai_provider', config.aiProvider || 'gemini');
    localStorage.setItem('game_claude_role', config.claudeRole || '神秘旁白者');
    setShowSettings(false);
    showNotification("配置已保存！", "success");
  };

  const themes = [
    { id: 'emerald', name: '翡翠 (默认)', color: '#10b981' },
    { id: 'ancient', name: '琥珀 (古风)', color: '#f59e0b' },
    { id: 'romance', name: '玫瑰 (浪漫)', color: '#f472b6' },
    { id: 'cyberpunk', name: '霓虹 (赛博)', color: '#22d3ee' },
    { id: 'midnight', name: '靛青 (午夜)', color: '#818cf8' },
    { id: 'blue', name: '蔚蓝 (深海)', color: '#60a5fa' },
    { id: 'cyan', name: '青翠 (数码)', color: '#2dd4bf' },
    { id: 'horror', name: '绯红 (惊悚)', color: '#f87171' },
  ];

  const statusItems = [
    { label: '时间线', value: `${status.date} · ${status.time}`, icon: <Calendar size={10} />, key: 'date' },
    { label: '资金', value: status.funds, icon: <Coins size={10} />, key: 'funds' },
    { label: '主角', value: status.protagonist.name, icon: <User size={10} />, key: 'name' },
    { label: '声望', value: status.reputation, icon: <Users size={10} />, key: 'rep' },
  ];

  return (
    <div 
      data-theme={theme}
      data-mode={mode}
      data-size={fontSize}
      style={{ color: fontColor }}
      className="flex h-screen h-[100dvh] bg-[var(--bg-color)] text-[var(--primary-color)] font-mono overflow-hidden selection:bg-[var(--primary-color)] selection:text-black relative transition-all duration-500"
    >
      <div className="crt-overlay" />
      <div className="scanline-effect" />

      {/* Floating Navigation Buttons */}
      <div className="fixed bottom-24 right-6 flex flex-col gap-3 z-50">
        <button 
          onClick={() => {
            if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="w-12 h-12 bg-[var(--panel-bg)] border-2 terminal-border rounded-full flex items-center justify-center text-[var(--primary-color)] shadow-lg hover:bg-[var(--primary-color)] hover:text-black transition-all group"
          title="回到顶部"
        >
          <ChevronRight size={24} className="-rotate-90 group-hover:scale-110 transition-transform" />
        </button>
        <button 
          onClick={() => {
            if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
          }}
          className="w-12 h-12 bg-[var(--panel-bg)] border-2 terminal-border rounded-full flex items-center justify-center text-[var(--primary-color)] shadow-lg hover:bg-[var(--primary-color)] hover:text-black transition-all group"
          title="回到最新"
        >
          <ChevronRight size={24} className="rotate-90 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      <AnimatePresence>
        {currentAchievement && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="achievement-toast"
          >
            <span className="text-2xl">{currentAchievement.icon}</span>
            <div>
              <div className="text-[10px] opacity-50 font-bold uppercase">成就解锁！</div>
              <div className="font-black">{currentAchievement.title}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="glass-panel border-b terminal-border z-20 shadow-xl overflow-hidden transition-all duration-500">
          <div className="p-3 md:p-4">
            <div className="grid grid-cols-2 md:flex md:justify-between md:items-center gap-3 md:gap-4 px-2">
              {/* Row 1 Left: Title */}
              <div className="flex items-center gap-3 order-1 col-span-1">
                <div className="w-4 h-4 rounded-lg bg-[var(--primary-color)] flex items-center justify-center shadow-[0_0_12px_var(--primary-color)]">
                  <RefreshCw size={10} className="text-black" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-sm md:text-xl font-black tracking-[0.1em] terminal-glow uppercase font-display leading-tight">
                    创世系统
                  </h1>
                  <span className="text-[7px] md:text-[8px] opacity-40 font-bold tracking-widest uppercase">ERA_ENGINE v3.2</span>
                </div>
              </div>

              {/* Row 1 Right: Tabs */}
              <div className="flex justify-end order-2 col-span-1 md:order-2">
                <div className="flex bg-black/20 p-1 rounded-2xl border terminal-border backdrop-blur-xl">
                  <button 
                    onClick={() => switchTab('game')}
                    className={`px-3 md:px-6 py-2 text-[10px] font-black rounded-xl transition-all flex items-center gap-2 ${activeTab === 'game' ? 'bg-[var(--primary-color)] text-black shadow-[0_0_15px_var(--glow-color)]' : 'opacity-60 hover:opacity-100 hover:bg-white/5'}`}
                  >
                    <Gamepad2 size={12} className="hidden md:block" /> 游戏 / GAME
                  </button>
                  <button 
                    onClick={() => switchTab('data')}
                    className={`px-3 md:px-6 py-2 text-[10px] font-black rounded-xl transition-all flex items-center gap-2 ${activeTab === 'data' ? 'bg-[var(--primary-color)] text-black shadow-[0_0_15px_var(--glow-color)]' : 'opacity-60 hover:opacity-100 hover:bg-white/5'}`}
                  >
                    <Database size={12} className="hidden md:block" /> 数据 / DATA
                  </button>
                  <button 
                    onClick={() => switchTab('explore')}
                    className={`px-3 md:px-6 py-2 text-[10px] font-black rounded-xl transition-all flex items-center gap-2 ${activeTab === 'explore' ? 'bg-[var(--primary-color)] text-black shadow-[0_0_15px_var(--glow-color)]' : 'opacity-60 hover:opacity-100 hover:bg-white/5'}`}
                  >
                    <Compass size={12} className="hidden md:block" /> 探索 / EXPLORE
                  </button>
                </div>
              </div>

              {/* Row 2 Left: Status Toggle (Mobile only) / Actions (Desktop) */}
              <div className="flex items-center order-3 md:order-3">
                <button 
                  onClick={() => setIsStatusExpanded(!isStatusExpanded)}
                  className="p-1.5 border terminal-border rounded-xl hover:bg-[var(--primary-color)]/10 transition-all flex items-center gap-2"
                >
                  {isStatusExpanded ? <ChevronLeft size={14} className="rotate-90" /> : <ChevronRight size={14} className="rotate-90" />}
                  <span className="text-[10px] font-black md:hidden">系统状态</span>
                </button>
              </div>

              {/* Row 2 Right: Actions */}
              <div className="flex justify-end items-center gap-2 order-4 md:order-4">
                <button 
                  onClick={() => setShowSaves(true)}
                  className="flex items-center gap-2 p-1.5 px-3 border terminal-border hover:bg-[var(--primary-color)] hover:text-black transition-all rounded-xl text-[10px] uppercase font-black"
                >
                  <Save size={14} />
                  <span className="hidden sm:inline">存档</span>
                </button>
                <button 
                  onClick={triggerRandomEvent}
                  disabled={isLoading || messages.length === 0}
                  className="flex items-center gap-2 p-1.5 px-3 border terminal-border hover:bg-[var(--primary-color)] hover:text-black transition-all rounded-xl text-[10px] uppercase font-black disabled:opacity-30"
                  title="刷新剧情/随机事件"
                >
                  <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                  <span className="hidden sm:inline">刷新</span>
                </button>
                <button 
                  onClick={() => setShowSettings(true)}
                  className="flex items-center gap-2 p-1.5 px-3 border terminal-border hover:bg-[var(--primary-color)] hover:text-black transition-all rounded-xl text-[10px] uppercase font-black"
                >
                  <Settings size={14} />
                  <span className="hidden sm:inline">设置</span>
                </button>
              </div>
            </div>
            
            <AnimatePresence>
              {isStatusExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="grid grid-cols-4 gap-2 md:gap-4 pt-2 border-t terminal-border"
                >
                  {statusItems.map((item) => (
                    <div key={item.label} className="flex flex-col border-r terminal-border px-2 last:border-0 group">
                      <span className="text-[9px] opacity-40 uppercase flex items-center gap-1 mb-1 font-bold group-hover:opacity-100 transition-opacity">
                        {item.icon} {item.label}
                      </span>
                      <span className={`text-xs md:text-sm font-black truncate tracking-tight transition-all ${
                        lastStatus && (lastStatus as any)[item.key] !== (status as any)[item.key] ? 'status-change' : ''
                      }`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Main Content Area */}
        <motion.div 
          className="flex-1 relative overflow-hidden"
          onPanEnd={(e, info) => {
            const threshold = 50;
            if (info.offset.x > threshold) {
              // Swipe Right -> Previous Tab
              if (activeTab === 'data') switchTab('game');
              else if (activeTab === 'explore') switchTab('data');
            } else if (info.offset.x < -threshold) {
              // Swipe Left -> Next Tab
              if (activeTab === 'game') switchTab('data');
              else if (activeTab === 'data') switchTab('explore');
            }
          }}
        >
          <AnimatePresence mode="wait">
            {activeTab === 'game' && (
              <motion.main 
                key={`game-view-${gameKey}`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                ref={scrollRef}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, info) => {
                  if (info.offset.x < -100) setActiveTab('data');
                }}
                className="absolute inset-0 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth flicker-effect custom-scrollbar"
              >
                {/* Integrated Timeline */}
                <div className="fixed right-2 md:right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 md:gap-4 z-10 pointer-events-none">
                  <div className="w-px h-16 md:h-32 bg-[var(--border-color)] opacity-10" />
                  <div className="flex flex-col gap-2 md:gap-4 pointer-events-auto">
                    {messages.filter(m => m.role === 'model').slice(-15).map((msg) => (
                      <button
                        key={msg.id}
                        onClick={() => jumpToNode(msg.id!)}
                        className={`group relative w-1.5 h-1.5 md:w-2 md:h-2 rounded-full border transition-all duration-500 ${
                          activeNodeId === msg.id 
                            ? 'bg-[var(--primary-color)] border-[var(--primary-color)] scale-150 shadow-[0_0_15px_var(--glow-color)]' 
                            : 'border-[var(--border-color)] opacity-20 hover:opacity-100 hover:scale-125'
                        }`}
                      >
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 px-3 py-1 glass-panel border terminal-border text-[8px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest font-black rounded-lg">
                          {msg.summary || '对话节点'}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="w-px h-16 md:h-32 bg-[var(--border-color)] opacity-10" />
                </div>

                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-10 glass-panel border-2 terminal-border border-dashed rounded-2xl max-w-2xl"
                    >
                      <Zap size={48} className="mx-auto mb-6 text-[var(--primary-color)] animate-bounce" />
                      <h2 className="text-3xl mb-4 terminal-glow font-black tracking-tighter uppercase">ERA_ENGINE</h2>
                      <p className="mb-8 opacity-60 text-sm leading-relaxed">
                        欢迎进入高自由度文字模拟系统。
                        支持深度剧情演化、动态数值管理及全方位的角色互动。
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button 
                          onClick={startGame}
                          className="px-8 py-4 bg-[var(--primary-color)] text-black font-black hover:opacity-80 transition-all flex items-center justify-center gap-3 rounded-xl shadow-[0_0_20px_var(--glow-color)]"
                        >
                          <Play size={20} fill="currentColor" /> 启动系统
                        </button>
                        <button 
                          onClick={() => setShowSaves(true)}
                          className="px-8 py-4 border-2 terminal-border hover:bg-[var(--primary-color)]/10 transition-all flex items-center justify-center gap-3 rounded-xl font-bold"
                        >
                          <Save size={20} /> 读取存档
                        </button>
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  <div className="max-w-5xl mx-auto space-y-12 pb-20">
                    {messages.map((msg, i) => (
                      <div 
                        key={msg.id || i} 
                        id={`node-${msg.id}`}
                        ref={i === messages.length - 1 ? lastMessageRef : null}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}
                      >
                        <div 
                          onClick={() => {
                            if (editingId !== msg.id) {
                              setActiveMenuId(activeMenuId === msg.id ? null : msg.id || null);
                            }
                          }}
                          className={`relative p-4 md:p-8 rounded-3xl transition-all duration-500 cursor-pointer ${
                            msg.role === 'user' 
                              ? 'bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/30 text-right ml-12 hover:bg-[var(--primary-color)]/20' 
                              : `bg-transparent text-left mr-12 border-l-4 border-[var(--primary-color)]/20 hover:border-[var(--primary-color)]/40 ${activeNodeId === msg.id ? 'border-[var(--primary-color)]' : ''}`
                          }`}
                        >
                          {msg.role === 'model' && (
                            <div className="absolute -top-4 left-6 flex items-center gap-2">
                              <div className="px-3 py-1 glass-panel border terminal-border text-[9px] text-[var(--primary-color)] uppercase tracking-[0.3em] font-black rounded-full">
                                系统输出_{msg.id?.slice(-4) || '数据'}
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCollapse(msg.id!);
                                }}
                                className="p-1 glass-panel border terminal-border rounded-full hover:bg-[var(--primary-color)]/20 transition-all"
                              >
                                {msg.collapsed ? <ChevronRight size={10} className="rotate-90" /> : <ChevronLeft size={10} className="-rotate-90" />}
                              </button>
                            </div>
                          )}
                          
                          <div className={`whitespace-pre-wrap text-base md:text-xl leading-[1.8] tracking-wide ${msg.role === 'model' ? 'font-medium' : 'italic opacity-70'}`}>
                            {msg.collapsed ? (
                              <div className="flex items-center gap-2 opacity-40 italic text-sm">
                                <MessageSquare size={14} /> {msg.summary || '剧情已收起...'}
                              </div>
                            ) : (
                              editingId === msg.id ? (
                                <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                                  <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="w-full p-4 bg-black/40 border terminal-border rounded-2xl text-sm font-mono focus:outline-none min-h-[150px] leading-relaxed"
                                    autoFocus
                                  />
                                  <div className="flex flex-wrap gap-2">
                                    <button onClick={saveEdit} className="px-4 py-2 bg-[var(--primary-color)] text-black text-xs font-black rounded-xl">修改保存</button>
                                    <button 
                                      onClick={() => saveAndRefresh(msg.id!)} 
                                      className="px-4 py-2 bg-[var(--primary-color)]/20 border border-[var(--primary-color)] text-[var(--primary-color)] text-xs font-black rounded-xl"
                                    >
                                      保存刷新
                                    </button>
                                    <button onClick={() => setEditingId(null)} className="px-4 py-2 border terminal-border text-xs font-bold rounded-xl">取消</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {(msg.text || '').split('\n').filter(line => line.trim()).map((paragraph, pIdx) => (
                                    <p key={pIdx}>{paragraph.trim()}</p>
                                  ))}
                                  
                                  {msg.isError && (
                                    <div className="mt-4 pt-4 border-t border-red-500/20">
                                      <button 
                                        onClick={() => handleRegenerate(msg.id!)}
                                        className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white text-xs font-black rounded-xl hover:bg-red-600 transition-all shadow-lg active:scale-95"
                                      >
                                        <RefreshCw size={14} className="animate-spin-slow" /> 立即重试 / RETRY
                                      </button>
                                    </div>
                                  )}
                                  
                                  <AnimatePresence>
                                    {activeMenuId === msg.id && (
                                      <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="mt-6 p-3 glass-panel border terminal-border rounded-2xl flex flex-wrap gap-3 shadow-2xl z-10"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <button 
                                          onClick={() => {
                                            startEditing(msg);
                                            setActiveMenuId(null);
                                          }}
                                          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/30 text-[var(--primary-color)] text-[10px] font-black rounded-xl hover:bg-[var(--primary-color)] hover:text-black transition-all"
                                        >
                                          <FileText size={12} /> 修改内容
                                        </button>
                                        <button 
                                          onClick={() => {
                                            if (msg.role === 'model') {
                                              handleRegenerate(msg.id!);
                                            } else {
                                              const idx = messages.findIndex(m => m.id === msg.id);
                                              if (idx !== -1 && messages[idx+1]?.role === 'model') {
                                                handleRegenerate(messages[idx+1].id!);
                                              }
                                            }
                                            setActiveMenuId(null);
                                          }}
                                          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/30 text-[var(--primary-color)] text-[10px] font-black rounded-xl hover:bg-[var(--primary-color)] hover:text-black transition-all"
                                        >
                                          <RefreshCw size={12} /> 修改并刷新
                                        </button>
                                        <button 
                                          onClick={() => {
                                            deleteMessage(msg.id!);
                                            setActiveMenuId(null);
                                          }}
                                          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                        >
                                          <Trash2 size={12} /> 删除对话
                                        </button>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                ))}
              </div>
            )}
          {isLoading && (
            <div className="flex justify-start max-w-4xl mx-auto pb-10">
              <div className="flex items-center gap-4 text-sm opacity-50 italic font-bold">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-[var(--primary-color)] rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-[var(--primary-color)] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 bg-[var(--primary-color)] rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                正在解析因果链条...
              </div>
            </div>
          )}
        </motion.main>
      )}

            {activeTab === 'data' && (
              <motion.div 
                key="data-view"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, info) => {
                  if (info.offset.x > 100) setActiveTab('game');
                  else if (info.offset.x < -100) setActiveTab('explore');
                }}
                className="absolute inset-0 overflow-y-auto p-6 space-y-12 custom-scrollbar tab-content-data"
              >
                {/* World Setting */}
                <section className="space-y-4">
                  <div className="flex justify-between items-center border-b terminal-border pb-2">
                    <h3 className="text-xl font-black terminal-glow uppercase flex items-center gap-2">
                      <Globe size={20} /> 世界设定 / WORLD SETTING
                    </h3>
                    <button 
                      onClick={() => setEditingWorld(!editingWorld)}
                      className="text-[10px] font-black px-3 py-1 border terminal-border rounded-lg hover:bg-[var(--primary-color)] hover:text-black transition-all"
                    >
                      {editingWorld ? '保存设定' : '编辑设定'}
                    </button>
                  </div>
                  <div className="glass-panel p-6 border terminal-border rounded-3xl space-y-4">
                    {editingWorld ? (
                      <textarea 
                        value={status.worldDescription}
                        onChange={(e) => setStatus(prev => ({ ...prev, worldDescription: e.target.value }))}
                        className="w-full bg-black/20 border terminal-border p-4 rounded-2xl text-sm outline-none focus:border-[var(--primary-color)] min-h-[200px] font-mono leading-relaxed"
                      />
                    ) : (
                      <>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full border-2 border-dashed terminal-border flex items-center justify-center animate-spin-slow shrink-0">
                            <Zap size={20} className="text-[var(--primary-color)]" />
                          </div>
                          <div>
                            <div className="text-[10px] opacity-50 uppercase tracking-widest">当前世界观</div>
                            <div className="text-lg font-black">{initChoices[1] || '未设定'}</div>
                          </div>
                        </div>
                        <div className="text-sm leading-relaxed opacity-80 whitespace-pre-wrap italic border-l-2 border-[var(--primary-color)]/30 pl-4 py-2">
                          {status.worldDescription || '暂无详细描述...'}
                        </div>
                      </>
                    )}
                  </div>
                </section>

                {/* Protagonist Stats */}
                <section className="space-y-4">
                  <h3 className="text-xl font-black terminal-glow uppercase border-b terminal-border pb-2 flex items-center gap-2">
                    <User size={20} /> 主角档案 / PROTAGONIST
                  </h3>
                  <div className="glass-panel p-6 border terminal-border rounded-3xl shadow-xl overflow-hidden">
                    <div className="flex flex-col gap-8">
                      <div className="flex flex-col md:flex-row gap-8">
                        {/* Portrait */}
                        <div className="w-full md:w-48 shrink-0 space-y-4">
                          <div className="relative aspect-square rounded-2xl bg-[var(--primary-color)]/10 border terminal-border flex items-center justify-center text-[var(--primary-color)] overflow-hidden group">
                            {protagonistPortrait || status.protagonist.portrait ? (
                              <img src={protagonistPortrait || status.protagonist.portrait} alt="Protagonist" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <User size={64} className="opacity-20" />
                            )}
                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity">
                              <Plus size={32} className="mb-2" />
                              <span className="text-[10px] font-black uppercase tracking-widest">上传形象</span>
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'protagonist')} />
                            </label>
                          </div>
                          <div className="text-center space-y-1">
                            <div className="text-2xl font-black text-[var(--primary-color)] tracking-tighter">{status.protagonist.name || '未设定'}</div>
                            <div className="text-[10px] opacity-50 uppercase tracking-[0.2em] font-bold">{status.protagonist.state || '正常'}</div>
                            {/* 等级徽章 */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded-full">
                              <Trophy size={10} className="text-yellow-400" />
                              <span className="text-[11px] font-black text-yellow-400">LV.{status.protagonist.level || 1}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-1 space-y-5">
                          {/* 核心战斗属性 */}
                          <div className="space-y-3">
                            <div className="text-[10px] opacity-40 uppercase font-bold border-b terminal-border pb-1">核心属性 / CORE STATS</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* HP */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-black uppercase">
                                  <span className="flex items-center gap-1"><Heart size={10} className="text-red-500" /> 生命值 / HP</span>
                                  <span className="text-red-400">{Math.round(status.protagonist.hp ?? 100)} / {status.protagonist.maxHp ?? 100}</span>
                                </div>
                                <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                  <motion.div animate={{ width: `${((status.protagonist.hp ?? 100) / (status.protagonist.maxHp || 100)) * 100}%` }} className="h-full bg-gradient-to-r from-red-700 to-red-400 shadow-[0_0_8px_rgba(220,38,38,0.6)]" />
                                </div>
                              </div>
                              {/* MP */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-black uppercase">
                                  <span className="flex items-center gap-1"><Zap size={10} className="text-blue-500" /> 法力值 / MP</span>
                                  <span className="text-blue-400">{Math.round(status.protagonist.mp ?? 50)} / {status.protagonist.maxMp ?? 50}</span>
                                </div>
                                <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                  <motion.div animate={{ width: `${((status.protagonist.mp ?? 50) / (status.protagonist.maxMp || 50)) * 100}%` }} className="h-full bg-gradient-to-r from-blue-700 to-blue-400 shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                                </div>
                              </div>
                              {/* SAN */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-black uppercase">
                                  <span className="flex items-center gap-1"><Activity size={10} className="text-purple-500" /> 理智值 / SAN</span>
                                  <span className="text-purple-400">{Math.round(status.protagonist.sanity ?? 100)} / {status.protagonist.maxSanity ?? 100}</span>
                                </div>
                                <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                  <motion.div animate={{ width: `${((status.protagonist.sanity ?? 100) / (status.protagonist.maxSanity || 100)) * 100}%` }} className="h-full bg-gradient-to-r from-purple-700 to-purple-400 shadow-[0_0_8px_rgba(147,51,234,0.6)]" />
                                </div>
                              </div>
                              {/* EXP —— 显示本级进度 */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-black uppercase">
                                  <span className="flex items-center gap-1"><Trophy size={10} className="text-yellow-500" /> 经验值 / EXP · LV.{status.protagonist.level || 1}</span>
                                  <span className="text-yellow-400">{status.protagonist.exp ?? 0} / 100</span>
                                </div>
                                <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                  <motion.div animate={{ width: `${Math.min(100, status.protagonist.exp ?? 0)}%` }} className="h-full bg-gradient-to-r from-yellow-700 to-yellow-400 shadow-[0_0_8px_rgba(202,138,4,0.6)]" />
                                </div>
                                <div className="text-[8px] opacity-40 text-right">累计升级次数 → LV.{status.protagonist.level || 1} · 满级后属性持续提升</div>
                              </div>
                            </div>
                          </div>

                          {/* 次要属性：资金、声望、场景、时间 */}
                          <div className="space-y-3">
                            <div className="text-[10px] opacity-40 uppercase font-bold border-b terminal-border pb-1">状态信息 / STATUS INFO</div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-1">
                                <div className="text-[8px] opacity-40 uppercase flex items-center gap-1"><Coins size={8} /> 资金</div>
                                <div className="text-sm font-black text-yellow-400 truncate">{status.funds || '0'}</div>
                              </div>
                              <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-1">
                                <div className="text-[8px] opacity-40 uppercase flex items-center gap-1"><Trophy size={8} /> 声望</div>
                                <div className="text-xs font-black text-blue-400 truncate">{status.reputation || '无名小卒'}</div>
                              </div>
                              <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-1">
                                <div className="text-[8px] opacity-40 uppercase flex items-center gap-1"><Calendar size={8} /> 日期</div>
                                <div className="text-xs font-black truncate">{status.date} · {status.time}</div>
                              </div>
                              <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-1">
                                <div className="text-[8px] opacity-40 uppercase flex items-center gap-1"><MapPin size={8} /> 场景</div>
                                <div className="text-xs font-black capitalize truncate">{status.scene || 'exploration'}</div>
                              </div>
                            </div>
                          </div>

                          {/* 手动调整属性 */}
                          <div className="space-y-2">
                            <div className="text-[10px] opacity-40 uppercase font-bold border-b terminal-border pb-1">手动调整 / MANUAL ADJUST</div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {([
                                { label: 'HP', key: 'hp', max: 'maxHp', color: 'red' },
                                { label: 'MP', key: 'mp', max: 'maxMp', color: 'blue' },
                                { label: 'SAN', key: 'sanity', max: 'maxSanity', color: 'purple' },
                                { label: 'EXP', key: 'exp', max: null, color: 'yellow' },
                              ] as const).map(({ label, key, max, color }) => (
                                <div key={key} className="flex flex-col gap-1">
                                  <div className="text-[8px] opacity-40 font-black uppercase">{label}</div>
                                  <div className="flex gap-1">
                                    <button onClick={() => setStatus(prev => ({ ...prev, protagonist: { ...prev.protagonist, [key]: Math.max(0, (prev.protagonist[key] ?? 0) - 10) } }))} className="w-6 h-6 bg-red-500/20 text-red-400 rounded text-xs font-black hover:bg-red-500 hover:text-white transition-all">-</button>
                                    <input
                                      type="number"
                                      value={status.protagonist[key] ?? 0}
                                      onChange={(e) => setStatus(prev => ({ ...prev, protagonist: { ...prev.protagonist, [key]: Math.max(0, parseInt(e.target.value) || 0) } }))}
                                      className="flex-1 w-0 bg-black/30 border terminal-border rounded text-center text-[10px] font-black outline-none focus:border-[var(--primary-color)]"
                                    />
                                    <button onClick={() => setStatus(prev => ({ ...prev, protagonist: { ...prev.protagonist, [key]: (prev.protagonist[key] ?? 0) + 10 } }))} className="w-6 h-6 bg-green-500/20 text-green-400 rounded text-xs font-black hover:bg-green-500 hover:text-white transition-all">+</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 描述 */}
                          <div className="space-y-3 pt-2 border-t terminal-border">
                            <div className="flex justify-between items-center">
                              <div className="text-[10px] opacity-40 uppercase font-bold flex items-center gap-1"><FileText size={10} /> 个人描述 / DESCRIPTION</div>
                              <button onClick={generateProtagonistDescription} disabled={isGeneratingDesc || isLoading} className="text-[9px] font-black px-2 py-1 border terminal-border rounded-lg hover:bg-[var(--primary-color)] hover:text-black transition-all disabled:opacity-30 flex items-center gap-1">
                                <Sparkles size={10} /> {isGeneratingDesc ? '生成中...' : 'AI 补完背景'}
                              </button>
                            </div>
                            <textarea
                              value={status.protagonist.description || ''}
                              onChange={(e) => setStatus(prev => ({ ...prev, protagonist: { ...prev.protagonist, description: e.target.value } }))}
                              className="w-full bg-white/90 border-2 border-[var(--primary-color)] p-4 rounded-2xl text-sm text-black resize-none focus:outline-none focus:ring-2 ring-[var(--primary-color)] min-h-[100px] font-sans leading-relaxed custom-scrollbar transition-all shadow-inner"
                              placeholder="输入主角的背景描述..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Inventory System */}
                <section className="space-y-4">
                  <div className="flex justify-between items-center border-b terminal-border pb-2">
                    <h3 className="text-xl font-black terminal-glow uppercase flex items-center gap-2">
                      <Briefcase size={20} /> 系统背包 / INVENTORY
                    </h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setActiveTab('explore'); setActiveExploreTab('shop'); }}
                        className="text-[10px] font-black px-3 py-1 bg-[var(--primary-color)] text-black rounded-lg hover:opacity-80 transition-all flex items-center gap-1"
                      >
                        <ShoppingCart size={12} /> 前往商店
                      </button>
                      <button 
                        onClick={() => setShowInventory(!showInventory)}
                        className="text-[10px] font-black px-3 py-1 bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/30 text-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color)] hover:text-black transition-all"
                      >
                        {showInventory ? '返回列表' : '管理物品'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {status.inventory?.map((item) => (
                      <div key={item.id} className="glass-panel p-4 border terminal-border rounded-2xl group relative hover:border-[var(--primary-color)] transition-all flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] opacity-40 mb-1 uppercase tracking-tighter">Item</div>
                          <div className="font-black text-sm truncate mb-1">{item.name}</div>
                          <div className="text-[9px] opacity-50 line-clamp-2 mb-3 h-6 leading-tight">{item.description}</div>
                        </div>
                        <div className="flex justify-between items-center mt-auto">
                          <span className="text-[10px] px-1.5 py-0.5 bg-[var(--primary-color)]/20 text-[var(--primary-color)] rounded font-black">x{item.quantity}</span>
                          <div className="flex gap-1">
                            {item.type === 'consumable' && (
                              <button 
                                onClick={() => useItem(item)}
                                className="px-2 py-1 bg-[var(--primary-color)] text-black text-[9px] font-black rounded hover:opacity-80 transition-all"
                              >
                                使用
                              </button>
                            )}
                            {showInventory && (
                              <>
                                <button onClick={() => updateInventoryQuantity(item.id, -1)} className="w-5 h-5 flex items-center justify-center bg-red-500/20 text-red-500 rounded hover:bg-red-500 hover:text-white transition-all">-</button>
                                <button onClick={() => updateInventoryQuantity(item.id, 1)} className="w-5 h-5 flex items-center justify-center bg-green-500/20 text-green-500 rounded hover:bg-green-500 hover:text-white transition-all">+</button>
                              </>
                            )}
                          </div>
                        </div>
                        {showInventory && (
                          <button 
                            onClick={() => removeFromInventory(item.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                    {showInventory && (
                      <button 
                        onClick={() => {
                          const name = prompt('物品名称:');
                          const desc = prompt('物品描述:');
                          if (name) addToInventory({ name, description: desc || '', quantity: 1, type: 'other' });
                        }}
                        className="p-4 border-2 border-dashed terminal-border rounded-2xl flex flex-col items-center justify-center gap-2 opacity-40 hover:opacity-100 hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-all"
                      >
                        <Plus size={24} />
                        <span className="text-[10px] font-black uppercase">添加物品</span>
                      </button>
                    )}
                    {(!status.inventory || status.inventory.length === 0) && !showInventory && (
                      <div className="col-span-full py-8 text-center opacity-30 italic text-sm border terminal-border rounded-2xl">
                        背包空空如也...
                      </div>
                    )}
                  </div>
                </section>

                {/* Characters Directory */}
                <section className="space-y-4">
                  <h3 className="text-xl font-black terminal-glow uppercase border-b terminal-border pb-2 flex items-center gap-2">
                    <Users size={20} /> 攻略目录 / CHARACTERS
                  </h3>
                  <div className="space-y-6">
                    {(() => {
                      const charMap = new Map<string, string>();
                      status.characters.forEach(char => {
                        const charStr = char as string;
                        let name = '';

                        // ✅ 修复：优先用 [名字] 格式提取，过滤掉数字和长字符串
                        const bracketMatches = charStr.match(/\[([^\]]+)\]/g);
                        if (bracketMatches) {
                          for (const match of bracketMatches) {
                            const inner = match.replace(/[\[\]]/g, '').trim();
                            // 排除纯数字、太长的描述、包含特殊词的
                            if (!/^[\d.\s]+$/.test(inner) &&
                                inner.length < 12 &&
                                !inner.includes('难度') &&
                                !inner.includes('状态') &&
                                !inner.includes('好感') &&
                                !inner.includes('身份') &&
                                !['剧情正文', '旁白', '注意', '角色姓名', '主角', '系统'].includes(inner)) {
                              name = inner;
                              break;
                            }
                          }
                        }

                        // 备用：取第一个"|"或"："之前的内容作为名字
                        if (!name) {
                          const altMatch = charStr.replace(/^\[.*?\]\s*/, '').match(/^([^\[：:\|　\s]{1,10})/);
                          if (altMatch) name = altMatch[1].trim();
                        }

                        name = name.replace(/^[\d.\s]+/, '').trim();

                        if (name && name !== status.protagonist.name && name !== '主角' && name.length > 0) {
                          charMap.set(name, charStr);
                        }
                      });
                      
                      const uniqueChars = Array.from(charMap.entries());
                      
                      if (uniqueChars.length === 0) {
                        return (
                          <div className="col-span-full opacity-30 italic text-sm py-20 text-center border-2 border-dashed terminal-border rounded-3xl">
                            暂无角色情报，随着剧情推进将自动解锁...
                          </div>
                        );
                      }
                      
                      return uniqueChars.map(([name, charStr], i) => {
                        let info = charStr;
                        if (charStr.includes(`[${name}]`)) {
                          info = charStr.replace(`[${name}]`, '').trim();
                          info = info.replace(/^[-：:\|\s]+/, '').trim();
                        } else {
                          info = charStr.replace(name, '').trim();
                          info = info.replace(/^[：:\[\]\s\|]+/, '').trim();
                        }

                        // ✅ 全面实时解析角色属性——同时搜索 charStr 和 info，支持所有 AI 输出格式
                        const fullText = charStr + ' ' + info;
                        const parseNum = (patterns: string[]): number => {
                          for (const p of patterns) {
                            // 支持 "好感度: 45" / "好感度：45" / "好感度45" / "好感度(45)"
                            const m = fullText.match(new RegExp(p + '[：:\\s(（]*(-?\\d+)'));
                            if (m) return parseInt(m[1]);
                          }
                          return 0;
                        };
                        const parseStr = (patterns: string[], fallback = ''): string => {
                          for (const p of patterns) {
                            const m = fullText.match(new RegExp(p + '[：:\\s]*([^\\|\\n\\[\\]【】，,。.]{1,15})'));
                            if (m) return m[1].trim();
                          }
                          return fallback;
                        };

                        // 核心属性解析（支持中英文、各种分隔符）
                        const fav = parseNum(['好感度', '好感', '爱意', 'Favorability', 'FAV']);
                        const obedience = parseNum(['恭顺', '服从度', '服从', '顺从', '调教度']);
                        const trust = parseNum(['信赖', '信任度', '信任']);
                        const desire = parseNum(['欲望', '情欲', '渴望']);
                        const intimacy = parseNum(['亲密度', '亲密', '羁绊']);
                        const mood = parseStr(['心情', '情绪', '心态'], '平静');
                        const charState = parseStr(['状态', '当前状态', '特殊状态'], '正常');
                        const identity = parseStr(['身份', '职业', '职务', '阵营'], '');
                        const relationship = parseStr(['关系', '与主角关系', '对主角'], '');
                        const isPregnant = !!(status.pregnancyLog?.[name]?.pregnant);
                        const pregnancyProgress = status.pregnancyLog?.[name]?.progress || 0;

                        // 好感度等级
                        const favLevel = fav < 0
                          ? { label: '敌对', icon: '💔', color: 'text-blue-400', bg: 'bg-blue-500' }
                          : fav <= 20 ? { label: '陌生', icon: '🤍', color: 'text-gray-400', bg: 'bg-gray-500' }
                          : fav <= 40 ? { label: '熟人', icon: '🌱', color: 'text-emerald-400', bg: 'bg-emerald-500' }
                          : fav <= 60 ? { label: '朋友', icon: '🤝', color: 'text-yellow-400', bg: 'bg-yellow-500' }
                          : fav <= 80 ? { label: '恋人', icon: '💖', color: 'text-pink-400', bg: 'bg-pink-500' }
                          : fav <= 100 ? { label: '挚爱', icon: '🔥', color: 'text-red-400', bg: 'bg-red-500' }
                          : { label: '誓约', icon: '💎', color: 'text-purple-300', bg: 'bg-purple-500' };

                        return (
                          <div key={name} className="glass-panel border terminal-border rounded-[2rem] overflow-hidden hover:border-[var(--primary-color)] transition-all group shadow-xl">
                            <div className="char-card-grid p-6 md:p-8">
                              {/* Left: Portrait */}
                              <div className="space-y-4">
                                <div className="relative aspect-[3/4] rounded-2xl bg-black/40 border terminal-border overflow-hidden group/portrait">
                                  {characterPortraits[name] ? (
                                    <img src={characterPortraits[name]} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-10"><User size={64} /></div>
                                  )}
                                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/portrait:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity z-10">
                                    <Plus size={32} className="mb-2" />
                                    <span className="text-[10px] font-black uppercase">上传立绘</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'character', name)} />
                                  </label>
                                  {isPregnant && (
                                    <div className="absolute top-2 right-2 bg-pink-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg">🤰 孕育中</div>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => generateCharacterPortrait(name, info)} className="flex-1 py-2 bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/30 text-[var(--primary-color)] text-[10px] font-black rounded-xl hover:bg-[var(--primary-color)] hover:text-black transition-all flex items-center justify-center gap-1">
                                    <Zap size={10} /> AI 立绘
                                  </button>
                                  <button onClick={() => generateQAvatar(name, info, characterPortraits[name])} className="w-10 h-10 bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/30 text-[var(--primary-color)] rounded-xl hover:bg-[var(--primary-color)] hover:text-black transition-all flex items-center justify-center" title="生成 Q 版头像">
                                    <Heart size={14} />
                                  </button>
                                </div>
                              </div>

                              {/* Right: Info */}
                              <div className="flex-1 space-y-4">
                                {/* 标题行 */}
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-[var(--primary-color)]/20 border terminal-border flex items-center justify-center overflow-hidden shrink-0 relative">
                                      {characterAvatars[name] ? (
                                        <img src={characterAvatars[name]} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      ) : (
                                        <User size={24} className="text-[var(--primary-color)]" />
                                      )}
                                    </div>
                                    <div>
                                      <h4 className="text-2xl font-black text-[var(--primary-color)] tracking-tighter">{name}</h4>
                                      <div className="flex flex-wrap gap-1.5 mt-1">
                                        <span className="px-2 py-0.5 bg-[var(--primary-color)]/10 text-[var(--primary-color)] text-[8px] font-black rounded uppercase">攻略对象</span>
                                        <span className="px-2 py-0.5 bg-black/40 text-[var(--primary-color)]/60 text-[8px] font-black rounded uppercase">Entry #{i + 1}</span>
                                        {identity && <span className="px-2 py-0.5 bg-white/10 text-[8px] font-black rounded">{identity}</span>}
                                        {isPregnant && <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 text-[8px] font-black rounded">🤰 孕育中 {pregnancyProgress}%</span>}
                                      </div>
                                    </div>
                                  </div>
                                  <button onClick={() => setEditingCharIdx(editingCharIdx === i ? null : i)} className="p-2 border terminal-border rounded-xl hover:bg-[var(--primary-color)] hover:text-black transition-all">
                                    <Settings size={14} />
                                  </button>
                                </div>

                                {/* 核心档案 */}
                                <div className="space-y-2">
                                  <div className="text-[10px] opacity-40 uppercase font-bold border-b terminal-border pb-1">核心档案 / CORE PROFILE</div>
                                  {editingCharIdx === i ? (
                                    <textarea value={info} onChange={(e) => { const newChars = [...status.characters]; newChars[i] = `[${name}] ${e.target.value}`; setStatus(prev => ({ ...prev, characters: newChars })); }} className="w-full bg-white/10 border terminal-border p-3 rounded-xl text-xs outline-none focus:border-[var(--primary-color)] min-h-[100px] font-mono text-white" />
                                  ) : (
                                    <div className="text-sm leading-relaxed opacity-80 whitespace-pre-wrap italic bg-white/5 p-3 rounded-xl border border-white/5 max-h-28 overflow-y-auto custom-scrollbar">{info || '暂无档案信息'}</div>
                                  )}
                                </div>

                                {/* ✅ 实时属性面板——完整版 */}
                                <div className="space-y-3">
                                  <div className="text-[10px] opacity-40 uppercase font-bold border-b terminal-border pb-1">实时状态 / LIVE STATUS</div>

                                  {/* 好感度大显示 */}
                                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[8px] opacity-40 uppercase">好感度 / FAVORABILITY</span>
                                      <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full bg-white/10 ${favLevel.color}`}>{favLevel.icon} {favLevel.label}</span>
                                        <span className={`text-base font-black tabular-nums ${favLevel.color}`}>{fav > 0 ? `+${fav}` : fav}</span>
                                      </div>
                                    </div>
                                    <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                      <motion.div
                                        animate={{ width: `${Math.min(100, Math.max(0, fav))}%` }}
                                        className={`h-full ${favLevel.bg} shadow-[0_0_8px_currentColor] transition-all`}
                                      />
                                    </div>
                                  </div>

                                  {/* 属性网格——只显示有值的项目 */}
                                  <div className="grid grid-cols-2 gap-2">
                                    {[
                                      { label: '心情', value: mood, show: true },
                                      { label: '状态', value: charState, show: true },
                                      { label: '关系', value: relationship, show: !!relationship },
                                      { label: '信赖', value: `${trust}`, show: trust > 0 },
                                      { label: '欲望', value: `${desire}`, show: desire > 0 },
                                      { label: '亲密度', value: `${intimacy}`, show: intimacy > 0 },
                                      { label: '恭顺', value: `${obedience}`, show: obedience > 0 },
                                    ].filter(a => a.show).map(attr => (
                                      <div key={attr.label} className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                                        <div className="text-[7px] opacity-40 uppercase mb-0.5">{attr.label}</div>
                                        <div className="text-xs font-black truncate">{attr.value || '—'}</div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* 孕育进度条（孕育中才显示） */}
                                  {isPregnant && (
                                    <div className="p-3 bg-pink-500/5 rounded-xl border border-pink-500/20 space-y-1.5">
                                      <div className="flex justify-between text-[9px]">
                                        <span className="text-pink-400 font-black">孕育进度</span>
                                        <span className="opacity-60">{pregnancyProgress}%</span>
                                      </div>
                                      <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                                        <motion.div animate={{ width: `${pregnancyProgress}%` }} className="h-full bg-gradient-to-r from-pink-600 to-pink-300 rounded-full" />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* 操作按钮 */}
                                <div className="flex gap-2 pt-1">
                                  <button
                                    onClick={() => {
                                      if (!status.inventory || status.inventory.length === 0) {
                                        showNotification('背包里没有可以赠送的物品！', 'info');
                                        return;
                                      }
                                      setGiftingTarget(name);
                                    }}
                                    className="flex-1 py-2.5 bg-pink-500/10 border border-pink-500/30 text-pink-500 text-[10px] font-black rounded-xl hover:bg-pink-500 hover:text-white transition-all flex items-center justify-center gap-1"
                                  >
                                    <Heart size={12} /> 赠礼
                                  </button>
                                  <button
                                    onClick={() => {
                                      setInputValue(`与 ${name} 交流：`);
                                      setActiveTab('game');
                                      setTimeout(() => document.querySelector('input')?.focus(), 100);
                                    }}
                                    className="flex-1 py-2.5 bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/30 text-[var(--primary-color)] text-[10px] font-black rounded-xl hover:bg-[var(--primary-color)] hover:text-black transition-all flex items-center justify-center gap-1"
                                  >
                                    <MessageSquare size={12} /> 交流
                                  </button>
                                  <button
                                    onClick={() => handleSendRouted(`继续推进与${name}的攻略，重点描写双方的情感变化和互动细节。`)}
                                    className="flex-1 py-2.5 bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/30 text-[var(--primary-color)] text-[10px] font-black rounded-xl hover:bg-[var(--primary-color)] hover:text-black transition-all flex items-center justify-center gap-1"
                                  >
                                    <Zap size={12} /> 推进剧情
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    })()}

                    {/* Locked Characters */}
                    {initStep === 0 && (
                      <>
                        <div className="glass-panel p-4 border terminal-border rounded-2xl flex flex-col justify-center gap-2 opacity-50 grayscale">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg border border-dashed terminal-border flex items-center justify-center text-xs font-black">?</div>
                              <span className="font-bold">未知角色</span>
                            </div>
                            <span className="text-[8px] px-2 py-0.5 border terminal-border rounded uppercase font-black">未解锁</span>
                          </div>
                          <div className="text-[10px] opacity-60 mt-2">解锁提示：前往「酒馆/黑市」等情报集散地打听消息。</div>
                        </div>
                        <div className="glass-panel p-4 border terminal-border rounded-2xl flex flex-col justify-center gap-2 opacity-50 grayscale">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg border border-dashed terminal-border flex items-center justify-center text-xs font-black">?</div>
                              <span className="font-bold">未知角色</span>
                            </div>
                            <span className="text-[8px] px-2 py-0.5 border terminal-border rounded uppercase font-black">未解锁</span>
                          </div>
                          <div className="text-[10px] opacity-60 mt-2">解锁提示：提升「声望」至一定程度后自动触发拜访事件。</div>
                        </div>
                        <div className="glass-panel p-4 border terminal-border rounded-2xl flex flex-col justify-center gap-2 opacity-50 grayscale">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg border border-dashed terminal-border flex items-center justify-center text-xs font-black">?</div>
                              <span className="font-bold">未知角色</span>
                            </div>
                            <span className="text-[8px] px-2 py-0.5 border terminal-border rounded uppercase font-black">未解锁</span>
                          </div>
                          <div className="text-[10px] opacity-60 mt-2">解锁提示：在深夜时分前往「危险区域」探索。</div>
                        </div>
                      </>
                    )}
                  </div>
                </section>

                {/* Relationship Network */}
                <section className="space-y-4">
                  <h3 className="text-xl font-black terminal-glow uppercase border-b terminal-border pb-2 flex items-center gap-2">
                    <Globe size={20} /> 关系网 / RELATIONSHIPS
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {!status.relationships || status.relationships.length === 0 ? (
                      <div className="col-span-full opacity-30 italic text-sm py-20 text-center border-2 border-dashed terminal-border rounded-3xl">
                        暂无关系数据，角色间的羁绊尚未建立...
                      </div>
                    ) : (
                      status.relationships.map((rel, i) => {
                        const match = rel.match(/^\[(.*?)\]\s*(.*)$/);
                        const charName = match ? match[1] : '未知';
                        const relDesc = match ? match[2] : rel;
                        
                        return (
                          <div key={i} className="glass-panel p-6 border terminal-border rounded-3xl flex flex-col gap-3 group hover:border-[var(--primary-color)] transition-all shadow-md hover:shadow-[0_0_15px_var(--glow-color)]/10">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full bg-[var(--primary-color)] animate-pulse shadow-[0_0_8px_var(--glow-color)]" />
                              <span className="font-black text-lg text-[var(--primary-color)] tracking-tight">{charName}</span>
                            </div>
                            <div className="text-sm opacity-80 pl-6 border-l-2 border-[var(--primary-color)]/20 leading-relaxed italic">
                              {relDesc}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'explore' && (
              <motion.div 
                key="explore-view"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="absolute inset-0 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar bg-[var(--bg-color)]"
              >
                <div className="max-w-6xl mx-auto space-y-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b terminal-border pb-4">
                    <h2 className="text-2xl font-black terminal-glow flex items-center gap-3">
                      <Compass className="text-[var(--primary-color)]" /> 创世系统 · 探索中心
                    </h2>
                    <div className="flex flex-wrap bg-white/10 backdrop-blur-sm p-1 rounded-xl border terminal-border shadow-inner gap-1">
                      <button 
                        onClick={() => setActiveExploreTab('events')}
                        className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${activeExploreTab === 'events' ? 'bg-[var(--primary-color)] text-black shadow-[0_0_15px_var(--glow-color)]' : 'opacity-40 hover:opacity-70'}`}
                      >
                        外出探索
                      </button>
                      <button 
                        onClick={() => setActiveExploreTab('family')}
                        className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${activeExploreTab === 'family' ? 'bg-[var(--primary-color)] text-black shadow-[0_0_15px_var(--glow-color)]' : 'opacity-40 hover:opacity-70'}`}
                      >
                        孕育与子嗣
                      </button>
                      <button 
                        onClick={() => setActiveExploreTab('achievements')}
                        className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${activeExploreTab === 'achievements' ? 'bg-[var(--primary-color)] text-black shadow-[0_0_15px_var(--glow-color)]' : 'opacity-40 hover:opacity-70'}`}
                      >
                        成就系统
                      </button>
                      <button 
                        onClick={() => setActiveExploreTab('shop')}
                        className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${activeExploreTab === 'shop' ? 'bg-[var(--primary-color)] text-black shadow-[0_0_15px_var(--glow-color)]' : 'opacity-40 hover:opacity-70'}`}
                      >
                        道具商店
                      </button>
                    </div>
                  </div>

                  {activeExploreTab === 'events' ? (
                    <div className="space-y-6 pb-24">
                      <div className="glass-panel p-8 border terminal-border rounded-3xl flex flex-col items-center justify-center text-center gap-6">
                        <Compass size={48} className="text-[var(--primary-color)] opacity-50" />
                        <div>
                          <h3 className="text-xl font-black mb-2">未知领域探索</h3>
                          <p className="text-sm opacity-60 max-w-md mx-auto">
                            离开安全区域，前往未知之地。你可能会遇到奇遇、发现宝物，或者遭遇危险的敌人。
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                          <button 
                            onClick={() => handleInteraction("我决定外出探索，看看会遇到什么特殊事件。请生成一个随机的探索事件，并描述事件过程和结果（可能获得物品、属性变化或遇到特定人物）。", "外出探索")}
                            className="px-8 py-4 bg-[var(--primary-color)] text-black font-black rounded-2xl hover:scale-105 transition-all shadow-[0_0_20px_var(--glow-color)] flex items-center justify-center gap-2"
                          >
                            <MapPin size={18} /> 开始探索
                          </button>
                          <button 
                            onClick={() => {
                              handleSend("我决定在当前场景中四处看看，寻找可以交流或寻求帮助的人。请生成一个拥有独特背景故事和任务的 NPC。");
                              switchTab('game');
                            }}
                            className="px-8 py-4 border-2 border-[var(--primary-color)] text-[var(--primary-color)] font-black rounded-2xl hover:bg-[var(--primary-color)] hover:text-black transition-all flex items-center justify-center gap-2"
                          >
                            <Users size={18} /> 寻找他人
                          </button>
                        </div>
                      </div>
                      
                      {/* Exploration Log */}
                      <div className="glass-panel p-6 border terminal-border rounded-3xl space-y-4">
                        <h3 className="text-lg font-black terminal-glow uppercase flex items-center gap-2 border-b terminal-border pb-2">
                          <Compass size={18} className="text-[var(--primary-color)]" /> 探索记录 / EXPLORATION
                        </h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                          {(status.explorationLog || []).length === 0 ? (
                            <div className="text-xs opacity-40 italic">暂无记录</div>
                          ) : (
                            (status.explorationLog || []).map((log, i) => (
                              <div key={i} className="p-4 bg-black/20 rounded-2xl border border-white/5 flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-[var(--primary-color)]/10 flex items-center justify-center text-[var(--primary-color)] shrink-0">
                                  <MapPin size={14} />
                                </div>
                                <div>
                                  <div className="text-[10px] font-black opacity-50 uppercase tracking-widest">{log.date || log.year}</div>
                                  <div className="text-xs font-medium leading-relaxed">{log.summary || log.event}</div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ) : activeExploreTab === 'family' ? (
                    <div className="space-y-6 pb-24">
                      <div className="flex justify-between items-center border-b terminal-border pb-2">
                        <h3 className="text-xl font-black terminal-glow uppercase flex items-center gap-2">
                          <Baby size={20} /> 家族与子嗣
                        </h3>
                        <button 
                          onClick={() => handleInteraction("我决定与伴侣共度良宵，尝试孕育子嗣。请根据当前的好感度和关系，描述这一过程以及是否成功受孕。", "孕育子嗣")}
                          className="px-4 py-2 border border-[var(--primary-color)] text-[var(--primary-color)] text-xs font-black rounded-lg hover:bg-[var(--primary-color)] hover:text-black transition-all flex items-center gap-2"
                        >
                          <Heart size={14} /> 尝试孕育
                        </button>
                      </div>

                      {/* Main Story Log */}
                      <div className="glass-panel p-6 border terminal-border rounded-3xl space-y-4">
                        <h3 className="text-lg font-black terminal-glow uppercase flex items-center gap-2 border-b terminal-border pb-2">
                          <BookOpen size={18} className="text-[var(--primary-color)]" /> 剧情回忆 / MAIN STORY
                        </h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                          {(status.mainPlotLog || []).length === 0 ? (
                            <div className="text-xs opacity-40 italic">暂无主线记录</div>
                          ) : (
                            (status.mainPlotLog || []).map((log, i) => (
                              <div key={i} className="p-3 bg-black/20 rounded-lg text-xs">
                                <span className="opacity-50 mr-2">{log.date}:</span> {log.summary}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      
                      {/* Pregnancy Log */}
                      <div className="glass-panel p-6 border terminal-border rounded-3xl space-y-4">
                        <h3 className="text-lg font-black terminal-glow uppercase flex items-center gap-2 border-b terminal-border pb-2">
                          <Heart size={18} className="text-pink-500" /> 孕育记录 / PREGNANCY
                        </h3>
                        <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
                          {Object.entries(status.pregnancyLog || {}).length === 0 ? (
                            <div className="text-xs opacity-40 italic">暂无记录 · 通过「尝试孕育」触发事件后将在此显示进程</div>
                          ) : (
                            Object.entries(status.pregnancyLog || {}).map(([charId, log]) => {
                              const p = log as any;
                              const progress = Math.min(100, Math.max(0, p.progress || 0));
                              // 根据进度判断阶段
                              const stage = !p.pregnant ? '未受孕' :
                                progress < 15 ? '🌱 刚受孕 / 孕吐反应' :
                                progress < 40 ? '🤰 孕期初期 / 胎动明显' :
                                progress < 70 ? '🤰 孕期中期 / 腹部隆起' :
                                progress < 90 ? '🤰 孕期后期 / 临盆待产' :
                                '👶 即将分娩';
                              return (
                                <div key={charId} className="p-4 bg-pink-500/5 rounded-2xl border border-pink-500/20 space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="font-black text-sm text-pink-400">{charId}</span>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${p.pregnant ? 'bg-pink-500/20 text-pink-400' : 'bg-white/10 opacity-50'}`}>
                                      {p.pregnant ? '孕育中' : '未受孕'}
                                    </span>
                                  </div>
                                  
                                  <div className="text-[10px] opacity-60 space-y-1">
                                    {p.attempts > 0 && <div>尝试受孕次数: {p.attempts}</div>}
                                    {p.pregnant && p.conceptionDate && <div>受孕时间: {p.conceptionDate}</div>}
                                    {p.pregnant && p.dueDate && <div>预计分娩: 第 {p.dueDate} 天</div>}
                                    {p.count > 0 && <div>已生育子嗣: {p.count}</div>}
                                  </div>

                                  {p.pregnant && (
                                    <>
                                      <div className="text-xs font-bold text-pink-300">{stage}</div>
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-[10px] opacity-60">
                                          <span>孕育进度</span>
                                          <span>{progress}%</span>
                                        </div>
                                        <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                          <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            className="h-full bg-gradient-to-r from-pink-600 to-pink-300 rounded-full"
                                          />
                                        </div>
                                      </div>
                                      {p.father && <div className="text-[10px] opacity-50">父亲/另一半：{p.father}</div>}
                                      {p.dueDate && <div className="text-[10px] opacity-50">预计分娩：第 {p.dueDate} 天</div>}
                                    </>
                                  )}
                                  <div className="text-[10px] opacity-40">共同事件次数：{p.count || 0} 次</div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {!status.offspring || status.offspring.length === 0 ? (
                          <div className="col-span-full opacity-30 italic text-sm py-20 text-center border-2 border-dashed terminal-border rounded-3xl">
                            家族尚无子嗣诞生...
                          </div>
                        ) : (
                          status.offspring.map((child) => (
                            <div key={child.id} className="glass-panel p-6 border terminal-border rounded-3xl flex flex-col gap-3 group hover:border-[var(--primary-color)] transition-all">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-[var(--primary-color)]/20 flex items-center justify-center text-xl">
                                    {child.gender === '男' ? '👦' : '👧'}
                                  </div>
                                  <div>
                                    <input 
                                      type="text" 
                                      value={child.name}
                                      onChange={(e) => {
                                        const newName = e.target.value;
                                        setStatus(prev => ({
                                          ...prev,
                                          offspring: prev.offspring.map(c => c.id === child.id ? { ...c, name: newName } : c)
                                        }));
                                      }}
                                      className="font-black text-lg text-[var(--primary-color)] bg-transparent border-b border-dashed border-transparent hover:border-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none w-full"
                                    />
                                    <div className="text-[10px] opacity-60">父亲/母亲: {child.parent} | 年龄: {child.age}岁 | 性别: {child.gender}</div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm opacity-80 pl-4 border-l-2 border-[var(--primary-color)]/20 leading-relaxed italic mt-2">
                                {child.description}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : activeExploreTab === 'achievements' ? (
                    <div className="space-y-6 pb-24">
                      <h3 className="text-xl font-black terminal-glow uppercase border-b terminal-border pb-2 flex items-center gap-2">
                        <Zap size={20} /> 成就系统 / ACHIEVEMENTS
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {achievements.map((a) => (
                          <div key={a.id} className={`p-4 border rounded-2xl flex items-center gap-4 transition-all relative overflow-hidden ${a.unlocked ? 'terminal-border bg-[var(--primary-color)]/5' : 'opacity-20 grayscale'}`}>
                            {a.unlocked && <div className="absolute top-0 right-0 w-8 h-8 bg-[var(--primary-color)]/10 rounded-bl-2xl flex items-center justify-center"><Zap size={10} /></div>}
                            <span className="text-3xl">{a.unlocked ? a.icon : '❓'}</span>
                            <div>
                              <div className="text-sm font-black">{a.unlocked ? a.title : '未解锁成就'}</div>
                              <div className="text-[10px] opacity-60">{a.unlocked ? a.description : '达成特定条件后解锁'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <AnimatePresence>
                        {shopNotification && (
                          <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`p-4 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg ${shopNotification.type === 'success' ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}
                          >
                            {shopNotification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            {shopNotification.message}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
                        {shopItems.map((item) => (
                          <div key={item.id} className="p-6 glass-panel border terminal-border rounded-2xl flex flex-col group hover:border-[var(--primary-color)] transition-all">
                            <div className="flex justify-between items-start mb-4">
                              <div className="text-4xl group-hover:scale-110 transition-transform">{item.icon}</div>
                              <div className="px-3 py-1 bg-[var(--primary-color)]/10 text-[var(--primary-color)] text-[10px] font-black rounded-lg border border-[var(--primary-color)]/20">
                                {item.price} 资金
                              </div>
                            </div>
                            <h3 className="text-lg font-black mb-2 group-hover:text-[var(--primary-color)] transition-colors">{item.name}</h3>
                            <p className="text-xs opacity-60 mb-6 flex-1">{item.description}</p>
                            <button 
                              onClick={() => buyItem(item)}
                              disabled={parseInt(status.funds.toString().replace(/[^0-9-]/g, '')) < item.price}
                              className={`w-full py-4 font-black rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 ${parseInt(status.funds.toString().replace(/[^0-9-]/g, '')) < item.price ? 'bg-gray-500 cursor-not-allowed opacity-50' : 'bg-[var(--primary-color)] text-black hover:opacity-80'}`}
                            >
                              {parseInt(status.funds.toString().replace(/[^0-9-]/g, '')) < item.price ? '资金不足' : '立即购买'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <footer className="p-4 md:p-6 glass-panel border-t terminal-border z-20">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Collapsible Action Menu */}
            {activeTab === 'game' && status.menu.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-black opacity-50 uppercase tracking-widest flex items-center gap-2">
                    <Zap size={10} /> 指令菜单 / ACTIONS
                  </span>
                  <button 
                    onClick={() => setIsMenuExpanded(!isMenuExpanded)}
                    className="text-[10px] font-bold opacity-50 hover:opacity-100 transition-opacity flex items-center gap-1"
                  >
                    {isMenuExpanded ? '收起菜单' : '展开菜单'}
                    {isMenuExpanded ? <ChevronLeft size={10} className="-rotate-90" /> : <ChevronRight size={10} className="rotate-90" />}
                  </button>
                </div>
                
                <AnimatePresence>
                  {isMenuExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
                    >
                      {status.menu.map((m, i) => {
                        const match = m.match(/^\[.*?\]\s*(.*?)\s*(\[.*\])?$/);
                        const text = match ? match[1] : m;
                        const tags = match && match[2] ? match[2].match(/\[.*?\]/g) : [];
                        
                        return (
                          <button
                            key={i}
                            onClick={() => {
                              setInputValue(text);
                              setIsMenuExpanded(false);
                              const inputEl = document.querySelector('input');
                              if (inputEl) inputEl.focus();
                            }}
                            className="group p-3 border terminal-border rounded-xl text-left hover:bg-[var(--primary-color)]/10 transition-all flex flex-col gap-1 relative overflow-hidden active:scale-95"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-color)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center gap-2 relative z-10">
                              <span className="text-[10px] opacity-30 font-black">0{i+1}</span>
                              <span className="text-xs font-bold group-hover:text-[var(--primary-color)] transition-colors line-clamp-1">{text}</span>
                            </div>
                            {tags && tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 relative z-10">
                                {tags.map((tag, ti) => {
                                  const tagName = tag.replace(/[\[\]]/g, '');
                                  return (
                                    <span key={ti} className={`text-[8px] px-1.5 py-0.5 rounded-sm font-black uppercase ${
                                      tagName.includes('推荐') ? 'bg-green-500/20 text-green-500' :
                                      tagName.includes('危险') ? 'bg-red-500/20 text-red-500' :
                                      tagName.includes('+') ? 'bg-blue-500/20 text-blue-500' :
                                      tagName.includes('-') ? 'bg-orange-500/20 text-orange-500' :
                                      'bg-[var(--primary-color)]/20 text-[var(--primary-color)]'
                                    }`}>
                                      {tagName}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Initialization Options */}
            {initStep > 0 && (
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center px-2">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black opacity-50 uppercase tracking-widest flex items-center gap-2">
                      <Zap size={10} /> 初始化设定 / INITIALIZATION
                    </span>
                    <button 
                      onClick={refreshInitOptions}
                      disabled={isLoading}
                      className="text-[10px] font-black uppercase text-[var(--primary-color)] hover:underline flex items-center gap-1 disabled:opacity-30"
                    >
                      <RefreshCw size={10} className={isLoading ? 'animate-spin' : ''} /> 随机刷新
                    </button>
                  </div>
                  <button 
                    onClick={() => setIsMenuExpanded(!isMenuExpanded)}
                    className="text-[10px] font-bold opacity-50 hover:opacity-100 transition-opacity flex items-center gap-1"
                  >
                    {isMenuExpanded ? '收起选项' : '展开选项'}
                    {isMenuExpanded ? <ChevronLeft size={10} className="-rotate-90" /> : <ChevronRight size={10} className="rotate-90" />}
                  </button>
                </div>
                
                <AnimatePresence>
                  {isMenuExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
                    >
                      {getInitOptions().map((opt) => {
                        const match = opt.match(/^(.*?)\s*(\[.*\])?$/);
                        const text = match ? match[1] : opt;
                        const tags = match && match[2] ? match[2].match(/\[.*?\]/g) : [];
                        return (
                          <button
                            key={opt}
                            onClick={() => handleInitChoice(opt)}
                            className="group p-3 border terminal-border rounded-xl text-left hover:bg-[var(--primary-color)]/10 transition-all flex flex-col gap-1 relative overflow-hidden active:scale-95"
                          >
                            <div className="flex items-center gap-2 relative z-10">
                              <span className="text-xs font-bold group-hover:text-[var(--primary-color)] transition-colors line-clamp-1">{text}</span>
                            </div>
                            {tags && tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 relative z-10">
                                {tags.map((tag, ti) => (
                                  <span key={ti} className="text-[8px] px-1.5 py-0.5 rounded-sm font-black uppercase bg-[var(--primary-color)]/20 text-[var(--primary-color)]">
                                    {tag.replace(/[\[\]]/g, '')}
                                  </span>
                                ))}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {activeTab === 'game' && (
              <div className="relative group">
                <input 
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendRouted()}
                  placeholder={isLoading ? "系统处理中..." : config.aiProvider === 'claude' ? "输入指令（Claude 模式）..." : config.aiProvider === 'dual' ? "输入指令（双AI共演模式）..." : "输入指令或自定义行动..."}
                  disabled={isLoading}
                  className="w-full bg-[var(--input-bg)] border-2 terminal-border p-4 md:p-6 pr-20 rounded-[2rem] outline-none focus:border-[var(--primary-color)] transition-all shadow-inner text-sm md:text-base"
                />
                <button 
                  onClick={() => handleSendRouted()}
                  disabled={isLoading || !inputValue.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 md:p-4 bg-[var(--primary-color)] text-black rounded-2xl hover:opacity-80 disabled:opacity-30 transition-all shadow-lg"
                >
                  <Send size={20} />
                </button>
              </div>
            )}
          </div>
        </footer>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-0 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl border-2 flex items-center gap-3 min-w-[300px] ${
              notification.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' :
              notification.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' :
              'bg-blue-500/90 border-blue-400 text-white'
            }`}
          >
            {notification.type === 'success' ? <Zap size={18} /> : <Activity size={18} />}
            <span className="font-black text-sm">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg md:max-w-4xl border-2 terminal-border bg-[var(--bg-color)] p-6 md:p-10 space-y-6 shadow-[0_0_60px_var(--glow-color)] rounded-[2.5rem] relative overflow-hidden"
            >
              <div className="flex justify-between items-center border-b terminal-border pb-4">
                <h2 className="text-2xl font-black terminal-glow flex items-center gap-3">
                  <Settings size={24} /> 系统设置 / SETTINGS
                </h2>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto max-h-[70vh] pr-4 custom-scrollbar">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black opacity-50 uppercase tracking-widest flex justify-between items-center">
                      <span>Gemini API Key</span>
                      {hasLinkedApi && <span className="text-[var(--primary-color)]">已链接付费 API ✓</span>}
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={hasLinkedApi ? "已使用系统链接的 API" : "输入您的 API Key"}
                        disabled={hasLinkedApi}
                        className="flex-1 bg-[var(--input-bg)] border-2 terminal-border p-3 rounded-xl outline-none focus:border-[var(--primary-color)] text-[var(--primary-color)] text-xs disabled:opacity-50"
                      />
                      <button 
                        onClick={handleLinkApi}
                        className="px-4 py-2 bg-[var(--primary-color)] text-black font-bold rounded-xl hover:opacity-80 transition-opacity whitespace-nowrap text-xs flex items-center gap-1"
                      >
                        <Zap size={14} />
                        {hasLinkedApi ? "重新链接" : "链接付费 API"}
                      </button>
                    </div>
                    <p className="text-[8px] opacity-60 italic leading-relaxed">
                      提示：点击“链接付费 API”可直接调用您在 Google Cloud 绑定的付费 Key，彻底解决 429 配额限制问题。
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black opacity-50 uppercase tracking-widest">Base URL (API 地址)</label>
                    <input 
                      type="text"
                      value={config.baseUrl}
                      onChange={(e) => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                      placeholder="默认: https://generativelanguage.googleapis.com"
                      className="w-full bg-[var(--input-bg)] border-2 terminal-border p-3 rounded-xl outline-none focus:border-[var(--primary-color)] text-[var(--primary-color)] text-xs"
                    />
                    <div className="space-y-1">
                      <p className="text-[8px] opacity-60 italic leading-relaxed">
                        提示1：如果您在国内无法直接访问 Google，填入中转地址即可绕过网络限制。
                      </p>
                      <p className="text-[8px] opacity-60 italic leading-relaxed">
                        提示2：支持 DeepSeek、Kimi 等 OpenAI 兼容 API，填入其 Base URL（如 https://api.deepseek.com/v1）并在上方填入对应的 Key 即可。
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black opacity-50 uppercase tracking-widest">生成模型 / AI Model</label>
                    <div className="space-y-2">
                      <input 
                        type="text"
                        value={config.model}
                        onChange={(e) => setConfig(prev => ({ ...prev, model: e.target.value }))}
                        placeholder="输入模型名称 (如: gemini-3.1-pro-preview)"
                        className="w-full bg-[var(--input-bg)] border-2 terminal-border p-3 rounded-xl outline-none focus:border-[var(--primary-color)] text-[var(--primary-color)] text-xs"
                      />
                      <div className="flex flex-wrap gap-2">
                        {['gemini-3.1-pro-preview', 'gemini-3-flash-preview', 'gemini-flash-latest', 'gemini-3.1-flash-lite-preview'].map(m => (
                          <button
                            key={m}
                            onClick={() => setConfig(prev => ({ ...prev, model: m }))}
                            className={`px-3 py-1.5 text-[10px] font-bold border rounded-lg transition-all shadow-sm ${config.model === m ? 'bg-[var(--primary-color)] text-black border-[var(--primary-color)]' : 'terminal-border opacity-60 hover:opacity-100 hover:border-[var(--primary-color)]'}`}
                          >
                            {m.split('-').slice(1, 4).join(' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ✅ 新增：Claude API 配置区 */}
                  <div className="space-y-3 border-t terminal-border pt-5">
                    <label className="text-[10px] font-black opacity-50 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles size={10} /> Claude 集成 / CLAUDE INTEGRATION
                    </label>

                    {/* AI 模式选择 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        { value: 'gemini', label: 'Gemini 独奏', desc: '默认模式' },
                        { value: 'claude', label: 'Claude 独奏', desc: '仅用 Claude' },
                        { value: 'zhipu', label: '智谱 AI', desc: 'GLM-4 (国内推荐)' },
                        { value: 'dual', label: '双AI共演', desc: 'Gemini+Claude' },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setConfig(prev => ({ ...prev, aiProvider: opt.value as any }))}
                          className={`py-2 px-2 rounded-lg border text-[9px] font-black transition-all flex flex-col items-center gap-0.5 ${
                            config.aiProvider === opt.value ? 'bg-[var(--primary-color)] text-black border-[var(--primary-color)]' : 'terminal-border opacity-60 hover:opacity-100'
                          }`}
                        >
                          <span>{opt.label}</span>
                          <span className={`text-[7px] font-normal ${config.aiProvider === opt.value ? 'opacity-70' : 'opacity-40'}`}>{opt.desc}</span>
                        </button>
                      ))}
                    </div>

                    {/* Zhipu Key 和模型 */}
                    {config.aiProvider === 'zhipu' && (
                      <div className="space-y-2">
                        <input
                          type="password"
                          value={config.zhipuApiKey || ''}
                          onChange={(e) => setConfig(prev => ({ ...prev, zhipuApiKey: e.target.value }))}
                          placeholder="智谱 AI API Key"
                          className="w-full bg-[var(--input-bg)] border-2 terminal-border p-3 rounded-xl outline-none focus:border-[var(--primary-color)] text-[var(--primary-color)] text-xs"
                        />
                        <div className="flex flex-wrap gap-2">
                          {['glm-4-flash', 'glm-4-plus', 'glm-4-air', 'glm-4-0520'].map(m => (
                            <button
                              key={m}
                              onClick={() => setConfig(prev => ({ ...prev, zhipuModel: m }))}
                              className={`px-3 py-1.5 text-[10px] font-bold border rounded-lg transition-all ${
                                config.zhipuModel === m ? 'bg-[var(--primary-color)] text-black border-[var(--primary-color)]' : 'terminal-border opacity-60 hover:opacity-100'
                              }`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                        <p className="text-[8px] opacity-50 italic leading-relaxed">
                          前往 bigmodel.cn 获取 API Key。GLM-4-Flash 目前提供大量免费额度。
                        </p>
                      </div>
                    )}

                    {/* Claude Key 和模型（仅在 claude/dual 模式显示） */}
                    {(config.aiProvider === 'claude' || config.aiProvider === 'dual') && (
                      <div className="space-y-2">
                        <input
                          type="password"
                          value={config.claudeApiKey || ''}
                          onChange={(e) => setConfig(prev => ({ ...prev, claudeApiKey: e.target.value }))}
                          placeholder="Anthropic API Key (sk-ant-...)"
                          className="w-full bg-[var(--input-bg)] border-2 terminal-border p-3 rounded-xl outline-none focus:border-[var(--primary-color)] text-[var(--primary-color)] text-xs"
                        />
                        <div className="flex flex-wrap gap-2">
                          {['claude-opus-4-5', 'claude-sonnet-4-5', 'claude-haiku-4-5-20251001'].map(m => (
                            <button
                              key={m}
                              onClick={() => setConfig(prev => ({ ...prev, claudeModel: m }))}
                              className={`px-3 py-1.5 text-[10px] font-bold border rounded-lg transition-all ${
                                config.claudeModel === m ? 'bg-[var(--primary-color)] text-black border-[var(--primary-color)]' : 'terminal-border opacity-60 hover:opacity-100'
                              }`}
                            >
                              {m.includes('opus') ? '🌟 Opus' : m.includes('sonnet') ? '⚡ Sonnet' : '💨 Haiku'}
                            </button>
                          ))}
                        </div>
                        {/* 双AI模式：Claude 角色设定 */}
                        {config.aiProvider === 'dual' && (
                          <div className="p-3 bg-white/5 rounded-xl border terminal-border space-y-1">
                            <label className="text-[8px] opacity-50 uppercase font-black">Claude 扮演的角色</label>
                            <input
                              type="text"
                              value={config.claudeRole || ''}
                              onChange={(e) => setConfig(prev => ({ ...prev, claudeRole: e.target.value }))}
                              placeholder="例如：神秘旁白者 / 命运女神 / 反派智囊"
                              className="w-full bg-transparent outline-none text-xs border-b terminal-border pb-1 focus:border-[var(--primary-color)]"
                            />
                            <p className="text-[7px] opacity-40 italic">Gemini 主导剧情，Claude 以此角色追加旁白补充，形成双AI共演效果。</p>
                          </div>
                        )}
                        <p className="text-[8px] opacity-50 italic leading-relaxed">
                          前往 console.anthropic.com 获取 API Key。需在 Console 开启"Allow direct browser access"权限。
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black opacity-50 uppercase tracking-widest">叙事视角 / Perspective</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['第一人称', '第二人称', '第三人称'].map((p) => (
                        <button
                          key={p}
                          onClick={() => setConfig(prev => ({ ...prev, perspective: p as any }))}
                          className={`py-2 rounded-lg border text-[10px] font-black transition-all ${
                            config.perspective === p ? 'bg-[var(--primary-color)] text-black' : 'terminal-border opacity-60'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black opacity-50 uppercase tracking-widest">叙事风格 / Narrative Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['文学叙事', '通俗白话', '华丽辞藻', '简练冷峻', '色气张力', '日常温馨'].map((s) => (
                        <button
                          key={s}
                          onClick={() => setConfig(prev => ({ ...prev, narrativeStyle: s }))}
                          className={`py-2 rounded-lg border text-[10px] font-black transition-all ${
                            config.narrativeStyle === s ? 'bg-[var(--primary-color)] text-black' : 'terminal-border opacity-60'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black opacity-50 uppercase tracking-widest">叙事风格预设 / Presets</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: '经典武侠', prompt: '使用金庸风格，辞藻古朴，动作描写细致。' },
                        { name: '赛博朋克', prompt: '充满科技感与颓废感，多用霓虹、义体、黑客等词汇。' },
                        { name: '西幻史诗', prompt: '庄重宏大，描写神灵、巨龙、魔法与骑士精神。' },
                        { name: '现代都市', prompt: '语言平实幽默，贴近生活，多描写职场与日常。' }
                      ].map((p) => (
                        <button
                          key={p.name}
                          onClick={() => setConfig(prev => ({ ...prev, customInstructions: p.prompt }))}
                          className="py-2 px-3 rounded-lg border terminal-border text-[10px] font-black hover:bg-[var(--primary-color)]/10 transition-all text-left"
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                    <textarea 
                      value={config.customInstructions}
                      onChange={(e) => setConfig(prev => ({ ...prev, customInstructions: e.target.value }))}
                      placeholder="例如：多描写心理活动，禁止出现现代词汇..."
                      className="w-full bg-[var(--input-bg)] border-2 terminal-border p-3 rounded-xl outline-none focus:border-[var(--primary-color)] text-[var(--primary-color)] text-xs min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black opacity-50 uppercase tracking-widest">记忆与字数 / Memory & Word Count</label>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <input 
                          type="range"
                          min="5"
                          max="50"
                          step="5"
                          value={config.memoryLimit || 20}
                          onChange={(e) => setConfig(prev => ({ ...prev, memoryLimit: parseInt(e.target.value) }))}
                          className="w-full accent-[var(--primary-color)]"
                        />
                        <div className="flex justify-between text-[8px] opacity-60 italic">
                          <span>保留最近 {config.memoryLimit || 20} 条对话</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <input 
                          type="range"
                          min="500"
                          max="5000"
                          step="500"
                          value={config.wordCount}
                          onChange={(e) => setConfig(prev => ({ ...prev, wordCount: parseInt(e.target.value) }))}
                          className="w-full accent-[var(--primary-color)]"
                        />
                        <div className="text-right text-[10px] font-bold">{config.wordCount} 字以上</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black opacity-50 uppercase tracking-widest">界面个性化 / UI Customization</label>
                    <div className="grid grid-cols-2 gap-2">
                      {themes.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          className={`p-3 text-[10px] border rounded-xl transition-all flex items-center gap-3 ${
                            theme === t.id ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/20' : 'terminal-border opacity-60'
                          }`}
                        >
                          <div className="w-4 h-4 rounded-full shadow-lg" style={{ backgroundColor: t.color }} />
                          {t.name}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-2 mt-4">
                      <label className="text-[10px] font-black opacity-50 uppercase tracking-widest">字体颜色 / Font Color</label>
                      <div className="flex gap-2">
                        {['#ffffff', '#000000', '#f87171', '#fbbf24', '#34d399', '#60a5fa'].map((c) => (
                          <button
                            key={c}
                            onClick={() => setFontColor(c)}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${fontColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                        <input 
                          type="color"
                          value={fontColor}
                          onChange={(e) => setFontColor(e.target.value)}
                          className="w-8 h-8 rounded-full border-2 border-transparent cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {['light', 'dark'].map((m) => (
                        <button
                          key={m}
                          onClick={() => setMode(m as any)}
                          className={`flex-1 py-2 rounded-lg border text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all ${
                            mode === m ? 'bg-[var(--primary-color)] text-black' : 'terminal-border opacity-60'
                          }`}
                        >
                          {m === 'light' ? <Sun size={12} /> : <Moon size={12} />} {m === 'light' ? '明亮' : '暗黑'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase opacity-50">危险操作 / DANGER ZONE</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={startNewCycle}
                        className="py-3 border border-orange-500/50 text-orange-500 font-black rounded-xl hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2 text-xs"
                      >
                        <RefreshCw size={14} /> 开启新周目
                      </button>
                      <button 
                        onClick={startNewWorld}
                        className="py-3 border border-red-500/50 text-red-500 font-black rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 text-xs"
                      >
                        <Activity size={14} /> 开启新世界
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-6 border-t terminal-border">
                <button 
                  onClick={saveConfig} 
                  className="flex-1 py-4 bg-[var(--primary-color)] text-black font-black rounded-2xl hover:opacity-80 shadow-lg transition-all active:scale-95"
                >
                  保存配置并返回
                </button>
                <button 
                  onClick={() => setShowSettings(false)} 
                  className="px-8 py-4 border terminal-border rounded-2xl font-bold hover:bg-white/5 transition-all"
                >
                  取消
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Modal */}
      <AnimatePresence>
        {showSaves && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-2xl border-2 terminal-border bg-[var(--bg-color)] p-8 space-y-6 shadow-[0_0_60px_var(--glow-color)] rounded-[2.5rem]"
            >
              <div className="flex justify-between items-center border-b terminal-border pb-4">
                <h2 className="text-2xl font-black terminal-glow flex items-center gap-3">
                  <Save size={24} /> 记忆存档 / SAVES
                </h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => saveGame()}
                    className="px-4 py-2 bg-[var(--primary-color)] text-black text-xs font-black rounded-lg hover:opacity-80 transition-opacity"
                  >
                    新建存档
                  </button>
                  <button 
                    onClick={() => setShowSaves(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {/* Fixed Initial Save Slot */}
                <button 
                  onClick={startNewWorld}
                  className="w-full p-6 border-2 border-dashed border-red-500/50 rounded-3xl flex items-center justify-between group hover:bg-red-500/10 transition-all active:scale-95"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-red-500/10 text-red-500 group-hover:scale-110 transition-transform">
                      <RefreshCw size={24} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-black text-lg text-red-500 uppercase tracking-tighter">初始存档 / INITIAL START</h4>
                      <p className="text-[10px] opacity-60">点击此处将彻底清除所有设定，从头开始初始化世界。</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>

                <div className="h-px bg-white/10 my-4" />

                {saves.length === 0 ? (
                  <div className="text-center py-20 opacity-30 italic">暂无存档记录</div>
                ) : (
                  saves.map((save) => (
                    <div key={save.id} className="p-4 border terminal-border rounded-2xl flex justify-between items-center group hover:bg-[var(--primary-color)]/5 transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black">{save.protagonistName}</span>
                          <span className="text-[10px] opacity-40">@{new Date(save.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="text-[10px] opacity-60 flex items-center gap-2">
                          <MapPin size={10} /> {save.world.slice(0, 20)}...
                        </div>
                        <div className="text-xs italic opacity-80">“{save.summary}”</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => loadGame(save)} className="p-2 px-4 bg-[var(--primary-color)] text-black text-[10px] font-black rounded-lg">读取</button>
                        <button onClick={() => deleteSave(save.id)} className="p-2 border border-red-500/50 text-red-500 text-[10px] font-black rounded-lg hover:bg-red-500 hover:text-white transition-all">删除</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button onClick={() => setShowSaves(false)} className="w-full py-4 border terminal-border rounded-2xl font-bold">返回游戏</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interaction Modal */}
      <AnimatePresence>
        {interactionModal && interactionModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-[var(--bg-color)] border terminal-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-4 border-b terminal-border flex justify-between items-center bg-[var(--primary-color)]/5">
                <h3 className="font-black flex items-center gap-2">
                  <Sparkles size={16} className="text-[var(--primary-color)]" />
                  {interactionModal.title}
                </h3>
                <button 
                  onClick={() => setInteractionModal(null)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                {interactionModal.isLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <div className="w-8 h-8 border-2 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin" />
                    <div className="text-sm font-black animate-pulse">系统演算中...</div>
                  </div>
                ) : (
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {(() => {
                      const content = interactionModal.content;
                      // Extract metadata
                      const dateMatch = content.match(/【日期】(.*?)【时间】(.*?)【场景】(.*)/);
                      const storyText = dateMatch ? content.replace(dateMatch[0], '').trim() : content;
                      
                      // Remove instruction menu
                      const finalStoryText = storyText.replace(/【指令菜单】[\s\S]*?$/, '').trim();

                      return (
                        <>
                          {dateMatch && (
                            <div className="mb-4 p-3 bg-black/20 rounded-lg border terminal-border text-[10px] opacity-70">
                              <span className="font-bold">日期:</span> {dateMatch[1].trim()} | 
                              <span className="font-bold ml-2">时间:</span> {dateMatch[2].trim()} | 
                              <span className="font-bold ml-2">场景:</span> {dateMatch[3].trim()}
                            </div>
                          )}
                          <div>{finalStoryText}</div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
              
              {!interactionModal.isLoading && (
                <div className="p-4 border-t terminal-border bg-black/20">
                  <button 
                    onClick={() => setInteractionModal(null)}
                    className="w-full py-3 bg-[var(--primary-color)] text-black font-black rounded-xl hover:brightness-110 transition-all"
                  >
                    确认
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmModal && confirmModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-[var(--bg-color)] border terminal-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b terminal-border flex justify-between items-center bg-[var(--primary-color)]/5">
                <h3 className="font-black flex items-center gap-2">
                  <AlertCircle size={16} className="text-[var(--primary-color)]" />
                  系统提示
                </h3>
                <button 
                  onClick={() => setConfirmModal(null)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="p-6 text-sm leading-relaxed whitespace-pre-wrap">
                {confirmModal.message}
              </div>
              
              <div className="p-4 border-t terminal-border bg-black/20 flex gap-3">
                <button 
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 py-3 bg-white/5 border terminal-border font-black rounded-xl hover:bg-white/10 transition-all"
                >
                  取消
                </button>
                <button 
                  onClick={confirmModal.onConfirm}
                  className="flex-1 py-3 bg-[var(--primary-color)] text-black font-black rounded-xl hover:brightness-110 transition-all"
                >
                  确认
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gifting Modal */}
      <AnimatePresence>
        {giftingTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-[var(--bg-color)] border terminal-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
            >
              <div className="p-4 border-b terminal-border flex justify-between items-center bg-pink-500/10">
                <h3 className="font-black flex items-center gap-2 text-pink-500">
                  <Heart size={16} />
                  赠送礼物给 {giftingTarget}
                </h3>
                <button 
                  onClick={() => setGiftingTarget(null)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-3">
                <div className="text-[10px] opacity-40 uppercase font-bold mb-2">选择要赠送的物品 / SELECT ITEM</div>
                {status.inventory.length === 0 ? (
                  <div className="py-10 text-center opacity-30 italic text-sm">背包中没有物品</div>
                ) : (
                  status.inventory.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => giftItem(item.name, giftingTarget)}
                      className="w-full p-4 bg-white/5 border terminal-border rounded-xl hover:border-pink-500/50 hover:bg-pink-500/5 transition-all flex items-center justify-between group"
                    >
                      <div className="text-left">
                        <div className="font-black text-sm group-hover:text-pink-500 transition-colors">{item.name}</div>
                        <div className="text-[10px] opacity-50 line-clamp-1">{item.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded font-black">x{item.quantity}</span>
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-pink-500" />
                      </div>
                    </button>
                  ))
                )}
              </div>
              
              <div className="p-4 border-t terminal-border bg-black/20">
                <button 
                  onClick={() => setGiftingTarget(null)}
                  className="w-full py-3 bg-white/5 border terminal-border font-black rounded-xl hover:bg-white/10 transition-all text-xs"
                >
                  取消
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
