// services/SaveService.js
import GameState from '../models/GameState.js';

class SaveService {
  constructor(eventBus, serviceLocator) {
    this.eventBus = eventBus;
    this.locator = serviceLocator;

    this.VERSION = '1.0';
    this.SLOT_COUNT = 6;
    this.STORAGE_PREFIX = 'llm_rpg_save_';
    this.currentSlot = null;

    // auto-save timers
    this._debounceTimer = null;
    this._throttleTimer = null;
    this._throttleLock = false;

    // bind methods
    this.init = this.init.bind(this);
    this.enableAutoSave = this.enableAutoSave.bind(this);
    this.disableAutoSave = this.disableAutoSave.bind(this);
    this.makeSnapshot = this.makeSnapshot.bind(this);
    this.applySnapshot = this.applySnapshot.bind(this);
    this.saveToSlot = this.saveToSlot.bind(this);
    this.loadFromSlot = this.loadFromSlot.bind(this);
    this.deleteSlot = this.deleteSlot.bind(this);
    this.listSaves = this.listSaves.bind(this);
    this.getLatestSlot = this.getLatestSlot.bind(this);
    this.exportSlot = this.exportSlot.bind(this);
    this.importToSlot = this.importToSlot.bind(this);
    this.startNewGame = this.startNewGame.bind(this);
    this._autoSave = this._autoSave.bind(this);
  }

  // Initialization: set version and ensure storage availability
  init() {
    try {
      if (typeof localStorage === 'undefined') {
        console.warn('[SaveService] localStorage not available');
        return;
      }
      const verKey = `${this.STORAGE_PREFIX}version`;
      const existing = localStorage.getItem(verKey);
      if (!existing) {
        localStorage.setItem(verKey, this.VERSION);
      }

      // restore last slot
      const lastSlotStr = localStorage.getItem(`${this.STORAGE_PREFIX}last_slot`);
      if (lastSlotStr !== null) {
        const idx = parseInt(lastSlotStr, 10);
        if (!Number.isNaN(idx) && idx >= 0 && idx < this.SLOT_COUNT) {
          this.currentSlot = idx;
        }
      }

    } catch (e) {
      console.error('[SaveService] Init error:', e);
    }
  }

  // Subscribe auto-save to key events
  enableAutoSave() {
    // narrative completion or gm narrative without function call
    this.eventBus.on('ui:display:narrative', (data) => {
      try {
        const type = data?.type;
        const content = String(data?.content || '');
        const hasFunc = content.includes('<FUNCTION_CALL>');
        if (type === 'gm_continuation' || (type === 'gm_narrative' && !hasFunc)) {
          this._debounce(() => this._autoSave('叙述完成自动存档'), 1500);
        }
      } catch (e) {}
    }, 'game');

    // battle completed: immediate save
    this.eventBus.on('battle:completed', () => {
      this._autoSave('战斗完成自动存档');
    }, 'game');

    // state updates: throttle to avoid frequent writes
    this.eventBus.on('state:player:updated', () => {
      this._throttle(() => this._autoSave('状态更新自动存档'), 12000);
    }, 'game');

    this.eventBus.on('state:world:updated', () => {
      this._throttle(() => this._autoSave('状态更新自动存档'), 12000);
    }, 'game');
  }

  disableAutoSave() {
    // EventBus likely supports off(), but not implemented here.
    // As a minimal approach, clear timers.
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    if (this._throttleTimer) clearTimeout(this._throttleTimer);
    this._throttleLock = false;
  }

