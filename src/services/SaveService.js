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

    const snapshot = {
      version: this.VERSION,
      updatedAt: Date.now(),
      label,
      data: {
        gameState: {
          player: JSON.parse(JSON.stringify(state.player)),
          world: JSON.parse(JSON.stringify(state.world)),
          conversation: JSON.parse(JSON.stringify(state.conversation)),
          battle: {
            // Phase 1: do not persist active battle; only keep history if needed
            isInBattle: false,
            currentBattle: null,
            battleHistory: Array.isArray(state.battle?.battleHistory) ? JSON.parse(JSON.stringify(state.battle.battleHistory)) : []
          },
          flags: flagsArr
        },
        inventory
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

    if (!gsService) throw new Error('GameStateService not available');

    const gs = gsService.getState();
    const s = snapshot.data.gameState;

    // Apply core state
    gs.player = JSON.parse(JSON.stringify(s.player || gs.player));
    gs.world = JSON.parse(JSON.stringify(s.world || gs.world));
    gs.conversation = JSON.parse(JSON.stringify(s.conversation || gs.conversation));
    gs.battle = {
      isInBattle: false,
      currentBattle: null,
      battleHistory: Array.isArray(s.battle?.battleHistory) ? JSON.parse(JSON.stringify(s.battle.battleHistory)) : []
    };

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

    // Emit updates to refresh UI
    this.eventBus.emit('state:player:updated', gs.player, 'game');
    this.eventBus.emit('state:world:updated', gs.world, 'game');

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

      this.eventBus.emit('save:loaded', { slot: slotIndex }, 'game');
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

      // Clear inventory
      if (invService) {
        invService.clearInventory();
      }

      // Force no battle
      gsService.gameState.updateBattleState({
        isInBattle: false,
        currentBattle: null
      });

      // emit updates
      this.eventBus.emit('state:player:updated', gsService.getState().player, 'game');
      this.eventBus.emit('state:world:updated', gsService.getState().world, 'game');

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