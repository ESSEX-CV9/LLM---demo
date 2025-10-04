// core/GameCore.js - 完整的修复版本
import EventBus from './EventBus.js';
import ServiceLocator from './ServiceLocator.js';
import GameState from '../models/GameState.js';
import LLMService from '../services/LLMService.js';
import FunctionCallService from '../services/FunctionCallService.js';
import GameStateService from '../services/GameStateService.js';
import ConversationService from '../services/ConversationService.js';
import BattleService from '../services/BattleService.js';
import InventoryService from '../services/InventoryService.js';
import SkillService from '../services/SkillService.js';
import EquipmentService from '../services/EquipmentService.js';
import EquipmentEffectService from '../services/EquipmentEffectService.js';
import WeaponService from '../services/WeaponService.js';
import EffectManager from '../services/EffectManager.js';
import EnemyTemplates from '../data/EnemyTemplates.js';
import itemsDB from '../data/Items.js';
import SaveService from '../services/SaveService.js';
import GameController from '../controllers/GameController.js';
import GameView from '../views/GameView.js';
import SkillsView from '../views/SkillsView.js';

class GameCore {
    constructor() {
        this.serviceLocator = new ServiceLocator();
        this.eventBus = new EventBus();
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) {
            console.warn('GameCore already initialized');
            return;
        }

        try {
            console.log('[GameCore] Initializing...');
            
            this.registerCoreServices();
            await this.initializeServices();
            this.createControllers();
            this.createViews();
            this.setupErrorHandling();
            
            this.initialized = true;
            console.log('[GameCore] Initialization complete');
            
            this.eventBus.emit('core:initialized', {}, 'system');
            
        } catch (error) {
            console.error('[GameCore] Initialization failed:', error);
            throw error;
        }
    }

    registerCoreServices() {
        this.serviceLocator.register('eventBus', this.eventBus);
        this.serviceLocator.register('gameStateService', new GameStateService(this.eventBus));
        this.serviceLocator.register('llmService', new LLMService(this.eventBus));
        this.serviceLocator.register('functionCallService', new FunctionCallService(this.eventBus));
        this.serviceLocator.register('conversationService', new ConversationService(this.eventBus));
        this.serviceLocator.register('effectManager', new EffectManager(this.eventBus));
        this.serviceLocator.register('battleService', new BattleService(this.eventBus));
        this.serviceLocator.register('inventoryService', new InventoryService(this.eventBus));
        this.serviceLocator.register('skillService', new SkillService(this.eventBus));
        this.serviceLocator.register('equipmentService', new EquipmentService(this.eventBus));
        this.serviceLocator.register('equipmentEffectService', new EquipmentEffectService(this.eventBus));
        this.serviceLocator.register('weaponService', new WeaponService(this.eventBus));
        this.serviceLocator.register('enemyTemplates', new EnemyTemplates());
        this.serviceLocator.register('itemsDB', itemsDB);
        this.serviceLocator.register('saveService', new SaveService(this.eventBus, this.serviceLocator));
        
        // 确保 itemsDB 在全局可用
        window.itemsDB = itemsDB;
        this.itemsDB = itemsDB;
    }

    async initializeServices() {
        const gameStateService = this.serviceLocator.get('gameStateService');
        const saveService = this.serviceLocator.get('saveService');
        if (saveService) {
            saveService.init();
            saveService.enableAutoSave();
        }
    }

    createControllers() {
        const gameController = new GameController(this.serviceLocator, this.eventBus);
        this.serviceLocator.register('gameController', gameController);
    }

    createViews() {
        const gameView = new GameView(this.eventBus);
        this.serviceLocator.register('gameView', gameView);
        window.gameView = gameView;

        const skillsView = new SkillsView(this.eventBus);
        this.serviceLocator.register('skillsView', skillsView);
        window.skillsView = skillsView;
    }

    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('[GameCore] Global error:', event.error);
            this.eventBus.emit('core:error', { error: event.error }, 'system');
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('[GameCore] Unhandled promise rejection:', event.reason);
            this.eventBus.emit('core:promise:rejected', { reason: event.reason }, 'system');
        });
    }

    getService(name) {
        return this.serviceLocator.get(name);
    }

    shutdown() {
        this.eventBus.emit('core:shutdown', {}, 'system');
        this.serviceLocator.services.clear();
        this.initialized = false;
    }
}

export default GameCore;