  // Construct snapshot from services
  makeSnapshot(label = '自动存档') {
    const gsService = this.locator.get('gameStateService');
    const invService = this.locator.get('inventoryService');
    const battleService = this.locator.get('battleService');

    if (!gsService) throw new Error('GameStateService not available');

    const state = gsService.getState();

    // flags: Map -> Array
    let flagsArr = [];
    try {
      if (state.gameFlags instanceof Map) {
        flagsArr = Array.from(state.gameFlags.entries());
      }
    } catch (e) {}

    const inventory = invService ? {
      items: invService.getAllItems(),
      maxSlots: invService.maxSlots
    } : { items: [], maxSlots: 20 };

    // 保存战斗状态，包括准备状态
    let battleData = {
      isInBattle: false,
      currentBattle: null,
      battleHistory: Array.isArray(state.battle?.battleHistory) ? JSON.parse(JSON.stringify(state.battle.battleHistory)) : [],
      battleState: null,
      hasPreparedBattle: false
    };

    if (battleService) {
      const currentBattleState = battleService.getBattleState();
      const isInBattle = battleService.isInBattle();
      
      if (currentBattleState) {
        battleData.battleState = JSON.parse(JSON.stringify(currentBattleState));
        battleData.hasPreparedBattle = !currentBattleState.isActive; // 如果不活跃则是准备状态
        battleData.isInBattle = isInBattle;
        
        // 保留关键日志用于调试战斗状态保存
        if (battleData.hasPreparedBattle || battleData.isInBattle) {
          console.log('[SaveService] 保存战斗状态:', {
            hasPreparedBattle: battleData.hasPreparedBattle,
            isInBattle: battleData.isInBattle
          });
        }
      }
    }

    // 保存UI战斗状态和商人交易状态：已完成的战斗ID和战斗计数器
    let uiState = {
      completedBattles: [],
      battleIdCounter: 0,
      completedMerchantTrades: [],
      merchantTradeIdCounter: 0
    };

    // 从GameView获取UI状态
    if (window.gameView) {
      try {
        uiState.completedBattles = Array.from(window.gameView.completedBattles || []);
        uiState.battleIdCounter = window.gameView.battleIdCounter || 0;
        uiState.completedMerchantTrades = Array.from(window.gameView.completedMerchantTrades || []);
        uiState.merchantTradeIdCounter = window.gameView.merchantTradeIdCounter || 0;
        console.log('[SaveService] 保存UI战斗和商人状态:', {
          completedBattles: uiState.completedBattles,
          battleIdCounter: uiState.battleIdCounter,
          completedMerchantTrades: uiState.completedMerchantTrades,
          merchantTradeIdCounter: uiState.merchantTradeIdCounter
        });
      } catch (e) {
        console.warn('[SaveService] 获取UI状态失败:', e);
      }
    }

    const snapshot = {
      version: this.VERSION,
      updatedAt: Date.now(),
      label,
      data: {
        gameState: {
          player: JSON.parse(JSON.stringify(state.player)),
          world: JSON.parse(JSON.stringify(state.world)),
          conversation: JSON.parse(JSON.stringify(state.conversation)),
          battle: battleData,
          flags: flagsArr,
          restCount: state.restCount || 0,
          actionsSinceLastRest: state.actionsSinceLastRest || 0
        },
        inventory,
        uiState
      }
    };

    return snapshot;
  }

