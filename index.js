// index.js
import EventBus from './core/EventBus.js';
import ServiceLocator from './core/ServiceLocator.js';
import GameState from './models/GameState.js';
import LLMService from './services/LLMService.js';
import FunctionCallService from './services/FunctionCallService.js';
import GameStateService from './services/GameStateService.js';
import GameController from './controllers/GameController.js';
import GameView from './views/GameView.js';
import GameCore from './core/GameCore.js';

(async () => {
    try {
        if (typeof window.callGenerate !== 'function') {
            throw new Error('callGenerate function not available...');
        }
        
        console.log('LLM Game Demo starting...');
        
        const gameCore = new GameCore();
        await gameCore.initialize();
        
        window.gameCore = gameCore;
        console.log('Game ready!');
        
    } catch (error) {
        console.error('Failed to start game:', error);
        // 错误处理
    }
})();