  // Apply snapshot to services
  applySnapshot(snapshot) {
    if (!snapshot || !snapshot.data || !snapshot.data.gameState) {
      throw new Error('Invalid snapshot structure');
    }
    const gsService = this.locator.get('gameStateService');
    const invService = this.locator.get('inventoryService');
    const battleService = this.locator.get('battleService');

    if (!gsService) throw new Error('GameStateService not available');

    const gs = gsService.getState();
    const s = snapshot.data.gameState;

    // Apply core state
    gs.player = JSON.parse(JSON.stringify(s.player || gs.player));
    gs.world = JSON.parse(JSON.stringify(s.world || gs.world));
    gs.conversation = JSON.parse(JSON.stringify(s.conversation || gs.conversation));
    
    // 恢复战斗状态
    gs.battle = {
      isInBattle: s.battle?.isInBattle || false,
      currentBattle: s.battle?.currentBattle || null,
      battleHistory: Array.isArray(s.battle?.battleHistory) ? JSON.parse(JSON.stringify(s.battle.battleHistory)) : []
    };
    
    // 恢复休息系统数据
    gs.restCount = s.restCount || 0;
    gs.actionsSinceLastRest = s.actionsSinceLastRest || 0;

    // 恢复战斗服务状态
    if (battleService && s.battle?.battleState) {
      try {
        const battleState = JSON.parse(JSON.stringify(s.battle.battleState));
        battleService.battleState = battleState;
        
        // 如果是准备状态，不设置 currentBattle
        if (s.battle.hasPreparedBattle && !battleState.isActive) {
          battleService.currentBattle = null;
          console.log('[SaveService] 恢复战斗准备状态');
        } else if (s.battle.isInBattle && battleState.isActive) {
          battleService.currentBattle = battleState;
          console.log('[SaveService] 恢复活跃战斗状态');
        } else {
          battleService.currentBattle = null;
        }
      } catch (e) {
        console.warn('[SaveService] Failed to restore battle state:', e);
      }
    }

    // Restore flags
    try {
      const flagsArr = Array.isArray(s.flags) ? s.flags : [];
      gs.gameFlags = new Map(flagsArr);
    } catch (e) {
      console.warn('[SaveService] Failed to restore flags:', e);
      gs.gameFlags = new Map();
    }

    // Apply inventory
    if (invService && snapshot.data.inventory) {
      try {
        // rebuild inventory silently (avoid "获得物品" notifications spam)
        const items = snapshot.data.inventory.items || [];
        const maxSlots = snapshot.data.inventory.maxSlots || invService.maxSlots;
        invService.maxSlots = maxSlots;

        // build a new Map with item data merged
        const newInv = new Map();
        for (const it of items) {
          const base = invService.getItemData(it.name) || {};
          newInv.set(it.name, {
            ...base,
            quantity: it.quantity ?? 1
          });
        }
        invService.inventory = newInv;

        // emit updated to refresh UI grid if open
        this.eventBus.emit('inventory:updated', { action: 'load' }, 'game');
      } catch (e) {
        console.error('[SaveService] Failed to restore inventory:', e);
      }
    }

    // 恢复UI状态：已完成的战斗和商人交易、计数器
    if (snapshot.data.uiState && window.gameView) {
      try {
        const uiState = snapshot.data.uiState;
        console.log('[SaveService] 准备恢复UI状态:', {
          savedCompletedBattles: uiState.completedBattles,
          savedBattleIdCounter: uiState.battleIdCounter,
          savedCompletedMerchantTrades: uiState.completedMerchantTrades,
          savedMerchantTradeIdCounter: uiState.merchantTradeIdCounter
        });
        
        // 恢复战斗状态
        window.gameView.completedBattles = new Set(uiState.completedBattles || []);
        window.gameView.battleIdCounter = uiState.battleIdCounter || 0;
        
        // 恢复商人交易状态
        window.gameView.completedMerchantTrades = new Set(uiState.completedMerchantTrades || []);
        window.gameView.merchantTradeIdCounter = uiState.merchantTradeIdCounter || 0;
        
        console.log('[SaveService] 恢复UI状态完成:', {
          restoredCompletedBattles: Array.from(window.gameView.completedBattles),
          restoredBattleIdCounter: window.gameView.battleIdCounter,
          restoredCompletedMerchantTrades: Array.from(window.gameView.completedMerchantTrades),
          restoredMerchantTradeIdCounter: window.gameView.merchantTradeIdCounter
        });
      } catch (e) {
        console.warn('[SaveService] Failed to restore UI state:', e);
      }
    } else {
      console.warn('[SaveService] 无法恢复UI状态:', {
        hasUiState: !!snapshot.data.uiState,
        hasGameView: !!window.gameView
      });
    }

    // Emit updates to refresh UI
    this.eventBus.emit('state:player:updated', gs.player, 'game');
    this.eventBus.emit('state:world:updated', gs.world, 'game');

    // 发送存档加载完成事件，触发UI恢复
    const saveLoadedData = {
      slot: this.currentSlot,
      hasPreparedBattle: s.battle?.hasPreparedBattle || false,
      isInBattle: s.battle?.isInBattle || false,
      uiState: snapshot.data.uiState || null
    };
    
    console.log('[SaveService] 发送存档加载完成事件:', saveLoadedData);
    this.eventBus.emit('save:loaded', saveLoadedData, 'game');

    // Notify
    this.eventBus.emit('ui:notification', {
      message: '🎮 存档已加载',
      type: 'success'
    }, 'game');
  }

  // Save to a specific slot
  saveToSlot(slotIndex, options = {}) {
    if (!this._checkSlotIndex(slotIndex)) {
      return { success: false, error: 'Invalid slot index' };
    }
    try {
      const snapshot = this.makeSnapshot(options.label || '手动存档');
      const key = this._slotKey(slotIndex);
      localStorage.setItem(key, JSON.stringify(snapshot));
      localStorage.setItem(`${this.STORAGE_PREFIX}last_slot`, String(slotIndex));
      this.currentSlot = slotIndex;

      this.eventBus.emit('ui:notification', {
        message: `💾 存档已保存到槽位 ${slotIndex + 1}`,
        type: 'success'
      }, 'game');

      this.eventBus.emit('save:completed', { slot: slotIndex, snapshot }, 'game');
      return { success: true };
    } catch (e) {
      console.error('[SaveService] saveToSlot error:', e);
      this.eventBus.emit('ui:notification', {
        message: '❌ 存档保存失败',
        type: 'error'
      }, 'game');
      return { success: false, error: String(e) };
    }
  }

  // Load from a specific slot
  loadFromSlot(slotIndex) {
    if (!this._checkSlotIndex(slotIndex)) {
      return { success: false, error: 'Invalid slot index' };
    }
    try {
      const key = this._slotKey(slotIndex);
      const raw = localStorage.getItem(key);
      if (!raw) {
        return { success: false, error: 'Empty slot' };
      }
      const snapshot = JSON.parse(raw);
      if (!snapshot || snapshot.version !== this.VERSION) {
        // For now, reject incompatible versions
        return { success: false, error: 'Version incompatible or invalid snapshot' };
      }
      this.applySnapshot(snapshot);
      localStorage.setItem(`${this.STORAGE_PREFIX}last_slot`, String(slotIndex));
      this.currentSlot = slotIndex;

      // 注意：save:loaded 事件已在 applySnapshot 中发送，不需要重复发送
      return { success: true };
    } catch (e) {
      console.error('[SaveService] loadFromSlot error:', e);
      this.eventBus.emit('ui:notification', {
        message: '❌ 存档加载失败',
        type: 'error'
      }, 'game');
      return { success: false, error: String(e) };
    }
  }

  // Delete slot
  deleteSlot(slotIndex) {
    if (!this._checkSlotIndex(slotIndex)) {
      return { success: false, error: 'Invalid slot index' };
    }
    try {
      localStorage.removeItem(this._slotKey(slotIndex));
      localStorage.removeItem(this._slotMetaKey(slotIndex));
      if (this.currentSlot === slotIndex) {
        this.currentSlot = null;
        localStorage.removeItem(`${this.STORAGE_PREFIX}last_slot`);
      }
      this.eventBus.emit('ui:notification', {
        message: `🗑️ 已删除槽位 ${slotIndex + 1} 存档`,
        type: 'info'
      }, 'game');
      return { success: true };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  }

  // List all saves with summary
  listSaves() {
    const list = [];
    for (let i = 0; i < this.SLOT_COUNT; i++) {
      try {
        const raw = localStorage.getItem(this._slotKey(i));
        if (!raw) {
          list.push(null);
          continue;
        }
        const snap = JSON.parse(raw);
        const player = snap?.data?.gameState?.player || {};
        const world = snap?.data?.gameState?.world || {};
        list.push({
          index: i,
          updatedAt: snap.updatedAt || 0,
          label: snap.label || `槽位${i + 1}`,
          summary: {
            name: player.name,
            level: player.level,
            location: world.currentLocation
          }
        });
      } catch (e) {
        list.push(null);
      }
    }
    return list;
  }

  // Get latest slot by updatedAt
  getLatestSlot() {
    let latest = null;
    for (let i = 0; i < this.SLOT_COUNT; i++) {
      try {
        const raw = localStorage.getItem(this._slotKey(i));
        if (!raw) continue;
        const snap = JSON.parse(raw);
        if (!latest || (snap.updatedAt || 0) > (latest.meta.updatedAt || 0)) {
          latest = {
            index: i,
            meta: {
              updatedAt: snap.updatedAt || 0,
              label: snap.label || `槽位${i + 1}`
            }
          };
        }
      } catch (e) {}
    }
    return latest;
  }

  // Export slot as downloadable JSON
  exportSlot(slotIndex) {
    try {
      const raw = localStorage.getItem(this._slotKey(slotIndex));
      if (!raw) {
        this.eventBus.emit('ui:notification', {
          message: '该槽位为空，无法导出',
          type: 'warning'
        }, 'game');
        return { success: false, error: 'Empty slot' };
      }
      const blob = new Blob([raw], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const dt = new Date();
      const name = `save-slot-${slotIndex + 1}-${dt.getFullYear()}${String(dt.getMonth()+1).padStart(2,'0')}${String(dt.getDate()).padStart(2,'0')}-${String(dt.getHours()).padStart(2,'0')}${String(dt.getMinutes()).padStart(2,'0')}.json`;
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.eventBus.emit('ui:notification', {
        message: '📦 存档已导出',
        type: 'success'
      }, 'game');
      return { success: true };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  }

  // Import snapshot JSON content into a slot
  importToSlot(fileContent, targetSlotIndex = null) {
    try {
      const snap = JSON.parse(fileContent);
      if (!snap || !snap.version || !snap.data) {
        return { success: false, error: 'Invalid file format' };
      }
      if (snap.version !== this.VERSION) {
        // Optionally migrate here; for now reject
        return { success: false, error: 'Version incompatible' };
      }

      let slot = targetSlotIndex;
      if (slot === null || !this._checkSlotIndex(slot)) {
        // find first empty slot
        slot = this._firstEmptySlot();
        if (slot === null) slot = 0; // fallback
      }

      localStorage.setItem(this._slotKey(slot), JSON.stringify(snap));
      localStorage.setItem(`${this.STORAGE_PREFIX}last_slot`, String(slot));
      this.currentSlot = slot;

      this.eventBus.emit('ui:notification', {
        message: `📥 存档已导入到槽位 ${slot + 1}`,
        type: 'success'
      }, 'game');

      return { success: true, slot };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  }

  // Start a brand new game
  startNewGame() {
    const gsService = this.locator.get('gameStateService');
    const invService = this.locator.get('inventoryService');
    const battleService = this.locator.get('battleService');
    
    if (!gsService) {
      this.eventBus.emit('ui:notification', {
        message: '无法重置游戏状态',
        type: 'error'
      }, 'game');
      return { success: false };
    }

    try {
      // Replace GameState instance to default
      gsService.gameState = new GameState();

      // Clear inventory and reinitialize with default items
      if (invService) {
        invService.clearInventory();
        invService.initializeDefaultItems();
      }

      // 完全清除战斗状态
      gsService.gameState.updateBattleState({
        isInBattle: false,
        currentBattle: null
      });

      // 清除 BattleService 中的战斗准备状态
      if (battleService) {
        battleService.currentBattle = null;
        battleService.battleState = null;
        console.log('[SaveService] 已清除战斗服务状态');
      }

      // emit updates
      this.eventBus.emit('state:player:updated', gsService.getState().player, 'game');
      this.eventBus.emit('state:world:updated', gsService.getState().world, 'game');

      // 发送新游戏开始事件，通知UI重置状态
      this.eventBus.emit('game:new-game:started', {
        resetUI: true
      }, 'game');

      // clear last slot context
      localStorage.removeItem(`${this.STORAGE_PREFIX}last_slot`);
      this.currentSlot = null;

      this.eventBus.emit('ui:notification', {
        message: '🌱 已开始新的冒险',
        type: 'info'
      }, 'game');

      return { success: true };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  }

  // Internal helpers

  _slotKey(i) {
    return `${this.STORAGE_PREFIX}slot_${i}`;
  }
  _slotMetaKey(i) {
    return `${this.STORAGE_PREFIX}save_meta_${i}`;
  }
  _checkSlotIndex(i) {
    return Number.isInteger(i) && i >= 0 && i < this.SLOT_COUNT;
  }
  _firstEmptySlot() {
    for (let i = 0; i < this.SLOT_COUNT; i++) {
      if (!localStorage.getItem(this._slotKey(i))) return i;
    }
    return null;
  }

  _debounce(fn, ms) {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      this._debounceTimer = null;
      try { fn(); } catch (e) {}
    }, ms);
  }

  _throttle(fn, ms) {
    if (this._throttleLock) return;
    this._throttleLock = true;
    try { fn(); } catch (e) {}
    this._throttleTimer = setTimeout(() => {
      this._throttleLock = false;
    }, ms);
  }

  _autoSave(reason = '自动存档') {
    try {
      // choose slot strategy
      let slot = this.currentSlot;
      if (!this._checkSlotIndex(slot)) {
        const lastStr = localStorage.getItem(`${this.STORAGE_PREFIX}last_slot`);
        if (lastStr !== null) {
          const idx = parseInt(lastStr, 10);
          if (this._checkSlotIndex(idx)) slot = idx;
        }
      }
      if (!this._checkSlotIndex(slot)) {
        // first empty slot or 0
        slot = this._firstEmptySlot();
        if (slot === null) slot = 0;
      }

      const res = this.saveToSlot(slot, { label: reason });
      if (!res.success) {
        console.warn('[SaveService] Auto-save failed:', res.error);
      }
    } catch (e) {
      console.warn('[SaveService] Auto-save error:', e);
    }
  }
}

export default SaveService;